#include <iostream>

int main()
{
    int x { 5 };
    x = 10;  // OK: x — lvalue, можно присвоить
    // 5 = x;   // ОШИБКА: 5 — rvalue, нельзя присвоить

    // lvalue неявно конвертируется в rvalue когда нужно:
    int y { x }; // x (lvalue) → rvalue (значение 10) → копируется в y

    std::cout << x << ' ' << y << '\n';
    return 0;
}
