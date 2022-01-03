#include "profiling.h"
#include <nan.h>
#include <stdio.h>
#include <uv.h>
#include <v8-profiler.h>
#include <chrono>
#include <inttypes.h>
#include "arena.h"
#include "hex.h"
#include "khash.h"

#define PROFILER_DEBUG_EXPORT 0

namespace Profiling {

constexpr int64_t kActivationsPerBin = 64;
constexpr int64_t kBinsPerTimeSlice = 512;

struct SpanActivation {
  char traceId[32];
  char spanId[16];
  int64_t startTime = 0;
  int64_t endTime = 0;
  SpanActivation* next;
#if PROFILER_DEBUG_EXPORT
  int32_t depth = 0;
  bool is_intersected = false;
#endif
};

struct TimeSlice;

struct ActivationBin {
  SpanActivation* activations[kActivationsPerBin];
  int64_t count;
  int32_t index;
  TimeSlice* slice;
  ActivationBin* next;
};

struct TimeSlice {
  ActivationBin activationBins[kBinsPerTimeSlice];
  TimeSlice* next;
};

enum ProfilingFlags {
  ProfilingFlags_None = 0x00,
  ProfilingFlags_RecordDebugInfo = 0x01
};

const size_t kProfilingMaxMem = 1024ULL * 1024ULL * 64ULL;

KHASH_MAP_INIT_INT(32, SpanActivation*);

struct Profiling {
  Profiling() : cycleMem(calloc(1, kProfilingMaxMem)) {
    MemArenaInit(&arena, cycleMem, kProfilingMaxMem);
  }
  MemArena arena;
  void* cycleMem;
  TimeSlice* timeSlice;
  v8::CpuProfiler* profiler;
  int64_t wallStartTime = 0;
  int64_t startTime = 0;
  int32_t activationDepth = 0;
  int32_t flags = ProfilingFlags_None;
  int64_t samplingIntervalNanos = 0;
  khash_t(32)* spanActivations;

  bool RecordDebugInfo() const {
    return (flags & ProfilingFlags_RecordDebugInfo) == 1;
  }
};

void* ArenaAlloc(Profiling* profiling, size_t size) {
  return MemArenaAlloc(&profiling->arena, size);
}

TimeSlice* NewTimeSlice(Profiling* profiling) {
  TimeSlice* slice = (TimeSlice*)ArenaAlloc(profiling, sizeof(TimeSlice));

  int32_t index = 0;
  for (ActivationBin& bin : slice->activationBins) {
    bin.index = index++;
    bin.slice = slice;
  }

  return slice;
}

ActivationBin* ProfilingGetActivationBin(Profiling* profiling, int64_t timestamp) {
  /* Nanoseconds each activation bin represents. */
  const int64_t kActivationBinWidth = 100L * 1'000'000L;

  int64_t delta = timestamp - profiling->startTime;
  int64_t binIndex = delta / kActivationBinWidth;

  int64_t sliceIndex = binIndex / kBinsPerTimeSlice;

  int64_t currentSlice = 0;

  TimeSlice* slice = profiling->timeSlice;
  while (currentSlice != sliceIndex) {
    if (slice->next) {
      slice = slice->next;
    } else {
      TimeSlice* newSlice = NewTimeSlice(profiling);
      slice->next = newSlice;
      slice = newSlice;
    }
    currentSlice++;
  }

  int64_t binSliceIndex = binIndex - sliceIndex * kBinsPerTimeSlice;

  return &slice->activationBins[binSliceIndex];
}

SpanActivation*
FindClosestActivation(Profiling* profiling, int64_t ts) {
  SpanActivation sentinel;
  sentinel.startTime = std::numeric_limits<int64_t>::min();
  sentinel.endTime = std::numeric_limits<int64_t>::max();
  SpanActivation* t = &sentinel;

  ActivationBin* bin = ProfilingGetActivationBin(profiling, ts);

  while (bin) {
    for (int64_t i = 0; i < bin->count; i++) {
      SpanActivation* activation = bin->activations[i];
      if (activation->startTime <= ts && ts <= activation->endTime) {
        if (activation->startTime > t->startTime) {
          t = activation;
        }
      }
    }

    bin = bin->next;
  }

  if (t == &sentinel) {
    return nullptr;
  }

  return t;
}
void InsertActivation(Profiling* profiling, SpanActivation* activation) {
  ActivationBin* bin = ProfilingGetActivationBin(profiling, activation->startTime);

  // Iterate until last bin
  while (bin->next) {
    bin = bin->next;
  }

  // If the last bin is empty, expand
  if (bin->count == kActivationsPerBin) {
    ActivationBin* newBin = (ActivationBin*)ArenaAlloc(profiling, sizeof(ActivationBin));
    newBin->index = bin->index;
    newBin->slice = bin->slice;
    bin->next = newBin;
    bin = newBin;
  }

  bin->activations[bin->count++] = activation;
}

Profiling* profiling = nullptr;

int64_t HrTime() {
  return uv_hrtime();
}

int64_t MicroSecondsSinceEpoch() {
  uv_timeval64_t time;
  uv_gettimeofday(&time);
  return time.tv_sec * 1'000'000LL + int64_t(time.tv_usec);
}

NAN_METHOD(StartProfiling) {
  int64_t startBegin = HrTime();
  if (!profiling) {
    profiling = new Profiling();
    profiling->profiler = v8::CpuProfiler::New(info.GetIsolate());
    profiling->spanActivations = kh_init(32);
  }

  MemArenaReset(&profiling->arena);
  profiling->timeSlice = NewTimeSlice(profiling);
  
  int samplingIntervalMicros = 1'000'000;
  profiling->flags = 0;

  if (info.Length() >= 1 && info[0]->IsObject()) {
    auto options = Nan::To<v8::Object>(info[0]).ToLocalChecked();
    auto maybeInterval = Nan::Get(options, Nan::New("samplingIntervalMicroseconds").ToLocalChecked());
    samplingIntervalMicros = Nan::To<int32_t>(maybeInterval.ToLocalChecked()).FromJust();

    auto maybeRecordDebugInfo = Nan::Get(options, Nan::New("recordDebugInfo").ToLocalChecked());
    if (!maybeRecordDebugInfo.IsEmpty() && maybeRecordDebugInfo.ToLocalChecked()->IsBoolean()) {
      if (Nan::To<bool>(maybeRecordDebugInfo.ToLocalChecked()).FromJust()) {
        profiling->flags |= ProfilingFlags_RecordDebugInfo;
      }
    }
  }

  profiling->samplingIntervalNanos = int64_t(samplingIntervalMicros) * 1000L;

  profiling->profiler->SetSamplingInterval(samplingIntervalMicros);
  v8::Local<v8::String> title = Nan::New("splunk-otel-js").ToLocalChecked();
  const bool recordSamples = true;
  profiling->activationDepth = 0;
  profiling->startTime = HrTime();
  profiling->wallStartTime = MicroSecondsSinceEpoch() * 1000L;
  profiling->profiler->StartProfiling(
    title, v8::kLeafNodeLineNumbers, recordSamples, v8::CpuProfilingOptions::kNoSampleLimit);
  int64_t startEnd = HrTime();
  printf("start: %ld us; %.3f ms\n", (startEnd - startBegin) / 1000L, double(startEnd - startBegin) / 1e6);
}

const char* GetTraceLineFormatString(size_t fileNameLen) {
  if (fileNameLen) {
    return "\tat %.*s(%.*s:%d)\n";
  }

  return "\tat %.*s(unknown:%d)\n";
}

struct StackTraceBuilder {
  void Add(const v8::CpuProfileNode* sample) {
    const char* rawFunction = sample->GetFunctionNameStr();

    size_t functionLen = strlen(rawFunction);
    std::string function;
    function.reserve(functionLen);

    for (size_t i = 0; i < functionLen; i++) {
      char c = rawFunction[i];

      if (c == '(' || c == ')') {
        continue;
      }

      function += c;
    }

    if (function.size() == 0) {
      function = "anonymous";
    }

    char buf[1024] = {0};
    int sampleLength;

    std::string fileName = sample->GetScriptResourceNameStr();

    for (size_t i = 0; i < fileName.size(); i++) {
      if (fileName[i] == ':') {
        fileName[i] = '_';
      }
    }

    int line = sample->GetLineNumber();

    if (fileName.size() > 0) {
      sampleLength = snprintf(buf, sizeof(buf), "\tat %.*s(%.*s:%d)\n", int(function.size()), function.c_str(), int(fileName.size()), fileName.c_str(), line);
    } else {
      sampleLength = snprintf(buf, sizeof(buf), "\tat %.*s(unknown:%d)\n", int(function.size()), function.c_str(), line);
    }

    trace.append(buf, sampleLength);
  }

  std::string trace = "\"main\" #0 prio=0 os_prio=0 cpu=0 elapsed=0 tid=0 nid=0\n\n";
};

int TimestampString(int64_t ts, char* out, size_t length) {
  return snprintf(out, length, "%" PRId64, ts);
}

#if PROFILER_DEBUG_EXPORT
v8::Local<v8::Object> JsActivation(Profiling* profiling, const SpanActivation* activation) {
  auto jsActivation = Nan::New<v8::Object>();

  char startTs[32];
  char endTs[32];
  TimestampString(profiling->wallStartTime + (activation->startTime - profiling->startTime), startTs, sizeof(startTs));
  TimestampString(profiling->wallStartTime + (activation->endTime - profiling->startTime), endTs, sizeof(endTs));

  Nan::Set(jsActivation, Nan::New<v8::String>("start").ToLocalChecked(), Nan::New<v8::String>(startTs).ToLocalChecked());
  Nan::Set(jsActivation, Nan::New<v8::String>("end").ToLocalChecked(), Nan::New<v8::String>(endTs).ToLocalChecked());
  Nan::Set(jsActivation, Nan::New<v8::String>("traceId").ToLocalChecked(), Nan::New<v8::String>(activation->traceId, sizeof(activation->traceId)).ToLocalChecked());
  Nan::Set(jsActivation, Nan::New<v8::String>("spanId").ToLocalChecked(), Nan::New<v8::String>(activation->spanId, sizeof(activation->spanId)).ToLocalChecked());
  Nan::Set(jsActivation, Nan::New<v8::String>("depth").ToLocalChecked(), Nan::New<v8::Int32>(activation->depth));
  Nan::Set(jsActivation, Nan::New<v8::String>("hit").ToLocalChecked(), Nan::New<v8::Boolean>(activation->is_intersected));
  return jsActivation;
}
#endif

NAN_METHOD(StopProfiling) {
  int64_t stopBegin = HrTime();
  auto profilingData = Nan::New<v8::Object>();
  auto jsTraces = Nan::New<v8::Array>();
  Nan::Set(profilingData, Nan::New("stacktraces").ToLocalChecked(), jsTraces);

  info.GetReturnValue().Set(profilingData);

  if (!profiling) {
    return;
  }

  char startTimeNanos[32] = {0};
  TimestampString(profiling->wallStartTime, startTimeNanos, sizeof(startTimeNanos));

  Nan::Set(profilingData, Nan::New("startTimeNanos").ToLocalChecked(), Nan::New(startTimeNanos).ToLocalChecked());

  v8::Local<v8::String> title = Nan::New("splunk-otel-js").ToLocalChecked();

  int64_t profileStop = HrTime();
  v8::CpuProfile* profile = profiling->profiler->StopProfiling(title);
  int64_t profileStopEnd = HrTime();

  int64_t beginTransform = HrTime();

  int traceCounter = 0;

  int64_t nextSampleTs = profile->GetStartTime() * 1000L;
  for (int i = 0; i < profile->GetSamplesCount(); i++) {
    int64_t monotonicTs = profile->GetSampleTimestamp(i) * 1000L;

    if (monotonicTs < nextSampleTs) {
      continue;
    }

    nextSampleTs += profiling->samplingIntervalNanos;

    const v8::CpuProfileNode* sample = profile->GetSample(i);
    StackTraceBuilder builder;
    builder.Add(sample);

    int64_t monotonicDelta = monotonicTs - profiling->startTime;
    int64_t sampleTimestamp = profiling->wallStartTime + monotonicDelta;

    const v8::CpuProfileNode* parent = sample->GetParent();
    while (parent) {
      builder.Add(parent);
      parent = parent->GetParent();
    }

    char tsBuf[32];
    TimestampString(sampleTimestamp, tsBuf, sizeof(tsBuf));

    auto jsTrace = Nan::New<v8::Object>();

    Nan::Set(
      jsTrace, Nan::New<v8::String>("timestamp").ToLocalChecked(),
      Nan::New<v8::String>(tsBuf).ToLocalChecked());
    Nan::Set(
      jsTrace, Nan::New<v8::String>("stacktrace").ToLocalChecked(),
      Nan::New<v8::String>(builder.trace.c_str(), builder.trace.size()).ToLocalChecked());

    SpanActivation* match = FindClosestActivation(profiling, monotonicTs);

    if (match) {
      uint8_t spanId[8];
      uint8_t traceId[16];
      HexToBinary(match->spanId, 16, spanId, sizeof(spanId));
      HexToBinary(match->traceId, 32, traceId, sizeof(traceId));

      Nan::Set(
        jsTrace, Nan::New<v8::String>("spanId").ToLocalChecked(),
        Nan::CopyBuffer((const char*)spanId, 8).ToLocalChecked());
      Nan::Set(
        jsTrace, Nan::New<v8::String>("traceId").ToLocalChecked(),
        Nan::CopyBuffer((const char*)traceId, 16).ToLocalChecked());

#if PROFILER_DEBUG_EXPORT
      match->is_intersected = true;
#endif
    }

    Nan::Set(jsTraces, traceCounter++, jsTrace);
  }

  int64_t endTransform = HrTime();

#if PROFILER_DEBUG_EXPORT
  if (profiling->RecordDebugInfo()) {
    int32_t activationIndex = 0;
    auto jsActivations = Nan::New<v8::Array>();

    TimeSlice* slice = profiling->timeSlice;

    while (slice) {
      for (const ActivationBin& bin : slice->activationBins) {
        for (int64_t i = 0; i < bin.count; i++) {
          SpanActivation* activation = bin.activations[i];
          Nan::Set(jsActivations, activationIndex++, JsActivation(profiling, activation));
        }

        ActivationBin* nextBin = bin.next;

        while (nextBin) {
          for (int64_t i = 0; i < nextBin->count; i++) {
            SpanActivation* activation = nextBin->activations[i];
            Nan::Set(jsActivations, activationIndex++, JsActivation(profiling, activation));
          }
          nextBin = nextBin->next;
        }
      }
      slice = slice->next;
    }

    Nan::Set(profilingData, Nan::New<v8::String>("activations").ToLocalChecked(), jsActivations);
  }
#endif
  int64_t cleanupBegin = HrTime();
  profile->Delete();
  kh_clear(32, profiling->spanActivations);

  int64_t cleanupEnd = HrTime();

  int64_t stopDur = cleanupEnd - stopBegin;
  printf("Stop: %ld us (%.3f ms)Transform: %ld us; Stop: %ld us; Cleanup: %ld us\n", stopDur / 1000L, double(stopDur) / 1e6, (endTransform - beginTransform) / 1000, (profileStopEnd - profileStop) / 1000, (cleanupEnd - cleanupBegin) / 1000);
}

bool IsValidSpanId(const char* id, int32_t length) {
  if (length != 16) {
    return false;
  }

  static const char emptySpanId[] = "0000000000000000";
  return memcmp(id, emptySpanId, 16) != 0;
}

bool IsValidTraceId(const char* id, int32_t length) {
  if (length != 32) {
    return false;
  }

  static const char emptyTraceId[] = "00000000000000000000000000000000";
  return memcmp(id, emptyTraceId, 32) != 0;
}

NAN_METHOD(EnterContext) {
  if (!profiling) {
    return;
  }

  v8::Isolate* isolate = info.GetIsolate();

  int hash = info[0].As<v8::Object>()->GetIdentityHash();
  v8::String::Utf8Value traceId(
    isolate, Nan::MaybeLocal<v8::String>(info[1].As<v8::String>()).ToLocalChecked());
  v8::String::Utf8Value spanId(
    isolate, Nan::MaybeLocal<v8::String>(info[2].As<v8::String>()).ToLocalChecked());

  if (!IsValidTraceId(*traceId, traceId.length()) || !IsValidSpanId(*spanId, spanId.length())) {
    return;
  }

  int64_t timestamp = HrTime();

  SpanActivation* activation = (SpanActivation*)ArenaAlloc(profiling, sizeof(SpanActivation));
  memcpy(activation->traceId, *traceId, 32);
  memcpy(activation->spanId, *spanId, 16);
  activation->startTime = timestamp;
#if PROFILER_DEBUG_EXPORT
  activation->depth = profiling->activationDepth;
#endif

  khiter_t it = kh_get(32, profiling->spanActivations, hash);

  if (it == kh_end(profiling->spanActivations)) {
    int ret;
    it = kh_put(32, profiling->spanActivations, hash, &ret);
  } else {
    SpanActivation* existing = kh_value(profiling->spanActivations, it);
    activation->next = existing;
  }

  kh_value(profiling->spanActivations, it) = activation;

  profiling->activationDepth++;
}

NAN_METHOD(ExitContext) {
  if (!profiling) {
    return;
  }

  int hash = info[0].As<v8::Object>()->GetIdentityHash();

  khiter_t it = kh_get(32, profiling->spanActivations, hash);

  if (it == kh_end(profiling->spanActivations)) {
    return;
  }

  SpanActivation* activation = kh_value(profiling->spanActivations, it);
  activation->endTime = HrTime();

  if (activation->next) {
    kh_value(profiling->spanActivations, it) = activation->next;
    activation->next = nullptr;
  } else {
    kh_del(32, profiling->spanActivations, it);
  }

  InsertActivation(profiling, activation);

  profiling->activationDepth--;
}

void Initialize(v8::Local<v8::Object> target) {
  auto profilingModule = Nan::New<v8::Object>();
  Nan::Set(
    profilingModule, Nan::New("start").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StartProfiling)).ToLocalChecked());

  Nan::Set(
    profilingModule, Nan::New("stop").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StopProfiling)).ToLocalChecked());

  Nan::Set(
    profilingModule, Nan::New("enterContext").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(EnterContext)).ToLocalChecked());

  Nan::Set(
    profilingModule, Nan::New("exitContext").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ExitContext)).ToLocalChecked());

  Nan::Set(target, Nan::New("profiling").ToLocalChecked(), profilingModule);
}

}
