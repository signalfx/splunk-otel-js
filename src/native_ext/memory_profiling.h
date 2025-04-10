#pragma once

#include "ext.h"
SPLK_BEGIN_IGNORE_CAST_FUNCTION_TYPE_WARNING
#include <nan.h>
SPLK_END_IGNORE_CAST_FUNCTION_TYPE_WARNING

namespace Splunk {
namespace Profiling {

NAN_METHOD(StartMemoryProfiling);
NAN_METHOD(CollectHeapProfile);
NAN_METHOD(StopMemoryProfiling);

} // namespace Profiling
} // namespace Splunk
