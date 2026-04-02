#include <array>
#include <iostream>

int main()
{
    constexpr std::array primes { 2, 3, 5, 7, 11 };

    std::cout << primes.size() << '\n';      // 5 (тип size_t)
    std::cout << std::size(primes) << '\n';  // 5 (C++17)

    int len { static_cast<int>(primes.size()) };

    std::array<int, 0> empty {};
    std::cout << empty.empty() << '\n'; // 1 (true)

    return 0;
}
