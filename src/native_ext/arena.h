#pragma once

#include "ext.h"
#include <stdint.h>
#include <stddef.h>

struct MemArena {
  uint8_t* memory;
  size_t offset;
  size_t capacity;
};

void MemArenaInit(MemArena* arena, void* mem, size_t capacity);
void* SPLK_ASSUME_ALIGNED(16) MemArenaAlloc(MemArena* arena, size_t size);
void MemArenaReset(MemArena* arena);
