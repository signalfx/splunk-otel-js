#pragma once

#include <stdint.h>
#include <stddef.h>

bool HexToBinary(const char* hex, size_t hex_len, uint8_t* buffer, size_t buffer_size);
