#include <nan.h>
#include "metrics.h"
#include "profiling.h"

namespace {

NAN_MODULE_INIT(Init) {
  Metrics::Initialize(target);
  Profiling::Initialize(target);
}

} // namespace

NODE_MODULE(NODE_GYP_MODULE_NAME, Init);
