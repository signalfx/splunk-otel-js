#include "platform.h"
#include <chrono>
#include <uv.h>

#ifdef __APPLE__
#include <mach/mach_time.h>
#endif

namespace Splunk {

namespace {
template <typename Duration>
int64_t SinceEpoch() {
  return std::chrono::duration_cast<Duration>(std::chrono::system_clock::now().time_since_epoch())
    .count();
}
} // namespace

#ifdef __APPLE__
int64_t HrTime() {
  static mach_timebase_info_data_t timebase;
  if (timebase.denom == 0) {
    mach_timebase_info(&timebase);
  }

  return int64_t(mach_absolute_time() * timebase.numer / timebase.denom);
}
#else
int64_t HrTime() { return uv_hrtime(); }
#endif

int64_t MicroSecondsSinceEpoch() { return SinceEpoch<std::chrono::microseconds>(); }

int64_t MilliSecondsSinceEpoch() { return SinceEpoch<std::chrono::milliseconds>(); }

} // namespace Splunk
