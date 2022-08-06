#include "memory_profiling.h"
#include <v8-profiler.h>
#include <vector>
#include "util/platform.h"

namespace Splunk {
namespace Profiling {

namespace {
enum MemoryProfilingStringIndex {
  V8String_Name,
  V8String_ScriptName,
  V8String_LineNumber,
  V8String_Allocations,
  V8String_Parent,
  V8String_MAX
};

struct BFSNode {
  BFSNode(v8::AllocationProfile::Node* node, int32_t parentIndex)
    : node(node), parentIndex(parentIndex) {}
  v8::AllocationProfile::Node* node;
  // Parent index in the flattened tree
  int32_t parentIndex;
};

struct MemoryProfiling {
  MemoryProfiling() {
    stack.reserve(128);
  }
  std::vector<BFSNode> stack;
  bool isRunning = false;
};

MemoryProfiling* profiling = nullptr;

struct StringStash {
  v8::Local<v8::String> strings[V8String_MAX];
};

v8::Local<v8::Object> ToJsHeapNode(v8::AllocationProfile::Node* node, int32_t parentIndex, StringStash* stash) {
  auto jsNode = Nan::New<v8::Object>();
  Nan::Set(jsNode, stash->strings[V8String_Name], node->name);
  Nan::Set(jsNode, stash->strings[V8String_ScriptName], node->script_name);
  Nan::Set(jsNode, stash->strings[V8String_LineNumber], Nan::New<v8::Integer>(node->line_number));
  Nan::Set(jsNode, stash->strings[V8String_Parent], Nan::New<v8::Integer>(parentIndex));

  auto jsAllocations = Nan::New<v8::Array>(node->allocations.size());
  Nan::Set(jsNode, stash->strings[V8String_Allocations], jsAllocations);

  for (size_t allocationIndex = 0; allocationIndex < node->allocations.size(); allocationIndex++) {
    v8::AllocationProfile::Allocation* allocation = &node->allocations[allocationIndex];
    Nan::Set(
      jsAllocations, allocationIndex, Nan::New<v8::Number>(allocation->size * allocation->count));
  }

  return jsNode;
}

}

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

  int64_t sampleIntervalBytes = 1024 * 256;
  int32_t maxStackDepth = 256;

  if (info.Length() >= 1 && info[0]->IsObject()) {
    auto options = Nan::To<v8::Object>(info[0]).ToLocalChecked();
    auto maybeSampleIntervalBytes =
      Nan::Get(options, Nan::New("sampleIntervalBytes").ToLocalChecked());
    if (!maybeSampleIntervalBytes.IsEmpty() && maybeSampleIntervalBytes.ToLocalChecked()->IsNumber()) {
      sampleIntervalBytes = Nan::To<int64_t>(maybeSampleIntervalBytes.ToLocalChecked()).FromJust();
    }

    auto maybeMaxStackDepth =
      Nan::Get(options, Nan::New("maxStackDepth").ToLocalChecked());
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
  v8::AllocationProfile::Node* root = profile->GetRootNode();

  uint32_t flatTreeLength = 0;
  uint32_t leafsLength = 0;
  auto flatTree = Nan::New<v8::Array>();
  auto leafs = Nan::New<v8::Array>();

  StringStash stash;
  stash.strings[V8String_Name] = Nan::New<v8::String>("name").ToLocalChecked();
  stash.strings[V8String_ScriptName] = Nan::New<v8::String>("scriptName").ToLocalChecked();
  stash.strings[V8String_LineNumber] = Nan::New<v8::String>("lineNumber").ToLocalChecked();
  stash.strings[V8String_Allocations] = Nan::New<v8::String>("allocations").ToLocalChecked();
  stash.strings[V8String_Parent] = Nan::New<v8::String>("parent").ToLocalChecked();

  std::vector<BFSNode>& stack = profiling->stack;
  stack.clear();

  // Cut off the root node
  for (size_t i = 0; i < root->children.size(); i++) {
    stack.emplace_back(root->children[i], -1);
  }

  while (!stack.empty()) {
    BFSNode graphNode = stack.back();
    stack.pop_back();

    v8::AllocationProfile::Node* node = graphNode.node;

    uint32_t indexOfNode = flatTreeLength++;
    Nan::Set(flatTree, indexOfNode, ToJsHeapNode(node, graphNode.parentIndex, &stash));

    if (node->children.size() == 0) {
      Nan::Set(leafs, leafsLength++, Nan::New<v8::Number>(indexOfNode)); 
    }
    
    for (size_t i = 0; i < node->children.size(); i++) {
      stack.emplace_back(node->children[i], indexOfNode);
    }
  }

  Nan::Set(jsResult, Nan::New<v8::String>("tree").ToLocalChecked(), flatTree);
  Nan::Set(jsResult, Nan::New<v8::String>("leafs").ToLocalChecked(), leafs);

  info.GetReturnValue().Set(jsResult);

  delete profile;
}

NAN_METHOD(StopMemoryProfiling) {

}

} // namespace Profiling
} // namespace Splunk
