#include <array>
#include <iostream>

void printArray(const std::array<int, 5>& arr)
{
    for (int x : arr)
        std::cout << x << ' ';
    std::cout << '\n';
}

int main()
{
    constexpr std::array primes { 2, 3, 5, 7, 11 };
    printArray(primes); // без копирования
    return 0;
}
