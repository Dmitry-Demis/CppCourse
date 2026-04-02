#include <iostream>

int main()
{
    int x { 5 }, y { 6 };
    int& ref { x }; // ref привязана к x

    ref = y; // НЕ перепривязывает ref к y!
             // Это присваивает значение y переменной x
    std::cout << x << '\n'; // 6 (x изменился, не ref)

    return 0;
}
