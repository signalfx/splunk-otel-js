#include "profiling.h"
#include <algorithm>
#include <chrono>
#include <nan.h>
#include <stack>
#include <stdio.h>
#include <unordered_map>
#include <uv.h>
#include <v8-profiler.h>
#include <vector>
#include "hex.h"

namespace Profiling {

struct SpanActivation {
  char traceId[32];
  char spanId[16];
  int64_t startTime = 0;
  int64_t endTime = 0;
  int64_t depth = 0;

  SpanActivation() {
    memset(traceId, '0', sizeof(traceId));
    memset(spanId, '0', sizeof(spanId));
  }
};

const SpanActivation*
FindClosestActivation(const std::vector<SpanActivation>& activations, int64_t ts) {
  const SpanActivation* t = nullptr;

  for (const SpanActivation& activation : activations) {
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
  int64_t activationDepth = 0;
  int32_t flags = ProfilingFlags_None;
  std::vector<SpanActivation> finishedActivations;
  std::unordered_map<int64_t, std::stack<SpanActivation>> spanActivations;

  bool RecordDebugInfo() const { return (flags & ProfilingFlags_RecordDebugInfo) == 1; }
};

Profiling* profiling = nullptr;

int64_t MicroSecondsSinceEpoch() {
  return std::chrono::duration_cast<std::chrono::microseconds>(
           std::chrono::system_clock::now().time_since_epoch())
    .count();
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

  printf("Sampling interval seconds %f\n", double(samplingIntervalMicros) / 1e6);
  profiling->profiler->SetSamplingInterval(samplingIntervalMicros);
  v8::Local<v8::String> title = Nan::New("splunk-otel-js").ToLocalChecked();
  const bool recordSamples = true;
  profiling->profiler->StartProfiling(
    title, v8::kLeafNodeLineNumbers, recordSamples, v8::CpuProfilingOptions::kNoSampleLimit);
  profiling->wallStartTime = MicroSecondsSinceEpoch();
  profiling->activationDepth = 0;
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

NAN_METHOD(StopProfiling) {
  auto stopStart = MicroSecondsSinceEpoch();

  auto profilingData = Nan::New<v8::Object>();
  auto jsTraces = Nan::New<v8::Array>();
  Nan::Set(profilingData, Nan::New("stacktraces").ToLocalChecked(), jsTraces);

  char startTimeNanos[32] = {0};
  snprintf(startTimeNanos, sizeof(startTimeNanos), "%lld", profiling->wallStartTime * 1000LL);

  Nan::Set(profilingData, Nan::New("startTimeNanos").ToLocalChecked(), Nan::New(startTimeNanos).ToLocalChecked());

  info.GetReturnValue().Set(profilingData);

  if (!profiling) {
    return;
  }

  v8::Local<v8::String> title = Nan::New("splunk-otel-js").ToLocalChecked();

  auto v8StopStart = MicroSecondsSinceEpoch();
  v8::CpuProfile* profile = profiling->profiler->StopProfiling(title);
  auto v8StopEnd = MicroSecondsSinceEpoch();

  std::sort(
    profiling->finishedActivations.begin(), profiling->finishedActivations.end(),
    [](const auto& a, const auto& b) { return a.startTime < b.startTime; });

  int traceCounter = 0;
  for (int i = 0; i < profile->GetSamplesCount(); i++) {
    StackTraceBuilder builder;
    const v8::CpuProfileNode* sample = profile->GetSample(i);
    builder.Add(sample);

    int64_t ts =
      profiling->wallStartTime + (profile->GetSampleTimestamp(i) - profile->GetStartTime());

    const v8::CpuProfileNode* parent = sample->GetParent();
    while (parent) {
      builder.Add(parent);
      parent = parent->GetParent();
    }

    char tsBuf[32];
    int tsBufSize = snprintf(tsBuf, 32, "%lld", ts * 1000LL);

    auto jsTrace = Nan::New<v8::Object>();

    Nan::Set(
      jsTrace, Nan::New<v8::String>("timestamp").ToLocalChecked(),
      Nan::New<v8::String>(tsBuf, tsBufSize).ToLocalChecked());
    Nan::Set(
      jsTrace, Nan::New<v8::String>("stacktrace").ToLocalChecked(),
      Nan::New<v8::String>(builder.trace.c_str(), builder.trace.size()).ToLocalChecked());

    const SpanActivation* match = FindClosestActivation(profiling->finishedActivations, ts);

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
    }

    Nan::Set(jsTraces, traceCounter++, jsTrace);

    /*
    json_samples.push_back(nlm::json::object(
      {{"stack", builder.trace}, {"ts", ts}, {"script", sample->GetScriptResourceNameStr()}}));
    */
  }

  /*
  for (const SpanActivation& activation : profiling->finishedActivations) {
    json_activations.push_back(nlm::json::object({
      {"start", activation.startTime},
      {"end", activation.endTime},
      {"traceId", std::string(activation.traceId, 32)},
      {"spanId", std::string(activation.spanId, 16)},
      {"depth", activation.depth},
      {"name", activation.name},
      {"index", activation.index},
    }));
  }
  */

  size_t activations = profiling->finishedActivations.size();

  auto delStart = MicroSecondsSinceEpoch();
  profile->Delete();
  auto delEnd = MicroSecondsSinceEpoch();
  profiling->spanActivations.clear();
  profiling->finishedActivations.clear();

  auto stopEnd = MicroSecondsSinceEpoch();
  printf("stop: %ld us; activations %zu; v8Stop: %ld us; del: %ld us\n", stopEnd - stopStart, activations, v8StopEnd - v8StopStart, delEnd - delStart);
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
  activation.startTime = MicroSecondsSinceEpoch();
  activation.depth = profiling->activationDepth;

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
    activationStack->top().endTime = MicroSecondsSinceEpoch();
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
