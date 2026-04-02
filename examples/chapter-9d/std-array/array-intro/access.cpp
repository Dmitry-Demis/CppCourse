#include <array>
#include <iostream>

int main()
{
    constexpr std::array primes { 2, 3, 5, 7, 11 };

    std::cout << primes[0] << '\n';      // 2 — без проверки границ
    std::cout << primes.at(3) << '\n';   // 7 — с проверкой (бросает исключение)
    std::cout << primes.front() << '\n'; // 2 — первый элемент
    std::cout << primes.back() << '\n';  // 11 — последний элемент

    return 0;
}
