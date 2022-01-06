#include "modp_numtoa.h"

#include <math.h>
#include <stdio.h>

/*
 * other interesting references on num to string convesion
 * http://www.jb.man.ac.uk/~slowe/cpp/itoa.html
 * and http://www.ddj.com/dept/cpp/184401596?pgno=6
 *
 * Version 19-Nov-2007
 * Fixed round-to-even rules to match printf
 *   thanks to Johannes Otepka
 * Version 22-Sep-2016
 *  Fixed rounding error with decimals ending in 5 and low precision
 */

static void strreverse(char* begin, char* end)
{
    char aux;
    while (end > begin)
        aux = *end, *end-- = *begin, *begin++ = aux;
}

size_t modp_itoa10(int32_t value, char* str)
{
    char* wstr = str;
    /* Take care of sign */
    uint32_t uvalue = (value < 0) ? (uint32_t)(-value) : (uint32_t)(value);
    /* Conversion. Number is reversed. */
    do
        *wstr++ = (char)(48 + (uvalue % 10));
    while (uvalue /= 10);
    if (value < 0)
        *wstr++ = '-';
    *wstr = '\0';

    /* Reverse string */
    strreverse(str, wstr - 1);
    return (size_t)(wstr - str);
}

size_t modp_uitoa10(uint32_t value, char* str)
{
    char* wstr = str;
    /* Conversion. Number is reversed. */
    do
        *wstr++ = (char)(48 + (value % 10));
    while (value /= 10);
    *wstr = '\0';
    /* Reverse string */
    strreverse(str, wstr - 1);
    return (size_t)(wstr - str);
}

size_t modp_litoa10(int64_t value, char* str)
{
    char* wstr = str;
    uint64_t uvalue = (value < 0) ? (uint64_t)(-value) : (uint64_t)(value);

    /* Conversion. Number is reversed. */
    do
        *wstr++ = (char)(48 + (uvalue % 10));
    while (uvalue /= 10);
    if (value < 0)
        *wstr++ = '-';
    *wstr = '\0';

    /* Reverse string */
    strreverse(str, wstr - 1);
    return (size_t)(wstr - str);
}

size_t modp_ulitoa10(uint64_t value, char* str)
{
    char* wstr = str;
    /* Conversion. Number is reversed. */
    do
        *wstr++ = (char)(48 + (value % 10));
    while (value /= 10);
    *wstr = '\0';
    /* Reverse string */
    strreverse(str, wstr - 1);
    return (size_t)(wstr - str);
}
