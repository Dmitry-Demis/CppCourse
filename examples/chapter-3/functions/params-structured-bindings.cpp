#include <iostream>
#include <tuple>

// Возвращаем min и max одновременно
std::pair<int, int> minmax(int a, int b) {if (a < b) return {a, b};
    return {b, a};}

// Три значения через tuple
std::tuple<int, int, int> divmod(int a, int b) {return {a / b, a % b, b};}

int main() {// C++17: structured bindings — удобная распаковка
    auto [mn, mx] = minmax(7, 3);
    std::cout << "min=" << mn << " max=" << mx << '\n';  // min=3 max=7

    auto [quot, rem, divisor] = divmod(17, 5);
    std::cout << "17 / 5 = " << quot << " rem " << rem << '\n';

    return 0;}

