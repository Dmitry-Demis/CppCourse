#include <iostream>

consteval auto CONSTEVAL(auto value) { return value; }

constexpr int greater(int x, int y) { return x > y ? x : y; }

int main()
{
    std::cout << greater(5, 6) << '\n';           // может быть при выполнении
    std::cout << CONSTEVAL(greater(5, 6)) << '\n'; // гарантировано при компиляции
    return 0;
}
