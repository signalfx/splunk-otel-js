#include "memory_profiling.h"
#include "util/platform.h"
#include <unordered_map>
#include <v8-profiler.h>
#include <vector>

namespace Splunk {
namespace Profiling {

namespace {
enum MemoryProfilingStringIndex {
  V8String_Name,
  V8String_ScriptName,
  V8String_LineNumber,
  V8String_Allocations,
  V8String_ParentId,
  V8String_MAX
};

struct BFSNode {
  BFSNode(v8::AllocationProfile::Node* node, uint32_t parentId)
    : node(node), parentId(parentId) {}
  v8::AllocationProfile::Node* node;
  uint32_t parentId;
};

using AllocationSample = v8::AllocationProfile::Sample;

struct MemoryProfiling {
  MemoryProfiling() { stack.reserve(128); }
  std::vector<BFSNode> stack;
  uint64_t generation = 0;
  // Used to keep track which were the new samples added to the allocation profile.
  std::unordered_map<uint64_t, uint64_t> sampleTracking;
  bool isRunning = false;
};

MemoryProfiling* profiling = nullptr;

struct StringStash {
  v8::Local<v8::String> strings[V8String_MAX];
};

v8::Local<v8::Object> ToJsHeapNode(
  v8::AllocationProfile::Node* node, uint32_t parentId, StringStash* stash) {
  auto jsNode = Nan::New<v8::Object>();
  Nan::Set(jsNode, stash->strings[V8String_Name], node->name);
  Nan::Set(jsNode, stash->strings[V8String_ScriptName], node->script_name);
  Nan::Set(jsNode, stash->strings[V8String_LineNumber], Nan::New<v8::Integer>(node->line_number));
  Nan::Set(jsNode, stash->strings[V8String_ParentId], Nan::New<v8::Uint32>(parentId));

  auto jsAllocations = Nan::New<v8::Array>(node->allocations.size());
  Nan::Set(jsNode, stash->strings[V8String_Allocations], jsAllocations);

  for (size_t allocationIndex = 0; allocationIndex < node->allocations.size(); allocationIndex++) {
    v8::AllocationProfile::Allocation* allocation = &node->allocations[allocationIndex];
    Nan::Set(
      jsAllocations, allocationIndex, Nan::New<v8::Number>(allocation->size * allocation->count));
  }

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
  int32_t maxStackDepth = 128;

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

  v8::AllocationProfile* profile = profiler->GetAllocationProfile();

  if (!profile) {
    return;
  }

  auto jsResult = Nan::New<v8::Object>();
  auto jsSamples = Nan::New<v8::Array>();
  auto jsNodeTree = Nan::New<v8::Object>();
  int32_t jsSamplesLength = 0;

  v8::AllocationProfile::Node* root = profile->GetRootNode();

  const std::vector<v8::AllocationProfile::Sample>& samples = profile->GetSamples();

  profiling->generation++;

  std::unordered_map<uint64_t, uint64_t>& sampleTracking = profiling->sampleTracking;

  for (const auto& sample : samples) {
    if (sampleTracking.count(sample.sample_id) == 0) {
      auto jsSample = Nan::New<v8::Object>();
      Nan::Set(
        jsSample, Nan::New<v8::String>("nodeId").ToLocalChecked(), Nan::New<v8::Uint32>(sample.node_id));
      Nan::Set(
        jsSample, Nan::New<v8::String>("size").ToLocalChecked(),
        Nan::New<v8::Uint32>(uint32_t(sample.size * sample.count)));
      Nan::Set(jsSamples, jsSamplesLength++, jsSample);
    }
    sampleTracking[sample.sample_id] = profiling->generation;
  }

  for (auto it = sampleTracking.begin(); it != sampleTracking.end();) {
    if (it->second != profiling->generation) {
      it = sampleTracking.erase(it);
    } else {
      ++it;
    }
  }

  StringStash stash;
  stash.strings[V8String_Name] = Nan::New<v8::String>("name").ToLocalChecked();
  stash.strings[V8String_ScriptName] = Nan::New<v8::String>("scriptName").ToLocalChecked();
  stash.strings[V8String_LineNumber] = Nan::New<v8::String>("lineNumber").ToLocalChecked();
  stash.strings[V8String_Allocations] = Nan::New<v8::String>("allocations").ToLocalChecked();
  stash.strings[V8String_ParentId] = Nan::New<v8::String>("parentId").ToLocalChecked();

  std::vector<BFSNode>& stack = profiling->stack;
  stack.clear();

  // Cut off the root node
  for (size_t i = 0; i < root->children.size(); i++) {
    stack.emplace_back(root->children[i], root->node_id);
  }

  while (!stack.empty()) {
    BFSNode graphNode = stack.back();
    stack.pop_back();

    v8::AllocationProfile::Node* node = graphNode.node;

    auto jsNode = ToJsHeapNode(node, graphNode.parentId, &stash);
    Nan::Set(jsNodeTree, Nan::New<v8::Uint32>(node->node_id), jsNode);

    for (size_t i = 0; i < node->children.size(); i++) {
      stack.emplace_back(node->children[i], node->node_id);
    }
  }

  Nan::Set(jsResult, Nan::New<v8::String>("treeMap").ToLocalChecked(), jsNodeTree);
  Nan::Set(jsResult, Nan::New<v8::String>("samples").ToLocalChecked(), jsSamples);

  info.GetReturnValue().Set(jsResult);

  delete profile;
}

NAN_METHOD(StopMemoryProfiling) {}

} // namespace Profiling
} // namespace Splunk
