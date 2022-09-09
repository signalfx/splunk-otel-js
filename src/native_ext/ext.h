#pragma once

#if defined(__GNUC__)
  #define GCC_VERSION (__GNUC__ * 10000 \
                      + __GNUC_MINOR__ * 100 \
                      + __GNUC_PATCHLEVEL__)
#endif

#if (defined(__GNUC__) && GCC_VERSION >= 40900) || defined(__clang__)
#define SPLK_ASSUME_ALIGNED(n) __attribute__((assume_aligned(n)))
#else
#define SPLK_ASSUME_ALIGNED(n)
#endif
