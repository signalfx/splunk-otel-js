/**
 * <pre>
 * Copyright &copy; 2007, Nick Galbreath -- nickg [at] client9 [dot] com
 * All rights reserved.
 * https://github.com/client9/stringencoders/
 * Released under the MIT license.  See LICENSE for details.
 * </pre>
 *
 */
#pragma once

#include <stdint.h>
#include <stddef.h>

/** \brief convert an signed integer to char buffer
 *
 * \param[in] value
 * \param[out] buf the output buffer.  Should be 16 chars or more.
 */
size_t modp_itoa10(int32_t value, char* buf);

/** \brief convert an unsigned integer to char buffer
 *
 * \param[in] value
 * \param[out] buf The output buffer, should be 16 chars or more.
 */
size_t modp_uitoa10(uint32_t value, char* buf);

/** \brief convert an signed long integer to char buffer
 *
 * \param[in] value
 * \param[out] buf the output buffer.  Should be 24 chars or more.
 */
size_t modp_litoa10(int64_t value, char* buf);

/** \brief convert an unsigned long integer to char buffer
 *
 * \param[in] value
 * \param[out] buf The output buffer, should be 24 chars or more.
 */
size_t modp_ulitoa10(uint64_t value, char* buf);
