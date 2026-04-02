#include <iostream>

int main()
{
    int x { 5 };
    const int& r1 { x };  // OK: привязка к изменяемому lvalue

    const int y { 10 };
    const int& r2 { y };  // OK: привязка к const lvalue

    const int& r3 { 42 }; // OK: привязка к rvalue (временный объект)
    std::cout << r3 << '\n'; // 42 — временный объект жив пока жива r3

    // int& bad { 42 }; // ОШИБКА: неконстантная ссылка не может привязаться к rvalue

    return 0;
}
