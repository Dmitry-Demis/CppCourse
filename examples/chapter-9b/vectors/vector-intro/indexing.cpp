#include <iostream>
#include <vector>

int main()
{std::vector primes {2, 3, 5, 7, 11};

    std::cout << primes[0] << '\n'; // 2 (первый)
    std::cout << primes[4] << '\n'; // 11 (последний)

    primes[2] = 99; // изменяем элемент с индексом 2
    std::cout << primes[2] << '\n'; // 99

    // Безопасный доступ с проверкой границ:
    std::cout << primes.at(1) << '\n'; // 3 (бросает исключение при выходе за границы)

    return 0;}

