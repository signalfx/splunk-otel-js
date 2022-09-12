#pragma once

#if defined(__GNUC__)
#define GCC_VERSION (__GNUC__ * 10000 + __GNUC_MINOR__ * 100 + __GNUC_PATCHLEVEL__)
#endif

#if (defined(__GNUC__) && GCC_VERSION >= 40900) || defined(__clang__)
#define SPLK_ASSUME_ALIGNED(n) __attribute__((assume_aligned(n)))
#else
#define SPLK_ASSUME_ALIGNED(n)
#endif

#if defined(__GNUC__) && GCC_VERSION >= 80000
#define SPLK_BEGIN_IGNORE_CAST_FUNCTION_TYPE_WARNING                                               \
  _Pragma("GCC diagnostic push") _Pragma("GCC diagnostic ignored \"-Wcast-function-type\"")
#define SPLK_END_IGNORE_CAST_FUNCTION_TYPE_WARNING _Pragma("GCC diagnostic pop")
#else
#define SPLK_BEGIN_IGNORE_CAST_FUNCTION_TYPE_WARNING
#define SPLK_END_IGNORE_CAST_FUNCTION_TYPE_WARNING
#endif
