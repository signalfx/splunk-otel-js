#include "metrics.h"
#include "profiling.h"
#include <nan.h>

namespace {

NAN_MODULE_INIT(Init) {
  Splunk::Metrics::Initialize(target);
  Splunk::Profiling::Initialize(target);
}

} // namespace

NODE_MODULE(NODE_GYP_MODULE_NAME, Init);
