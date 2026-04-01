#include <iostream>
#include <limits>

int main() {short          s1{32'767};           // C++14: digit separator
    unsigned short s2{65'535u};

    std::cout << "short max    = " << std::numeric_limits<short>::max()          << '\n';
    std::cout << "ushort max   = " << std::numeric_limits<unsigned short>::max() << '\n';
    std::cout << "sizeof(short) = " << sizeof(short) << " bytes\n";

    // Переполнение unsigned — wrap-around (определённое поведение)
    unsigned short x = 65535;
    x = x + 1;
    std::cout << "65535u + 1   = " << x << '\n'; // 0

    // Integer promotion: short -> int в арифметике
    short a = 100, b = 200;
    auto result = a * b; // тип result — int, не short
    std::cout << "100 * 200    = " << result << " (тип: int)\n";

    return 0;}

