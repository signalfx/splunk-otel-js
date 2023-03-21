#include "memory_profiling.h"
#include "khash.h"
#include "util/platform.h"
#include <v8-profiler.h>
#include <vector>

namespace Splunk {
namespace Profiling {

namespace {
enum MemoryProfilingStringIndex {
  V8String_Name,
  V8String_ScriptName,
  V8String_LineNumber,
  V8String_ParentId,
  V8String_MAX
};

struct BFSNode {
  BFSNode(v8::AllocationProfile::Node* node, uint32_t parentId) : node(node), parentId(parentId) {}
  v8::AllocationProfile::Node* node;
  uint32_t parentId;
};

using AllocationSample = v8::AllocationProfile::Sample;
KHASH_MAP_INIT_INT64(SampleId, uint64_t);

struct MemoryProfiling {
  MemoryProfiling() : tracking(kh_init(SampleId)) { stack.reserve(128); }
  ~MemoryProfiling() { kh_destroy(SampleId, tracking); }
  uint64_t generation = 0;
  // Used to keep track which were the new samples added to the allocation profile.
  khash_t(SampleId) * tracking;
  std::vector<BFSNode> stack;
  bool isRunning = false;
};

MemoryProfiling* profiling = nullptr;

struct StringStash {
  v8::Local<v8::String> strings[V8String_MAX];
};

v8::Local<v8::Object>
ToJsHeapNode(v8::AllocationProfile::Node* node, uint32_t parentId, StringStash* stash) {
  auto jsNode = Nan::New<v8::Object>();
  Nan::Set(jsNode, stash->strings[V8String_Name], node->name);
  Nan::Set(jsNode, stash->strings[V8String_ScriptName], node->script_name);
  Nan::Set(jsNode, stash->strings[V8String_LineNumber], Nan::New<v8::Integer>(node->line_number));
  Nan::Set(jsNode, stash->strings[V8String_ParentId], Nan::New<v8::Uint32>(parentId));
  return jsNode;
}

} // namespace

NAN_METHOD(StartMemoryProfiling) {
  if (!profiling) {
    profiling = new MemoryProfiling();
  }

  if (profiling->isRunning) {
    return;
  }

  v8::HeapProfiler* profiler = info.GetIsolate()->GetHeapProfiler();

  if (!profiler) {
    Nan::ThrowError("unable to get heap profiler - isolate not initialized");
    return;
  }

  int64_t sampleIntervalBytes = 1024 * 128;
  int32_t maxStackDepth = 256;

  if (info.Length() >= 1 && info[0]->IsObject()) {
    auto options = Nan::To<v8::Object>(info[0]).ToLocalChecked();
    auto maybeSampleIntervalBytes =
      Nan::Get(options, Nan::New("sampleIntervalBytes").ToLocalChecked());
    if (
      !maybeSampleIntervalBytes.IsEmpty() &&
      maybeSampleIntervalBytes.ToLocalChecked()->IsNumber()) {
      sampleIntervalBytes = Nan::To<int64_t>(maybeSampleIntervalBytes.ToLocalChecked()).FromJust();
    }

    auto maybeMaxStackDepth = Nan::Get(options, Nan::New("maxStackDepth").ToLocalChecked());
    if (!maybeMaxStackDepth.IsEmpty() && maybeMaxStackDepth.ToLocalChecked()->IsNumber()) {
      maxStackDepth = Nan::To<int32_t>(maybeMaxStackDepth.ToLocalChecked()).FromJust();
    }
  }

  profiling->isRunning = profiler->StartSamplingHeapProfiler(sampleIntervalBytes, maxStackDepth);
}

NAN_METHOD(CollectHeapProfile) {
  info.GetReturnValue().SetNull();

  if (!profiling) {
    return;
  }

  if (!profiling->isRunning) {
    return;
  }

  v8::HeapProfiler* profiler = info.GetIsolate()->GetHeapProfiler();

  if (!profiler) {
    return;
  }

  int64_t allocationProfileStart = HrTime();
  v8::AllocationProfile* profile = profiler->GetAllocationProfile();

  if (!profile) {
    return;
  }

  int64_t sampleProcessingStart = HrTime();
  auto jsResult = Nan::New<v8::Object>();
  auto jsSamples = Nan::New<v8::Array>();
  auto jsNodeTree = Nan::New<v8::Object>();
  int32_t jsSamplesLength = 0;

  v8::AllocationProfile::Node* root = profile->GetRootNode();

  const std::vector<v8::AllocationProfile::Sample>& samples = profile->GetSamples();

  profiling->generation++;
  uint64_t generation = profiling->generation;

  khash_t(SampleId)* tracking = profiling->tracking;

  for (const auto& sample : samples) {
    if (kh_get(SampleId, tracking, sample.sample_id) == kh_end(tracking)) {
      auto jsSample = Nan::New<v8::Object>();
      Nan::Set(
        jsSample, Nan::New<v8::String>("nodeId").ToLocalChecked(),
        Nan::New<v8::Uint32>(sample.node_id));
      Nan::Set(
        jsSample, Nan::New<v8::String>("size").ToLocalChecked(),
        Nan::New<v8::Uint32>(uint32_t(sample.size * sample.count)));
      Nan::Set(jsSamples, jsSamplesLength++, jsSample);
    }

    int ret;
    khiter_t it = kh_put(SampleId, tracking, sample.sample_id, &ret);
    if (ret != -1) {
      kh_value(tracking, it) = generation;
    }
  }

  for (khiter_t it = kh_begin(tracking); it != kh_end(tracking); ++it) {
    if (!kh_exist(tracking, it)) {
      continue;
    }

    if (kh_val(tracking, it) != generation) {
      kh_del(SampleId, tracking, it);
    }
  }

  StringStash stash;
  stash.strings[V8String_Name] = Nan::New<v8::String>("name").ToLocalChecked();
  stash.strings[V8String_ScriptName] = Nan::New<v8::String>("scriptName").ToLocalChecked();
  stash.strings[V8String_LineNumber] = Nan::New<v8::String>("lineNumber").ToLocalChecked();
  stash.strings[V8String_ParentId] = Nan::New<v8::String>("parentId").ToLocalChecked();

  std::vector<BFSNode>& stack = profiling->stack;
  stack.clear();

  // Cut off the root node
  for (v8::AllocationProfile::Node* child : root->children) {
    stack.emplace_back(child, root->node_id);
  }

  while (!stack.empty()) {
    BFSNode graphNode = stack.back();
    stack.pop_back();

    v8::AllocationProfile::Node* node = graphNode.node;

    auto jsNode = ToJsHeapNode(node, graphNode.parentId, &stash);
    Nan::Set(jsNodeTree, Nan::New<v8::Uint32>(node->node_id), jsNode);

    for (v8::AllocationProfile::Node* child : node->children) {
      stack.emplace_back(child, node->node_id);
    }
  }

  int64_t sampleProcessingEnd = HrTime();

  Nan::Set(jsResult, Nan::New<v8::String>("treeMap").ToLocalChecked(), jsNodeTree);
  Nan::Set(jsResult, Nan::New<v8::String>("samples").ToLocalChecked(), jsSamples);
  Nan::Set(
    jsResult, Nan::New<v8::String>("timestamp").ToLocalChecked(),
    Nan::New<v8::Number>(MilliSecondsSinceEpoch()));
  Nan::Set(
    jsResult, Nan::New<v8::String>("profilerCollectDuration").ToLocalChecked(),
    Nan::New<v8::Number>((double)(sampleProcessingStart - allocationProfileStart)));
  Nan::Set(
    jsResult, Nan::New<v8::String>("profilerProcessingStepDuration").ToLocalChecked(),
    Nan::New<v8::Number>((double)(sampleProcessingEnd - sampleProcessingStart)));

  info.GetReturnValue().Set(jsResult);

  delete profile;
}

NAN_METHOD(StopMemoryProfiling) {
  if (!profiling) {
    return;
  }

  if (profiling->isRunning) {
    v8::HeapProfiler* profiler = info.GetIsolate()->GetHeapProfiler();

    if (!profiler) {
      return;
    }

    profiler->StopSamplingHeapProfiler();
  }

  delete profiling;
  profiling = nullptr;
}

} // namespace Profiling
} // namespace Splunk
