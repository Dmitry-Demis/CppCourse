#include <iostream>
#include <limits>
#include <climits>

int main() {long          l1{1'000'000'000L};
    unsigned long l2{4'294'967'295UL};

    std::cout << "sizeof(long)  = " << sizeof(long) << " bytes\n";
    std::cout << "LONG_MAX      = " << LONG_MAX  << '\n';
    std::cout << "ULONG_MAX     = " << ULONG_MAX << '\n';

    // Платформенная разница: Windows x64 = 4 байта, Linux x64 = 8 байт
    // Для переносимого 64-битного кода используйте long long или int64_t
    std::cout << "\nlong == int? " << (sizeof(long) == sizeof(int) ? "да (Windows)" : "нет (Linux)") << '\n';

    // Суффикс L
    auto lit{ 42L };
    std::cout << "42L тип long, sizeof = " << sizeof(lit) << " bytes\n";

    return 0;}


