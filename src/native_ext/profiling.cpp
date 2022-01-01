#include "profiling.h"
#include <algorithm>
#include <nan.h>
#include <stack>
#include <stdio.h>
#include <unordered_map>
#include <uv.h>
#include <v8-profiler.h>
#include <vector>
#include <chrono>
#include <inttypes.h>
#include "hex.h"

#define PROFILER_DEBUG_EXPORT 0

namespace Profiling {

struct SpanActivation {
  char traceId[32];
  char spanId[16];
  int64_t startTime = 0;
  int64_t endTime = 0;
#if PROFILER_DEBUG_EXPORT
  int32_t depth = 0;
  bool is_intersected = false;
#endif

  SpanActivation() {
    memset(traceId, '0', sizeof(traceId));
    memset(spanId, '0', sizeof(spanId));
  }
};

static_assert(sizeof(SpanActivation) <= 64);

SpanActivation*
FindClosestActivation(std::vector<SpanActivation>& activations, int64_t ts) {
  SpanActivation* t = nullptr;

  for (SpanActivation& activation : activations) {
    if (activation.startTime <= ts && ts <= activation.endTime) {
      if (t) {
        if (activation.startTime > t->startTime) {
          t = &activation;
        }
      } else {
        t = &activation;
      }
    }
  }

  return t;
}

enum ProfilingFlags {
  ProfilingFlags_None = 0x00,
  ProfilingFlags_RecordDebugInfo = 0x01
};

struct Profiling {
  v8::CpuProfiler* profiler;
  int64_t wallStartTime = 0;
  int64_t startTime = 0;
  int32_t activationDepth = 0;
  int32_t flags = ProfilingFlags_None;
  int64_t samplingIntervalNanos = 0;
  std::vector<SpanActivation> finishedActivations;
  std::unordered_map<int64_t, std::stack<SpanActivation>> spanActivations;

  bool RecordDebugInfo() const {
    return (flags & ProfilingFlags_RecordDebugInfo) == 1;
  }
};

Profiling* profiling = nullptr;

int64_t MicroSecondsSinceEpoch() {
  return std::chrono::duration_cast<std::chrono::microseconds>(
           std::chrono::system_clock::now().time_since_epoch())
    .count();
}

int64_t HrTime() {
  return uv_hrtime();
}

NAN_METHOD(StartProfiling) {
  if (!profiling) {
    profiling = new Profiling();
    profiling->profiler = v8::CpuProfiler::New(info.GetIsolate());
  }
  
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

  printf("Sampling interval seconds %f\n", double(samplingIntervalMicros) / 1e6);
  profiling->profiler->SetSamplingInterval(samplingIntervalMicros);
  v8::Local<v8::String> title = Nan::New("splunk-otel-js").ToLocalChecked();
  const bool recordSamples = true;
  profiling->activationDepth = 0;
  profiling->profiler->StartProfiling(
    title, v8::kLeafNodeLineNumbers, recordSamples, v8::CpuProfilingOptions::kNoSampleLimit);
  profiling->startTime = HrTime();
  profiling->wallStartTime = MicroSecondsSinceEpoch() * 1000L;
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

      if (c == '(' || c == ')' || c == ':') {
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

NAN_METHOD(StopProfiling) {
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
  std::sort(
    profiling->finishedActivations.begin(), profiling->finishedActivations.end(),
    [](const auto& a, const auto& b) { return a.startTime < b.startTime; });

  int traceCounter = 0;

  int64_t nextSampleTs = profiling->startTime;
  for (int i = 0; i < profile->GetSamplesCount(); i++) {
    int64_t monotonicTs = profile->GetSampleTimestamp(i) * 1000L;
    int64_t monotonicDelta = monotonicTs - profiling->startTime;

    if (monotonicTs < nextSampleTs) {
      continue;
    }

    nextSampleTs += profiling->samplingIntervalNanos;

    const v8::CpuProfileNode* sample = profile->GetSample(i);
    StackTraceBuilder builder;
    builder.Add(sample);

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

    SpanActivation* match = FindClosestActivation(profiling->finishedActivations, monotonicTs);

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

      //match->is_intersected = true;
    }

    Nan::Set(jsTraces, traceCounter++, jsTrace);
  }

  int64_t endTransform = HrTime();

#if PROFILER_DEBUG_EXPORT
  if (profiling->RecordDebugInfo()) {
    auto jsActivations = Nan::New<v8::Array>();
    int32_t activationIndex = 0;

    for (const SpanActivation& activation : profiling->finishedActivations) {
      auto jsActivation = Nan::New<v8::Object>();

      char startTs[32];
      char endTs[32];
      TimestampString(profiling->wallStartTime + (activation.startTime - profiling->startTime), startTs, sizeof(startTs));
      TimestampString(profiling->wallStartTime + (activation.endTime - profiling->startTime), endTs, sizeof(endTs));

      Nan::Set(jsActivation, Nan::New<v8::String>("start").ToLocalChecked(), Nan::New<v8::String>(startTs).ToLocalChecked());
      Nan::Set(jsActivation, Nan::New<v8::String>("end").ToLocalChecked(), Nan::New<v8::String>(endTs).ToLocalChecked());
      Nan::Set(jsActivation, Nan::New<v8::String>("traceId").ToLocalChecked(), Nan::New<v8::String>(activation.traceId, sizeof(activation.traceId)).ToLocalChecked());
      Nan::Set(jsActivation, Nan::New<v8::String>("spanId").ToLocalChecked(), Nan::New<v8::String>(activation.spanId, sizeof(activation.spanId)).ToLocalChecked());
      Nan::Set(jsActivation, Nan::New<v8::String>("depth").ToLocalChecked(), Nan::New<v8::Int32>(activation.depth));
      Nan::Set(jsActivation, Nan::New<v8::String>("hit").ToLocalChecked(), Nan::New<v8::Boolean>(activation.is_intersected));

      Nan::Set(jsActivations, activationIndex++, jsActivation);
    }

    Nan::Set(profilingData, Nan::New<v8::String>("activations").ToLocalChecked(), jsActivations);
  }
#endif
  int64_t cleanupBegin = HrTime();
  profile->Delete();
  profiling->spanActivations.clear();
  size_t activationsCount = profiling->finishedActivations.size();
  profiling->finishedActivations.clear();
  int64_t cleanupEnd = HrTime();

  printf("Activations: %zu; Transform: %ld us; Stop: %ld us; Cleanup: %ld us\n", activationsCount, (endTransform - beginTransform) / 1000, (profileStopEnd - profileStop) / 1000, (cleanupEnd - cleanupBegin) / 1000);
}

bool IsValidId(const char* id, int32_t length) {
  for (int32_t i = 0; i < length; i++) {
    if (id[i] != '0') return true;
  }

  return false;
}

NAN_METHOD(EnterContext) {
  if (!profiling) {
    return;
  }

  v8::Isolate* isolate = info.GetIsolate();

  int64_t index = Nan::MaybeLocal<v8::Integer>(info[0].As<v8::Integer>()).ToLocalChecked()->Value();
  v8::String::Utf8Value traceId(
    isolate, Nan::MaybeLocal<v8::String>(info[1].As<v8::String>()).ToLocalChecked());
  v8::String::Utf8Value spanId(
    isolate, Nan::MaybeLocal<v8::String>(info[2].As<v8::String>()).ToLocalChecked());

  if (!IsValidId(*traceId, traceId.length()) || !IsValidId(*spanId, spanId.length())) {
    return;
  }

  SpanActivation activation;
  memcpy(activation.traceId, *traceId, std::min(traceId.length(), 32));
  memcpy(activation.spanId, *spanId, std::min(spanId.length(), 16));
  activation.startTime = HrTime();
  //activation.depth = profiling->activationDepth;

  if (profiling->spanActivations.count(index) > 0) {
    std::stack<SpanActivation>* activationStack = &profiling->spanActivations[index];
    activationStack->push(activation);
  } else {
    std::stack<SpanActivation> stack;
    stack.push(activation);
    profiling->spanActivations.insert({index, stack});
  }

  profiling->activationDepth++;
}

NAN_METHOD(ExitContext) {
  if (!profiling) {
    return;
  }

  int32_t index = Nan::MaybeLocal<v8::Int32>(info[0].As<v8::Int32>()).ToLocalChecked()->Value();

  std::stack<SpanActivation>* activationStack = &profiling->spanActivations[index];

  if (!activationStack->empty()) {
    activationStack->top().endTime = HrTime();
    profiling->finishedActivations.push_back(activationStack->top());
    activationStack->pop();
  }

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
