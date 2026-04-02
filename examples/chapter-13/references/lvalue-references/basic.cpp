#include <iostream>

int main()
{
    int x { 5 };
    int& ref { x };  // ref — ссылка на x

    std::cout << x   << '\n'; // 5
    std::cout << ref << '\n'; // 5 — то же самое

    ref = 10;                 // изменяем через ссылку
    std::cout << x   << '\n'; // 10 — x тоже изменился!

    // Ссылка не может быть переназначена:
    int y { 20 };
    ref = y;  // это НЕ переназначение ссылки — это присваивание x = y
    std::cout << x << '\n'; // 20

    return 0;
}
