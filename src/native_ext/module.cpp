#include "metrics.h"
#include "profiling.h"
#include <nan.h>

namespace {

NAN_MODULE_INIT(Init) {
  Splunk::Metrics::Initialize(target);
  Splunk::Profiling::Initialize(target);
}

} // namespace

SPLK_BEGIN_IGNORE_CAST_FUNCTION_TYPE_WARNING
NODE_MODULE(NODE_GYP_MODULE_NAME, Init);
SPLK_END_IGNORE_CAST_FUNCTION_TYPE_WARNING
