#include <algorithm>
#include <nan.h>
#include <node_version.h>
#include <uv.h>

namespace Splunk {
namespace Metrics {
struct Counters {
  int64_t min = 0;
  int64_t max = 0;
  int64_t sum = 0;
  int64_t count = 0;

  void Add(int64_t value) {
    if (count == 0) {
      min = value;
      max = value;
    } else {
      min = (std::min)(value, min);
      max = (std::max)(value, max);
    }
    sum += value;
    count++;
  }

  int64_t Average() const { return count == 0 ? 0 : sum / count; }

  void Reset() { min = max = sum = count = 0; }
};
int64_t GetNextPollTimeoutNs() {
  return int64_t(uv_backend_timeout(uv_default_loop())) * 1000LL * 1000LL;
}
int32_t GetGcStatsIndex(v8::GCType type) {
  switch (type) {
    case v8::kGCTypeScavenge:
      return 1;
    case v8::kGCTypeMarkSweepCompact:
      return 2;
    case v8::kGCTypeIncrementalMarking:
      return 3;
    case v8::kGCTypeProcessWeakCallbacks:
      return 4;
    default:
      return -1;
  }
}
struct GcCounters {
  GcCounters(const std::string& type) : type(type) {}
  std::string type;
  Counters time;
  Counters amount;
};
struct {
  bool started = false;
  struct {
    int64_t loopStartTime = 0;
    int64_t loopEndTime = 0;
    int64_t pollTimeout = 0;
    int64_t pollStepLag = 0;
    int64_t pollIdle = 0;
    uv_prepare_t prepareHandle;
    uv_check_t checkHandle;
  } eventLoop;
  struct {
    int64_t startTime = 0;
    int64_t heapUsedPreGc = 0;
  } gc;
} state;

const size_t kGcTypes = 5;

struct {
  Counters eventLoop;
  GcCounters gcCounters[kGcTypes] = {
    {"all"},
    {"scavenge"},
    {"mark_sweep_compact"},
    {"incremental_marking"},
    {"process_weak_callbacks"}};
} stats;

void EventLoopPrepareCallback(uv_prepare_t* handle) {
  state.eventLoop.loopEndTime = uv_hrtime();
  int64_t loopTime =
    state.eventLoop.loopEndTime - state.eventLoop.loopStartTime + state.eventLoop.pollStepLag;
  state.eventLoop.pollTimeout = GetNextPollTimeoutNs();
  stats.eventLoop.Add(loopTime);
}
void EventLoopCheckCallback(uv_check_t* handle) {
  state.eventLoop.loopStartTime = uv_hrtime();

  int64_t pollStepDuration = state.eventLoop.loopStartTime - state.eventLoop.loopEndTime;

#if NODE_VERSION_AT_LEAST(14, 10, 0)
  int64_t idle = uv_metrics_idle_time(uv_default_loop());
  state.eventLoop.pollStepLag = pollStepDuration - (idle - state.eventLoop.pollIdle);
  state.eventLoop.pollIdle = idle;
#else
  state.eventLoop.pollStepLag = pollStepDuration > state.eventLoop.pollTimeout
                                  ? pollStepDuration - state.eventLoop.pollTimeout
                                  : 0;
#endif
}
void WriteCounters(
  v8::Local<v8::Object>& parent, const std::string& key, const Counters& counters) {
  auto obj = Nan::New<v8::Object>();
  Nan::Set(obj, Nan::New("min").ToLocalChecked(), Nan::New<v8::Number>(double(counters.min)));
  Nan::Set(obj, Nan::New("max").ToLocalChecked(), Nan::New<v8::Number>(double(counters.max)));
  Nan::Set(
    obj, Nan::New("average").ToLocalChecked(), Nan::New<v8::Number>(double(counters.Average())));
  Nan::Set(obj, Nan::New("sum").ToLocalChecked(), Nan::New<v8::Number>(double(counters.sum)));
  Nan::Set(obj, Nan::New("count").ToLocalChecked(), Nan::New<v8::Number>(double(counters.count)));
  Nan::Set(parent, Nan::New(key).ToLocalChecked(), obj);
}

NAN_GC_CALLBACK(GcPrologue) {
  state.gc.startTime = uv_hrtime();
  v8::HeapStatistics heapStats;
  Nan::GetHeapStatistics(&heapStats);
  state.gc.heapUsedPreGc = int64_t(heapStats.used_heap_size());
}

NAN_GC_CALLBACK(GcEpilogue) {
  int64_t duration = int64_t(uv_hrtime()) - state.gc.startTime;
  v8::HeapStatistics heapStats;
  Nan::GetHeapStatistics(&heapStats);
  int64_t heapCleared = state.gc.heapUsedPreGc - int64_t(heapStats.used_heap_size());
  state.gc.heapUsedPreGc = 0;

  int32_t statsIndex = GetGcStatsIndex(type);
  if (statsIndex != -1) {
    auto& gcStats = stats.gcCounters[statsIndex];
    gcStats.amount.Add(heapCleared);
    gcStats.time.Add(duration);
  }

  const size_t allIndex = 0;
  stats.gcCounters[allIndex].amount.Add(heapCleared);
  stats.gcCounters[allIndex].time.Add(duration);
}

NAN_METHOD(CollectCounters) {
  auto obj = Nan::New<v8::Object>();

  WriteCounters(obj, "eventLoopLag", stats.eventLoop);

  auto gcObj = Nan::New<v8::Object>();

  for (size_t i = 0; i < kGcTypes; i++) {
    auto& gcStats = stats.gcCounters[i];
    auto typeObj = Nan::New<v8::Object>();
    WriteCounters(typeObj, "collected", gcStats.amount);
    WriteCounters(typeObj, "duration", gcStats.time);
    Nan::Set(gcObj, Nan::New(gcStats.type).ToLocalChecked(), typeObj);
  }

  Nan::Set(obj, Nan::New("gc").ToLocalChecked(), gcObj);

  info.GetReturnValue().Set(obj);
}

NAN_METHOD(ResetCounters) {
  stats.eventLoop.Reset();

  for (size_t i = 0; i < kGcTypes; i++) {
    auto& gcStats = stats.gcCounters[i];
    gcStats.amount.Reset();
    gcStats.time.Reset();
  }
}

NAN_METHOD(StartCounters) {
  if (state.started) {
    return;
  }

  state.eventLoop.loopStartTime = uv_hrtime();
  state.eventLoop.pollTimeout = GetNextPollTimeoutNs();

  uv_prepare_init(uv_default_loop(), &state.eventLoop.prepareHandle);
  uv_unref((uv_handle_t*)&state.eventLoop.prepareHandle);
  uv_check_init(uv_default_loop(), &state.eventLoop.checkHandle);
  uv_unref((uv_handle_t*)&state.eventLoop.checkHandle);
  uv_check_start(&state.eventLoop.checkHandle, EventLoopCheckCallback);
  uv_prepare_start(&state.eventLoop.prepareHandle, EventLoopPrepareCallback);

  Nan::AddGCPrologueCallback(GcPrologue);
  Nan::AddGCEpilogueCallback(GcEpilogue);

  state.started = true;
}

void Initialize(v8::Local<v8::Object> target) {
  auto metricsModule = Nan::New<v8::Object>();
  Nan::Set(
    metricsModule, Nan::New("start").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StartCounters)).ToLocalChecked());

  Nan::Set(
    metricsModule, Nan::New("collect").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(CollectCounters)).ToLocalChecked());

  Nan::Set(
    metricsModule, Nan::New("reset").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ResetCounters)).ToLocalChecked());

  Nan::Set(target, Nan::New("metrics").ToLocalChecked(), metricsModule);
}
} // namespace Metrics
}