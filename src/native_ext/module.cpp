#include "ext.h"
#include "metrics.h"
#include "profiling.h"
#include <nan.h>

namespace {

NAN_MODULE_INIT(Init) {
  Splunk::Metrics::Initialize(target);
  Splunk::Profiling::Initialize(target);
}

} // namespace

#if (defined(__GNUC__) && GCC_VERSION >= 80000)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wcast-function-type"
#endif

NODE_MODULE(NODE_GYP_MODULE_NAME, Init);

#if (defined(__GNUC__) && GCC_VERSION >= 80000)
#pragma GCC diagnostic pop
#endif
