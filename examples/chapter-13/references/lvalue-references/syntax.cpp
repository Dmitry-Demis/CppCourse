#include <iostream>

int main()
{
    int x { 5 };
    int& ref { x }; // ref — ссылка на x (псевдоним)

    std::cout << x   << '\n'; // 5
    std::cout << ref << '\n'; // 5 (то же самое)

    ref = 7; // изменяем x через ссылку
    std::cout << x   << '\n'; // 7
    std::cout << ref << '\n'; // 7

    x = 10;
    std::cout << ref << '\n'; // 10 — ссылка всегда отражает x

    return 0;
}
