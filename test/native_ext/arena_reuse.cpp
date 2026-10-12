/*
 * Copyright Splunk Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "src/native_ext/util/arena.h"

#include <assert.h>
#include <set>
#include <stdlib.h>

static std::set<ArenaNode*> allPages(const PagedArena& arena) {
  std::set<ArenaNode*> pages;
  for (ArenaNode* node = arena.head; node; node = node->next) {
    assert(pages.insert(node).second);
  }
  return pages;
}

int main() {
  PagedArena arena;
  PagedArenaInit(&arena, 128);
  for (int i = 0; i < 3; i++) assert(PagedArenaAlloc(&arena, 96));
  const auto original = allPages(arena);
  assert(original.size() == 3);

  PagedArenaReset(&arena);
  PagedArenaReset(&arena); // Reset without visiting the two later pages.
  assert(arena.current == arena.head);
  assert(PagedArenaUsedMemory(&arena) == 0);
  assert(allPages(arena) == original);

  for (int i = 0; i < 3; i++) assert(PagedArenaAlloc(&arena, 96));
  assert(allPages(arena) == original); // All pages were reused.

  PagedArenaReset(&arena);
  assert(PagedArenaAlloc(&arena, 96));
  assert(PagedArenaAlloc(&arena, 96));
  PagedArenaReset(&arena); // Reset after visiting only two of three pages.
  assert(allPages(arena) == original);

  for (int i = 0; i < 3; i++) assert(PagedArenaAlloc(&arena, 96));
  assert(allPages(arena) == original);

  for (ArenaNode* node : original) free(node);
}
