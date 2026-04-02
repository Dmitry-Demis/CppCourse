#include <array>

int main()
{
    std::array<int, 5> a { 1, 2, 3, 4, 5 };  // все элементы заданы
    std::array<int, 5> b { 1, 2 };            // b[2], b[3], b[4] = 0
    std::array<int, 5> c {};                  // все = 0 (value-init)
    // std::array<int, 5> d;                  // мусор! (default-init)

    // constexpr — ключевое преимущество std::array:
    constexpr std::array<int, 5> primes { 2, 3, 5, 7, 11 };

    return 0;
}
