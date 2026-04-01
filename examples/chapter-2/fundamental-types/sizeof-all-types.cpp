#include <iostream>
#include <limits>
#include <climits>

int main() {std::cout << "CHAR_BIT  = " << CHAR_BIT            << " бит в байте\n";
    std::cout << "char      = " << sizeof(char)         << " байт\n";
    std::cout << "short     = " << sizeof(short)        << " байт\n";
    std::cout << "int       = " << sizeof(int)          << " байт\n";
    std::cout << "long      = " << sizeof(long)         << " байт\n";
    std::cout << "long long = " << sizeof(long long)    << " байт\n";
    std::cout << "float     = " << sizeof(float)        << " байт\n";
    std::cout << "double    = " << sizeof(double)       << " байт\n";
    std::cout << "bool      = " << sizeof(bool)         << " байт\n";
    std::cout << "\nint min = " << std::numeric_limits<int>::min()       << '\n';
    std::cout << "int max = " << std::numeric_limits<int>::max()       << '\n';
    std::cout << "ll  max = " << std::numeric_limits<long long>::max() << '\n';
    std::cout << "dbl eps = " << std::numeric_limits<double>::epsilon() << '\n';
    return 0;}

