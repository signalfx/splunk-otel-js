#include "profiling.h"
#include "khash.h"
#include "memory_profiling.h"
#include "tinystl/vector.h"
#include "util/arena.h"
#include "util/hex.h"
#include "util/modp_numtoa.h"
#include "util/platform.h"
#include "xxhash/xxh3.h"
#include <cstdint>
#include <inttypes.h>
#include <nan.h>
#include <stdio.h>
#include <v8-profiler.h>

/* Collecting debug info is not compiled in by default to reduce memory usage.
 */
#define PROFILER_DEBUG_EXPORT 0

namespace Splunk {
namespace Profiling {

namespace {

/* Nanoseconds each activation bin represents. */
const int64_t kActivationBinWidth = 100L * 1000000L;
/**
 * Span activations are grouped into chains of bins,
 * where each bin represents a small time period, e.g. 100ms.
 * This is done to ease matching against stacktrace timestamps
 * without requiring more complicated data structures (interval trees)
 * or matching against the whole profiling period.
 */
const int64_t kActivationsPerBin = 64;
const int64_t kBinsPerActivationPeriod = 384;

struct SpanActivation {
  char traceId[32];
  char spanId[16];
  int64_t startTime;
  int64_t endTime;
#if PROFILER_DEBUG_EXPORT
  int32_t depth;
  bool is_intersected;
#endif
};

struct ActivationPeriod;

struct ActivationBin {
  SpanActivation activations[kActivationsPerBin];
  int64_t count;
  int32_t index;
  ActivationPeriod *period;
  ActivationBin *next;
};

struct ActivationPeriod {
  ActivationBin activationBins[kBinsPerActivationPeriod];
  ActivationPeriod *next;
};

/* Only used while tracking activations */
struct ActivationStack {
  static const int32_t kMaxActivations = 2;
  int32_t count;
  int32_t capacity;
  SpanActivation activations[kMaxActivations];
  SpanActivation *extra;
};

void ActivationStackInit(ActivationStack *stack) {
  memset(stack, 0, sizeof(ActivationStack));
  stack->capacity = ActivationStack::kMaxActivations;
}

SpanActivation *ActivationStackPush(ActivationStack *stack, PagedArena *arena) {
  if (!stack->extra) {
    if (stack->count < ActivationStack::kMaxActivations) {
      return &stack->activations[stack->count++];
    }

    int32_t newCapacity = ActivationStack::kMaxActivations * 4;
    stack->extra = (SpanActivation *)PagedArenaAlloc(
        arena, sizeof(SpanActivation) * newCapacity);

    if (!stack->extra) {
      return nullptr;
    }

    for (int32_t i = 0; i < stack->count; i++) {
      stack->extra[i] = stack->activations[i];
    }

    stack->capacity = newCapacity;
  }

  if (stack->count < stack->capacity) {
    return &stack->extra[stack->count++];
  }

  int32_t newCapacity = stack->capacity * 1.5;
  SpanActivation *extra = (SpanActivation *)PagedArenaAlloc(
      arena, sizeof(SpanActivation) * newCapacity);

  if (!extra) {
    return nullptr;
  }

  for (int32_t i = 0; i < stack->count; i++) {
    extra[i] = stack->extra[i];
  }

  stack->extra = extra;
  stack->capacity = newCapacity;

  return &stack->extra[stack->count++];
}

SpanActivation *ActivationStackPop(ActivationStack *stack) {
  if (stack->count == 0) {
    return nullptr;
  }

  int32_t index = stack->count - 1;
  stack->count--;

  if (!stack->extra) {
    return &stack->activations[index];
  }

  return &stack->extra[index];
}

KHASH_MAP_INIT_INT(ActivationStack, ActivationStack);
KHASH_SET_INIT_INT64(TraceIdFilter);

// Maximum offset in nanoseconds from profiling start from which a sample is
// considered always valid.
const int64_t DEFAULT_MAX_SAMPLE_CUTOFF_DELAY_NANOS = 500LL * 1000LL * 1000LL;

struct Profiling {
  PagedArena arena;
  ActivationPeriod *activationPeriod;
  v8::CpuProfiler *profiler;
  int64_t wallStartTime;
  int64_t startTime;
  int64_t maxSampleCutoffDelayNanos;
  // Point in time before which a sample is considered invalid, necessary to
  // avoid biases with self-sampling.
  int64_t sampleCutoffPoint;
  int32_t activationDepth;
  bool running;
  bool recordDebugInfo;
  bool onlyFilteredStacktraces;
  int64_t samplingIntervalNanos;
  int32_t profilerSeq;
  int32_t handle;
  khash_t(ActivationStack) * spanActivations;
  khash_t(TraceIdFilter) * traceIdFilter;
  // The name/prefix given via JS.
  char name[64];

  bool ShouldRecordDebugInfo() const { return recordDebugInfo; }
};

struct ProfilingGlobals {
  tinystl::vector<Profiling *> profilers;
  int32_t handle = 0;

  void Init() { handle = 0; }

  Profiling *NewProfiling() {
    Profiling *profiling = (Profiling *)calloc(1, sizeof(Profiling));

    if (profiling) {
      profiling->handle = handle++;
      profilers.push_back(profiling);
    }

    return profiling;
  }
};

ProfilingGlobals globals;

Profiling *GetProfilingByHandle(int32_t handle) {
  for (size_t i = 0; i < globals.profilers.size(); i++) {
    Profiling *profiling = globals.profilers[i];

    if (profiling->handle == handle) {
      return profiling;
    }
  }

  return nullptr;
}

Profiling *GetProfilingByName(const char *name, size_t name_length) {
  for (size_t i = 0; i < globals.profilers.size(); i++) {
    Profiling *profiling = globals.profilers[i];

    size_t len = strlen(profiling->name);

    if (len == name_length && memcmp(profiling->name, name, len) == 0) {
      return profiling;
    }
  }

  return nullptr;
}

void ProfilingInit(Profiling *profiling, const char *name, size_t name_length) {
  const size_t kArenaPageSize = 1024ULL * 1024ULL * 64ULL;
  PagedArenaInit(&profiling->arena, kArenaPageSize);
  profiling->spanActivations = kh_init(ActivationStack);
  profiling->traceIdFilter = kh_init(TraceIdFilter);

  snprintf(profiling->name, sizeof(profiling->name), "%.*s", (int)name_length,
           name);
}

void *ArenaAlloc(Profiling *profiling, size_t size) {
  return PagedArenaAlloc(&profiling->arena, size);
}

ActivationPeriod *NewActivationPeriod(Profiling *profiling) {
  ActivationPeriod *period =
      (ActivationPeriod *)ArenaAlloc(profiling, sizeof(ActivationPeriod));

  if (!period) {
    return nullptr;
  }

  int32_t index = 0;
  for (ActivationBin &bin : period->activationBins) {
    bin.index = index++;
    bin.period = period;
  }

  return period;
}

int64_t ActivationBinIndex(Profiling *profiling, int64_t timestamp) {
  int64_t delta = timestamp - profiling->startTime;
  return delta / kActivationBinWidth;
}

ActivationBin *ProfilingGetActivationBin(Profiling *profiling,
                                         int64_t binIndex) {
  int64_t periodIndex = binIndex / kBinsPerActivationPeriod;

  int64_t currentPeriod = 0;

  ActivationPeriod *period = profiling->activationPeriod;
  while (currentPeriod < periodIndex) {
    if (period->next) {
      period = period->next;
    } else {
      ActivationPeriod *newPeriod = NewActivationPeriod(profiling);
      period->next = newPeriod;
      period = newPeriod;
    }
    currentPeriod++;
  }

  int64_t index = binIndex - periodIndex * kBinsPerActivationPeriod;

  return &period->activationBins[index];
}

SpanActivation *FindClosestActivation(Profiling *profiling, int64_t ts) {
  SpanActivation *t = nullptr;
  ActivationBin *bin =
      ProfilingGetActivationBin(profiling, ActivationBinIndex(profiling, ts));

  while (bin) {
    for (int64_t i = 0; i < bin->count; i++) {
      SpanActivation *activation = &bin->activations[i];
      if (activation->startTime <= ts && ts <= activation->endTime) {
        if (!t || activation->startTime > t->startTime) {
          t = activation;
        }
      }
    }
    bin = bin->next;
  }

  return t;
}

void BinInsertActivation(Profiling *profiling, ActivationBin *bin,
                         SpanActivation *activation) {
  // Iterate until last bin
  while (bin->next) {
    bin = bin->next;
  }

  // If the last bin is empty, expand
  if (bin->count == kActivationsPerBin) {
    ActivationBin *newBin =
        (ActivationBin *)ArenaAlloc(profiling, sizeof(ActivationBin));

    if (!newBin) {
      return;
    }

    newBin->index = bin->index;
    newBin->period = bin->period;
    bin->next = newBin;
    bin = newBin;
  }

  bin->activations[bin->count++] = *activation;
}

void InsertActivation(Profiling *profiling, SpanActivation *activation) {
  int64_t startBinIndex = ActivationBinIndex(profiling, activation->startTime);
  int64_t endBinIndex = ActivationBinIndex(profiling, activation->endTime);

  {
    ActivationBin *startBin =
        ProfilingGetActivationBin(profiling, startBinIndex);
    BinInsertActivation(profiling, startBin, activation);
  }

  // Spread the activation into overlapping bins
  for (int64_t i = startBinIndex + 1; i <= endBinIndex; i++) {
    ActivationBin *bin = ProfilingGetActivationBin(profiling, i);
    BinInsertActivation(profiling, bin, activation);
  }
}

void V8StartProfiling(v8::CpuProfiler *profiler, const char *title) {
  v8::Local<v8::String> v8Title = Nan::New(title).ToLocalChecked();
  const bool recordSamples = true;
  profiler->StartProfiling(v8Title, v8::kLeafNodeLineNumbers, recordSamples,
                           v8::CpuProfilingOptions::kNoSampleLimit);
}

void ProfileTitle(char *buffer, size_t length, const char *prefix,
                  int32_t sequence) {
  snprintf(buffer, length, "%s-%d", prefix, sequence);
}

struct ProfilingOptions {
  int32_t samplingIntervalMicros;
  bool recordDebugInfo;
  bool onlyFilteredStacktraces;
  int64_t maxSampleCutoffDelayNanos;
  char name[64];
  size_t name_length;
};

Profiling *SetupProfiling(const ProfilingOptions *options,
                          v8::Isolate *isolate) {
  Profiling *profiling = globals.NewProfiling();

  if (!profiling) {
    return nullptr;
  }

  ProfilingInit(profiling, options->name, options->name_length);
  profiling->profiler = v8::CpuProfiler::New(isolate);

  PagedArenaReset(&profiling->arena);
  profiling->activationPeriod = NewActivationPeriod(profiling);

  if (!profiling->activationPeriod) {
    globals.profilers.pop_back();
    free(profiling);
    return nullptr;
  }

  profiling->recordDebugInfo = options->recordDebugInfo;
  profiling->onlyFilteredStacktraces = options->onlyFilteredStacktraces;
  profiling->maxSampleCutoffDelayNanos = options->maxSampleCutoffDelayNanos;
  profiling->samplingIntervalNanos =
      int64_t(options->samplingIntervalMicros) * 1000L;
  profiling->profiler->SetSamplingInterval(options->samplingIntervalMicros);

  return profiling;
}

// Will return false if a JS error is thrown.
bool CreateCpuProfilingOptions(const Nan::FunctionCallbackInfo<v8::Value> &info,
                               ProfilingOptions *profilingOptions) {
  memset(profilingOptions, 0, sizeof(*profilingOptions));

  if (info.Length() < 1 || !info[0]->IsObject()) {
    Nan::ThrowError("CpuProfiler: invalid argument.");
    return false;
  }

  auto options = Nan::To<v8::Object>(info[0]).ToLocalChecked();

  auto maybeName = Nan::Get(options, Nan::New("name").ToLocalChecked());

  if (maybeName.IsEmpty() || !maybeName.ToLocalChecked()->IsString()) {
    Nan::ThrowError("CpuProfiler: name required.");
    return false;
  }

  auto profilerName =
      Nan::To<v8::String>(maybeName.ToLocalChecked()).ToLocalChecked();

  if (profilerName->Length() == 0) {
    Nan::ThrowError("CpuProfiler: name can't be empty.");
    return false;
  }

  if (profilerName->Length() > (int64_t)sizeof(profilingOptions->name)) {
    Nan::ThrowError("StartProfiling: name does not fit 64 bytes.");
    return false;
  }

  v8::String::Utf8Value profilerNameUtf8(info.GetIsolate(), profilerName);

  Profiling *existing =
      GetProfilingByName(*profilerNameUtf8, profilerNameUtf8.length());

  if (existing) {
    Nan::ThrowError("CpuProfiler: profiler already exists.");
    return false;
  }

  auto maybeInterval = Nan::Get(
      options, Nan::New("samplingIntervalMicroseconds").ToLocalChecked());

  if (maybeInterval.IsEmpty() || !maybeInterval.ToLocalChecked()->IsNumber()) {
    Nan::ThrowError(
        "CpuProfiler: samplingIntervalMicroseconds is not a number.");
    return false;
  }

  int32_t samplingIntervalMicros =
      Nan::To<int32_t>(maybeInterval.ToLocalChecked()).FromJust();

  auto maybeRecordDebugInfo =
      Nan::Get(options, Nan::New("recordDebugInfo").ToLocalChecked());
  bool recordDebugInfo = false;

  if (!maybeRecordDebugInfo.IsEmpty() &&
      maybeRecordDebugInfo.ToLocalChecked()->IsBoolean()) {
    if (Nan::To<bool>(maybeRecordDebugInfo.ToLocalChecked()).FromJust()) {
      recordDebugInfo = true;
    }
  }

  auto maybeOnlyFilteredStacktraces =
      Nan::Get(options, Nan::New("onlyFilteredStacktraces").ToLocalChecked());

  bool onlyFilteredStacktraces = false;

  if (!maybeOnlyFilteredStacktraces.IsEmpty() &&
      maybeOnlyFilteredStacktraces.ToLocalChecked()->IsBoolean()) {
    if (Nan::To<bool>(maybeOnlyFilteredStacktraces.ToLocalChecked())
            .FromJust()) {
      onlyFilteredStacktraces = true;
    }
  }

  auto maybeMaxSampleCutoffDelay = Nan::Get(
      options, Nan::New("maxSampleCutoffDelayMicroseconds").ToLocalChecked());
  int64_t maxSampleCutoffDelayNanos = DEFAULT_MAX_SAMPLE_CUTOFF_DELAY_NANOS;

  if (!maybeMaxSampleCutoffDelay.IsEmpty() &&
      maybeMaxSampleCutoffDelay.ToLocalChecked()->IsNumber()) {
    int64_t maxSampleCutoffDelayMicros =
        Nan::To<int64_t>(maybeMaxSampleCutoffDelay.ToLocalChecked()).FromJust();
    maxSampleCutoffDelayNanos = maxSampleCutoffDelayMicros * 1000LL;
  }

  profilingOptions->samplingIntervalMicros = samplingIntervalMicros;
  profilingOptions->maxSampleCutoffDelayNanos = maxSampleCutoffDelayNanos;
  profilingOptions->recordDebugInfo = recordDebugInfo;
  profilingOptions->onlyFilteredStacktraces = onlyFilteredStacktraces;
  memcpy(profilingOptions->name, *profilerNameUtf8, profilerNameUtf8.length());
  profilingOptions->name_length = profilerNameUtf8.length();

  return true;
}

NAN_METHOD(CreateCpuProfiler) {
  ProfilingOptions opts;
  if (!CreateCpuProfilingOptions(info, &opts)) {
    // Error was thrown.
    return;
  }

  Profiling *profiling = SetupProfiling(&opts, info.GetIsolate());

  if (!profiling) {
    Nan::ThrowError("CreateCpuProfiler: unable to allocate profiler.");
    return;
  }

  info.GetReturnValue().Set(profiling->handle);
}

NAN_METHOD(StartCpuProfiler) {
  auto handle = Nan::To<int32_t>(info[0]).ToChecked();

  Profiling *profiling = GetProfilingByHandle(handle);

  if (!profiling) {
    info.GetReturnValue().Set(false);
    return;
  }

  if (profiling->running) {
    info.GetReturnValue().Set(false);
    return;
  }

  char title[128];
  ProfileTitle(title, sizeof(title), profiling->name, profiling->profilerSeq);

  profiling->activationDepth = 0;
  profiling->startTime = HrTime();
  profiling->wallStartTime = MicroSecondsSinceEpoch() * 1000L;
  V8StartProfiling(profiling->profiler, title);
  profiling->sampleCutoffPoint = HrTime();
  profiling->running = true;

  info.GetReturnValue().Set(true);
  return;
}

NAN_METHOD(AddTraceIdFilter) {
  info.GetReturnValue().SetUndefined();

  if (info.Length() < 2 || !info[1]->IsString()) {
    return;
  }

  auto handle = Nan::To<int32_t>(info[0]).ToChecked();

  Profiling *profiling = GetProfilingByHandle(handle);

  if (!profiling) {
    return;
  }

  auto traceId = Nan::MaybeLocal<v8::String>(info[1].As<v8::String>()).ToLocalChecked();
  //auto traceId = Nan::To<v8::String>(info[1]).ToLocalChecked();
  v8::String::Utf8Value traceIdUtf8(info.GetIsolate(), traceId);

  uint64_t hash = XXH3_64bits(*traceIdUtf8, traceIdUtf8.length());

  int ret;
  kh_put(TraceIdFilter, profiling->traceIdFilter, hash, &ret);

  return;
}

NAN_METHOD(RemoveTraceIdFilter) {
  info.GetReturnValue().SetUndefined();
  auto handle = Nan::To<int32_t>(info[0]).ToChecked();

  Profiling *profiling = GetProfilingByHandle(handle);

  if (!profiling) {
    return;
  }

  auto traceId = Nan::To<v8::String>(info[1]).ToLocalChecked();
  v8::String::Utf8Value traceIdUtf8(info.GetIsolate(), traceId);

  uint64_t traceIdHash = XXH3_64bits(*traceIdUtf8, traceIdUtf8.length());

  khiter_t it = kh_get(TraceIdFilter, profiling->traceIdFilter, traceIdHash);

  if (it != kh_end(profiling->traceIdFilter)) {
    kh_del(TraceIdFilter, profiling->traceIdFilter, it);
  }

  return;
}

NAN_METHOD(StartProfiling) {
  ProfilingOptions opts;
  if (!CreateCpuProfilingOptions(info, &opts)) {
    // Error was thrown.
    return;
  }

  Profiling *profiling = SetupProfiling(&opts, info.GetIsolate());

  if (!profiling) {
    Nan::ThrowError("StartProfiling: unable to allocate profiler.");
    return;
  }

  char title[128];
  ProfileTitle(title, sizeof(title), profiling->name, profiling->profilerSeq);

  profiling->activationDepth = 0;
  profiling->startTime = HrTime();
  profiling->wallStartTime = MicroSecondsSinceEpoch() * 1000L;
  V8StartProfiling(profiling->profiler, title);
  profiling->sampleCutoffPoint = HrTime();
  profiling->running = true;

  info.GetReturnValue().Set(profiling->handle);
}

size_t TimestampString(int64_t ts, char *out) { return modp_litoa10(ts, out); }

bool ShouldIncludeSample(Profiling *profiling, int64_t sampleTimestamp) {
  // Include sample if the cutoff point might exceed the maximum allowed delay:
  // - the profiler collect step is way too slow
  // - the sample is not one of the first few samples, so exit early
  if (sampleTimestamp >=
      profiling->startTime + profiling->maxSampleCutoffDelayNanos) {
    return true;
  }

  // Include the sample if we are below the maximum allowed delay,
  // but have exited the collect step.
  if (sampleTimestamp >= profiling->sampleCutoffPoint) {
    return true;
  }

  // The sample falls into the toggle function.
  return false;
}

#if PROFILER_DEBUG_EXPORT
v8::Local<v8::Object> JsActivation(Profiling *profiling,
                                   const SpanActivation *activation) {
  auto jsActivation = Nan::New<v8::Object>();

  char startTs[32];
  char endTs[32];
  size_t startTsLen = TimestampString(activation->startTime, startTs);
  size_t endTsLen = TimestampString(activation->endTime, endTs);

  Nan::Set(jsActivation, Nan::New<v8::String>("start").ToLocalChecked(),
           Nan::New<v8::String>(startTs, startTsLen).ToLocalChecked());
  Nan::Set(jsActivation, Nan::New<v8::String>("end").ToLocalChecked(),
           Nan::New<v8::String>(endTs, endTsLen).ToLocalChecked());
  Nan::Set(
      jsActivation, Nan::New<v8::String>("traceId").ToLocalChecked(),
      Nan::New<v8::String>(activation->traceId, sizeof(activation->traceId))
          .ToLocalChecked());
  Nan::Set(jsActivation, Nan::New<v8::String>("spanId").ToLocalChecked(),
           Nan::New<v8::String>(activation->spanId, sizeof(activation->spanId))
               .ToLocalChecked());
  Nan::Set(jsActivation, Nan::New<v8::String>("depth").ToLocalChecked(),
           Nan::New<v8::Int32>(activation->depth));
  Nan::Set(jsActivation, Nan::New<v8::String>("hit").ToLocalChecked(),
           Nan::New<v8::Boolean>(activation->is_intersected));
  return jsActivation;
}
#endif

void ProfilingRecordDebugInfo(Profiling *profiling,
                              v8::Local<v8::Object> profilingData) {
#if PROFILER_DEBUG_EXPORT
  if (!profiling->ShouldRecordDebugInfo()) {
    return;
  }

  int32_t activationIndex = 0;
  auto jsActivations = Nan::New<v8::Array>();

  ActivationPeriod *period = profiling->activationPeriod;

  while (period) {
    for (const ActivationBin &bin : period->activationBins) {
      for (int64_t i = 0; i < bin.count; i++) {
        const SpanActivation *activation = &bin.activations[i];
        Nan::Set(jsActivations, activationIndex++,
                 JsActivation(profiling, activation));
      }

      ActivationBin *nextBin = bin.next;

      while (nextBin) {
        for (int64_t i = 0; i < nextBin->count; i++) {
          SpanActivation *activation = &nextBin->activations[i];
          Nan::Set(jsActivations, activationIndex++,
                   JsActivation(profiling, activation));
        }
        nextBin = nextBin->next;
      }
    }
    period = period->next;
  }

  Nan::Set(profilingData, Nan::New<v8::String>("activations").ToLocalChecked(),
           jsActivations);
#endif
}

v8::Local<v8::Array> makeStackLine(const v8::CpuProfileNode *node) {
  auto jsResult = Nan::New<v8::Array>();

  const char *rawFunction = node->GetFunctionNameStr();
  const char *rawFileName = node->GetScriptResourceNameStr();

  if (strlen(rawFunction) == 0) {
    rawFunction = "anonymous";
  }

  if (strlen(rawFileName) == 0) {
    rawFileName = "unknown";
  }

  Nan::Set(jsResult, 0, Nan::New<v8::String>(rawFileName).ToLocalChecked());
  Nan::Set(jsResult, 1, Nan::New<v8::String>(rawFunction).ToLocalChecked());
  Nan::Set(jsResult, 2, Nan::New<v8::Number>(node->GetLineNumber()));
  Nan::Set(jsResult, 3, Nan::New<v8::Number>(node->GetColumnNumber()));

  return jsResult;
}

void ProfilingBuildStacktraces(Profiling *profiling, v8::CpuProfile *profile,
                               v8::Local<v8::Object> profilingData) {
  auto jsTraces = Nan::New<v8::Array>();
  Nan::Set(profilingData, Nan::New("stacktraces").ToLocalChecked(), jsTraces);

  char startTimeNanos[32];
  size_t startTimeNanosLen =
      TimestampString(profiling->wallStartTime, startTimeNanos);

  Nan::Set(profilingData, Nan::New("startTimeNanos").ToLocalChecked(),
           Nan::New(startTimeNanos, startTimeNanosLen).ToLocalChecked());

#if PROFILER_DEBUG_EXPORT
  {
    char tpBuf[32];
    size_t tpLen = TimestampString(profiling->startTime, tpBuf);
    Nan::Set(profilingData,
             Nan::New<v8::String>("startTimepoint").ToLocalChecked(),
             Nan::New<v8::String>(tpBuf, tpLen).ToLocalChecked());
  }
#endif

  int32_t traceCount = 0;

  int64_t nextSampleTs = profile->GetStartTime() * 1000LL;
  for (int i = 0; i < profile->GetSamplesCount(); i++) {
    int64_t monotonicTs = profile->GetSampleTimestamp(i) * 1000LL;

    bool isValidSample = ShouldIncludeSample(profiling, monotonicTs) &&
                         monotonicTs >= nextSampleTs;
    if (!isValidSample) {
      continue;
    }

    SpanActivation *match = FindClosestActivation(profiling, monotonicTs);

    if (profiling->onlyFilteredStacktraces && match == nullptr) {
      continue;
    }

    nextSampleTs += profiling->samplingIntervalNanos;

    const v8::CpuProfileNode *sample = profile->GetSample(i);

    auto stackTraceLines = Nan::New<v8::Array>();
    int32_t stackTraceLineCount = 0;
    Nan::Set(stackTraceLines, stackTraceLineCount++, makeStackLine(sample));

    int64_t monotonicDelta = monotonicTs - profiling->startTime;
    int64_t sampleTimestamp = profiling->wallStartTime + monotonicDelta;

    const v8::CpuProfileNode *parent = sample->GetParent();
    while (parent) {
      const v8::CpuProfileNode *next = parent->GetParent();

      // Skip the root node as it does not contain useful information.
      if (next) {
        Nan::Set(stackTraceLines, stackTraceLineCount++, makeStackLine(parent));
      }

      parent = next;
    }

    char tsBuf[32];
    size_t tsLen = TimestampString(sampleTimestamp, tsBuf);

    auto jsTrace = Nan::New<v8::Object>();

    Nan::Set(jsTrace, Nan::New<v8::String>("timestamp").ToLocalChecked(),
             Nan::New<v8::String>(tsBuf, tsLen).ToLocalChecked());
    Nan::Set(jsTrace, Nan::New<v8::String>("stacktrace").ToLocalChecked(),
             stackTraceLines);

#if PROFILER_DEBUG_EXPORT
    char tpBuf[32];
    size_t tpLen = TimestampString(monotonicTs, tpBuf);
    Nan::Set(jsTrace, Nan::New<v8::String>("timepoint").ToLocalChecked(),
             Nan::New<v8::String>(tpBuf, tpLen).ToLocalChecked());
#endif

    if (match) {
      uint8_t spanId[8];
      uint8_t traceId[16];
      HexToBinary(match->spanId, 16, spanId, sizeof(spanId));
      HexToBinary(match->traceId, 32, traceId, sizeof(traceId));

      Nan::Set(jsTrace, Nan::New<v8::String>("spanId").ToLocalChecked(),
               Nan::CopyBuffer((const char *)spanId, 8).ToLocalChecked());
      Nan::Set(jsTrace, Nan::New<v8::String>("traceId").ToLocalChecked(),
               Nan::CopyBuffer((const char *)traceId, 16).ToLocalChecked());

#if PROFILER_DEBUG_EXPORT
      match->is_intersected = true;
#endif
    }

    Nan::Set(jsTraces, traceCount++, jsTrace);
  }
}

void ProfilingReset(Profiling *profiling) {
  kh_clear(ActivationStack, profiling->spanActivations);
  PagedArenaReset(&profiling->arena);
  profiling->activationPeriod = NewActivationPeriod(profiling);
}

NAN_METHOD(CollectProfilingData) {
  info.GetReturnValue().SetNull();

  auto handle = Nan::To<int32_t>(info[0]).ToChecked();

  Profiling *profiling = GetProfilingByHandle(handle);

  if (!profiling) {
    return;
  }

  if (!profiling->running) {
    return;
  }

  char prevTitle[128];
  ProfileTitle(prevTitle, sizeof(prevTitle), profiling->name,
               profiling->profilerSeq);
  profiling->profilerSeq = (profiling->profilerSeq + 1) % 2;
  char nextTitle[128];
  ProfileTitle(nextTitle, sizeof(nextTitle), profiling->name,
               profiling->profilerSeq);

  profiling->activationDepth = 0;
  int64_t newStartTime = HrTime();
  int64_t newWallStart = MicroSecondsSinceEpoch() * 1000L;

  V8StartProfiling(profiling->profiler, nextTitle);
  int64_t profilerStopBegin = HrTime();
  int64_t profilerStartDuration = profilerStopBegin - newStartTime;

  v8::CpuProfile *profile =
      profiling->profiler->StopProfiling(Nan::New(prevTitle).ToLocalChecked());
  int64_t profilerStopEnd = HrTime();
  int64_t profilerStopDuration = profilerStopEnd - profilerStopBegin;

  if (!profile) {
    // profile with this title might've already be ended using a previous stop
    // call
    profiling->startTime = newStartTime;
    profiling->wallStartTime = newWallStart;
    return;
  }

  auto jsProfilingData = Nan::New<v8::Object>();
  info.GetReturnValue().Set(jsProfilingData);

  ProfilingBuildStacktraces(profiling, profile, jsProfilingData);
  int64_t profilerProcessingStepDuration = HrTime() - profilerStopEnd;

  Nan::Set(jsProfilingData, Nan::New("profilerStartDuration").ToLocalChecked(),
           Nan::New<v8::Number>((double)profilerStartDuration));
  Nan::Set(jsProfilingData, Nan::New("profilerStopDuration").ToLocalChecked(),
           Nan::New<v8::Number>((double)profilerStopDuration));
  Nan::Set(jsProfilingData,
           Nan::New("profilerProcessingStepDuration").ToLocalChecked(),
           Nan::New<v8::Number>((double)profilerProcessingStepDuration));

  ProfilingRecordDebugInfo(profiling, jsProfilingData);
  ProfilingReset(profiling);
  profile->Delete();

  profiling->startTime = newStartTime;
  profiling->wallStartTime = newWallStart;
  profiling->sampleCutoffPoint = HrTime();
}

NAN_METHOD(StopProfiling) {
  info.GetReturnValue().SetNull();

  auto handle = Nan::To<int32_t>(info[0]).ToChecked();

  Profiling *profiling = GetProfilingByHandle(handle);

  if (!profiling) {
    return;
  }

  if (!profiling->running) {
    return;
  }

  profiling->running = false;

  char title[128];
  ProfileTitle(title, sizeof(title), profiling->name, profiling->profilerSeq);

  v8::CpuProfile *profile =
      profiling->profiler->StopProfiling(Nan::New(title).ToLocalChecked());
  if (!profile) {
    // profile with this title might've already be ended using a previous stop
    // call
    ProfilingReset(profiling);
    return;
  }

  auto jsProfilingData = Nan::New<v8::Object>();
  info.GetReturnValue().Set(jsProfilingData);

  ProfilingBuildStacktraces(profiling, profile, jsProfilingData);
  ProfilingRecordDebugInfo(profiling, jsProfilingData);
  ProfilingReset(profiling);
  profile->Delete();
}

bool IsValidSpanId(const char *id, int32_t length) {
  if (length != 16) {
    return false;
  }

  static const char emptySpanId[] = "0000000000000000";
  return memcmp(id, emptySpanId, 16) != 0;
}

bool IsValidTraceId(const char *id, int32_t length) {
  if (length != 32) {
    return false;
  }

  static const char emptyTraceId[] = "00000000000000000000000000000000";
  return memcmp(id, emptyTraceId, 32) != 0;
}

void ProfilingEnterContext(Profiling *profiling, int32_t contextHash,
                           int64_t timestamp,
                           const v8::String::Utf8Value &traceId,
                           const v8::String::Utf8Value &spanId) {

  if (!profiling->running) {
    return;
  }

  if (profiling->onlyFilteredStacktraces) {
    uint64_t traceIdHash = XXH3_64bits(*traceId, traceId.length());
    if (kh_get(TraceIdFilter, profiling->traceIdFilter, traceIdHash) ==
        kh_end(profiling->traceIdFilter)) {
      return;
    }
  }

  khiter_t it =
      kh_get(ActivationStack, profiling->spanActivations, contextHash);

  ActivationStack *stack;

  if (it == kh_end(profiling->spanActivations)) {
    int ret;
    it = kh_put(ActivationStack, profiling->spanActivations, contextHash, &ret);

    if (ret == -1) {
      return;
    }

    stack = &kh_value(profiling->spanActivations, it);
    ActivationStackInit(stack);
  } else {
    stack = &kh_value(profiling->spanActivations, it);
  }

  SpanActivation *activation = ActivationStackPush(stack, &profiling->arena);

  if (!activation) {
    return;
  }

  memcpy(activation->traceId, *traceId, 32);
  memcpy(activation->spanId, *spanId, 16);
  activation->startTime = timestamp;
#if PROFILER_DEBUG_EXPORT
  activation->depth = profiling->activationDepth;
#endif

  profiling->activationDepth++;
}

void ProfilingExitContext(Profiling *profiling, int32_t contextHash,
                          int64_t timestamp) {
  if (!profiling->running) {
    return;
  }

  khiter_t it =
      kh_get(ActivationStack, profiling->spanActivations, contextHash);

  if (it == kh_end(profiling->spanActivations)) {
    return;
  }

  ActivationStack *stack = &kh_value(profiling->spanActivations, it);
  SpanActivation *activation = ActivationStackPop(stack);

  if (!activation) {
    return;
  }

  activation->endTime = timestamp;

  InsertActivation(profiling, activation);

  if (stack->count == 0) {
    kh_del(ActivationStack, profiling->spanActivations, it);
  }

  profiling->activationDepth--;
}

NAN_METHOD(EnterContext) {
  if (globals.profilers.empty()) {
    return;
  }

  int hash = info[0].As<v8::Object>()->GetIdentityHash();

  v8::Isolate *isolate = info.GetIsolate();
  v8::String::Utf8Value traceId(
      isolate,
      Nan::MaybeLocal<v8::String>(info[1].As<v8::String>()).ToLocalChecked());
  v8::String::Utf8Value spanId(
      isolate,
      Nan::MaybeLocal<v8::String>(info[2].As<v8::String>()).ToLocalChecked());

  if (!IsValidTraceId(*traceId, traceId.length()) ||
      !IsValidSpanId(*spanId, spanId.length())) {
    return;
  }

  int64_t timestamp = HrTime();

  for (size_t i = 0; i < globals.profilers.size(); i++) {
    Profiling *profiling = globals.profilers[i];
    ProfilingEnterContext(profiling, hash, timestamp, traceId, spanId);
  }
}

NAN_METHOD(ExitContext) {
  if (globals.profilers.empty()) {
    return;
  }

  int hash = info[0].As<v8::Object>()->GetIdentityHash();
  int64_t timestamp = HrTime();

  for (size_t i = 0; i < globals.profilers.size(); i++) {
    Profiling *profiling = globals.profilers[i];
    ProfilingExitContext(profiling, hash, timestamp);
  }
}

} // namespace

void Initialize(v8::Local<v8::Object> target) {
  globals.Init();

  auto profilingModule = Nan::New<v8::Object>();
  Nan::Set(profilingModule, Nan::New("createCpuProfiler").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(CreateCpuProfiler))
               .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("startCpuProfiler").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StartCpuProfiler))
               .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("addTraceIdFilter").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(AddTraceIdFilter))
               .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("removeTraceIdFilter").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(RemoveTraceIdFilter))
               .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("start").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StartProfiling))
               .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("stop").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StopProfiling))
               .ToLocalChecked());

  Nan::Set(
      profilingModule, Nan::New("collect").ToLocalChecked(),
      Nan::GetFunction(Nan::New<v8::FunctionTemplate>(CollectProfilingData))
          .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("enterContext").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(EnterContext))
               .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("exitContext").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ExitContext))
               .ToLocalChecked());

  Nan::Set(
      profilingModule, Nan::New("startMemoryProfiling").ToLocalChecked(),
      Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StartMemoryProfiling))
          .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("collectHeapProfile").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(CollectHeapProfile))
               .ToLocalChecked());

  Nan::Set(profilingModule, Nan::New("stopMemoryProfiling").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StopMemoryProfiling))
               .ToLocalChecked());

  Nan::Set(target, Nan::New("profiling").ToLocalChecked(), profilingModule);
}

} // namespace Profiling
} // namespace Splunk
