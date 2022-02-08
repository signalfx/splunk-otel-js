#pragma once

#include <v8.h>

namespace Splunk {
namespace Profiling {
void Initialize(v8::Local<v8::Object> target);
}
} // namespace Splunk
