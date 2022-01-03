#pragma once

#if defined(__GNUC__) || defined(__clang__)
#define SPLK_ASSUME_ALIGNED(n) __attribute__((assume_aligned (n)))
#else
#define SPLK_ASSUME_ALIGNED(n)
#endif
