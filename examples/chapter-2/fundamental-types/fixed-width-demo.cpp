#include <iostream>
#include <limits>
#include <cstdint>

template<typename T>
void show(const char* name) {using nl = std::numeric_limits<T>;
    std::cout << name
              << ": " << sizeof(T) << "b"
              << "  signed=" << nl::is_signed
              << "  min=" << (long long)nl::min()
              << "  max=" << (unsigned long long)nl::max()
              << "\n";}

int main() {show<int8_t>   ("int8_t   ");
    show<uint8_t>  ("uint8_t  ");
    show<int16_t>  ("int16_t  ");
    show<int32_t>  ("int32_t  ");
    show<int64_t>  ("int64_t  ");
    show<uint64_t> ("uint64_t ");
    show<int>      ("int      ");
    show<long>     ("long     ");
    show<long long>("long long");

    // static_assert на этапе компиляции
    static_assert(sizeof(int32_t) == 4, "int32_t must be 4 bytes");
    static_assert(sizeof(int64_t) == 8, "int64_t must be 8 bytes");
    std::cout << "\nAll static_asserts passed!\n";

    return 0;}

