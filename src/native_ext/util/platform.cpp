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

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#define _WIN32_WINNT 0x0600
#include <windows.h>
#include <sysinfoapi.h>
int64_t MicroSecondsSinceEpoch() {
  FILETIME ft;
  GetSystemTimePreciseAsFileTime(&ft);

  int64_t t = (int64_t) ft.dwHighDateTime << 32 | ft.dwLowDateTime;
  t -= 116444736000000000LL;
  return t / 10LL;
}
#undef WIN32_LEAN_AND_MEAN
#else
#include <time.h>
int64_t MicroSecondsSinceEpoch() {
  struct timespec ts;
  if (clock_gettime(CLOCK_REALTIME, &ts) == 0) {
    return ts.tv_sec * 1000000LL + ts.tv_nsec / 1000LL;
  }

  return 0;
}
#endif

int64_t MilliSecondsSinceEpoch() { return MicroSecondsSinceEpoch() / 1000; }

} // namespace Splunk
