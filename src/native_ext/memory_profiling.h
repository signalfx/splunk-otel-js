#pragma once

#include <nan.h>

namespace Splunk {
namespace Profiling {

NAN_METHOD(StartMemoryProfiling);
NAN_METHOD(CollectHeapProfile);
NAN_METHOD(StopMemoryProfiling);

} // namespace Profiling
} // namespace Splunk
