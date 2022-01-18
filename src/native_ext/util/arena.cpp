#include "arena.h"
#include <assert.h>
#include <stdlib.h>
#include <string.h>

namespace {
constexpr uintptr_t kAlignment = 2 * sizeof(void*);
uintptr_t align(uintptr_t ptr, uintptr_t alignment) {
  uintptr_t m = ptr & (alignment - 1);

  if (m == 0) {
    return ptr;
  }

  return ptr + (alignment - m);
}
} // namespace

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

static ArenaNode* PagedArenaNewNode(size_t capacity) {
  uint8_t* mem = (uint8_t*)calloc(1, capacity + sizeof(ArenaNode));

  if (!mem) {
    return nullptr;
  }

  ArenaNode* node = (ArenaNode*)mem;
  node->memory = mem + sizeof(ArenaNode);
  MemArenaInit(&node->arena, node->memory, capacity);

  return node;
}

void PagedArenaInit(PagedArena* arena, size_t pageSize) {
  arena->nodes = PagedArenaNewNode(pageSize);
  arena->freeNodes = nullptr;
  arena->pageSize = pageSize;
}

void* SPLK_ASSUME_ALIGNED(16) PagedArenaAlloc(PagedArena* arena, size_t size) {
  void* mem = MemArenaAlloc(&arena->nodes->arena, size);

  if (mem != nullptr) {
    return mem;
  }

  ArenaNode* node = arena->freeNodes;

  if (node) {
    arena->freeNodes = node->next;
  } else {
    node = PagedArenaNewNode(arena->pageSize);
    if (!node) {
      return nullptr;
    }
  }

  node->next = arena->nodes;
  arena->nodes = node;

  return MemArenaAlloc(&node->arena, size);
}

void PagedArenaReset(PagedArena* arena) {
  ArenaNode* node = arena->nodes;

  while (node) {
    MemArenaReset(&node->arena);
    node = node->next;
  }

  arena->freeNodes = arena->nodes->next;
  arena->nodes->next = nullptr;
}

size_t PagedArenaUsedMemory(const PagedArena* arena) {
  size_t used = 0;

  ArenaNode* node = arena->nodes;
  while (node) {
    used += node->arena.offset;
    node = node->next;
  }

  return used;
}
