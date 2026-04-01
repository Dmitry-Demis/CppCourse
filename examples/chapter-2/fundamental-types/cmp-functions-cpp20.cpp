#include <iostream>
#include <utility>

int main() {int          a{-1};
    unsigned int b{0u};

    if (std::cmp_less(a, b))
        std::cout << "-1 < 0 (корректно!)\n";

    int x{42'000};
    if (!std::in_range<short>(x))
        std::cout << "42000 НЕ вмещается в short\n";

    long long big{9'000'000'000LL};
    if (!std::in_range<int>(big))
        std::cout << "9 миллиардов в int не влезает!\n";

    return 0;}

