#pragma once

#include <v8.h>

namespace Splunk {
namespace Metrics {

void Initialize(v8::Local<v8::Object> target);

} // namespace Metrics
}