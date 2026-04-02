#include <iostream>

constexpr int getValue(int x) { return x; }

int main()
{
    constexpr int a { getValue(5) }; // гарантировано при компиляции
    int b { getValue(5) };           // может быть при выполнении
    std::cout << a << ' ' << b << '\n';
    return 0;
}
