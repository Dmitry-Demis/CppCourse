#include <iostream>

constexpr int foo(int b) // b — не constexpr
{
    // constexpr int b2 { b }; // ошибка: b не константное выражение
    return b * 2;
}

int main()
{
    constexpr int a { 5 };
    constexpr int r { foo(a) }; // OK
    std::cout << r << '\n';
    return 0;
}
