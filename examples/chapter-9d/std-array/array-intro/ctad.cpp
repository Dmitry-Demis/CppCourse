#include <array>

int main()
{// Компилятор выводит std::array<int, 5>
    constexpr std::array a {9, 7, 5, 3, 1};

    // Компилятор выводит std::array<double, 2>
    constexpr std::array b {3.14, 2.71};

    return 0;}

