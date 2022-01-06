#pragma once

#include "../ext.h"
#include <stddef.h>
#include <stdint.h>

struct MemArena {
  uint8_t* memory;
  size_t offset;
  size_t capacity;
};

struct ArenaNode {
  uint8_t* memory;
  MemArena arena;
  ArenaNode* next;
};

struct PagedArena {
  ArenaNode* nodes;
  ArenaNode* freeNodes;
  size_t pageSize;
};

void MemArenaInit(MemArena* arena, void* mem, size_t capacity);
void* SPLK_ASSUME_ALIGNED(16) MemArenaAlloc(MemArena* arena, size_t size);
void MemArenaReset(MemArena* arena);

void PagedArenaInit(PagedArena* arena, size_t pageSize);
void* SPLK_ASSUME_ALIGNED(16) PagedArenaAlloc(PagedArena* arena, size_t size);
void PagedArenaReset(PagedArena* arena);
size_t PagedArenaUsedMemory(const PagedArena* arena);
