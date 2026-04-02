#include <array>

int main()
{
    std::array<int, 5> a {};       // массив из 5 int, все = 0
    std::array<double, 3> b {};    // массив из 3 double

    // Длина должна быть константным выражением:
    constexpr int len { 8 };
    std::array<int, len> c {};     // OK: len — constexpr

    // int n { 5 };
    // std::array<int, n> d {};    // ОШИБКА: n не константа

    return 0;
}
