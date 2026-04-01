#include <iostream>
#include <limits>
#include <climits>
#include <cstdint>

int main() {int            i{42};
    long long      ll{9'000'000'000LL};
    unsigned int   u{4'294'967'295u};

    std::cout << "sizeof(short)     = " << sizeof(short)     << " bytes\n";
    std::cout << "sizeof(int)       = " << sizeof(int)       << " bytes\n";
    std::cout << "sizeof(long)      = " << sizeof(long)      << " bytes\n";
    std::cout << "sizeof(long long) = " << sizeof(long long) << " bytes\n";
    std::cout << "INT_MAX   = " << std::numeric_limits<int>::max()          << "\n";
    std::cout << "LLONG_MAX = " << std::numeric_limits<long long>::max()    << "\n";
    std::cout << "UINT_MAX  = " << std::numeric_limits<unsigned int>::max() << "\n";
    static_assert(sizeof(int32_t) == 4);
    static_assert(sizeof(int64_t) == 8);
    std::cout << "int64_t ll = " << ll << "\n";
    return 0;}

