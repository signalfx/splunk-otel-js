#include "arena.h"
#include <assert.h>
#include <string.h>

namespace {
constexpr uintptr_t kAlignment = 2*sizeof(void*);
uintptr_t align(uintptr_t ptr, uintptr_t alignment) {
  uintptr_t m = ptr & (alignment - 1);

  if (m == 0) {
    return ptr;
  }

  return ptr + (alignment - m);
}
}

void MemArenaInit(MemArena* arena, void* mem, size_t capacity) {
  arena->memory = (uint8_t*)mem;
  arena->offset = 0;
  arena->capacity = capacity;
}

void* MemArenaAlloc(MemArena* arena, size_t size) {
  assert(size > 0);
  uintptr_t base_mem = (uintptr_t)arena->memory;
  uintptr_t cursor = base_mem + (uintptr_t)arena->offset;
  uintptr_t offset = align(cursor, kAlignment) - base_mem;

  if (offset + size <= arena->capacity) {
    uint8_t* alloc_mem = &arena->memory[offset];
    arena->offset = offset + size;
    memset(alloc_mem, 0, size);
    return alloc_mem;
  }

  return NULL;
}

void MemArenaReset(MemArena* arena) { arena->offset = 0; }
