#include "platform.h"
#include <uv.h>

#ifdef __APPLE__
#include <mach/mach_time.h>
#endif

namespace Splunk {

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
} // namespace Splunk
