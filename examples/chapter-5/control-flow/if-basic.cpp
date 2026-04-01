#include <iostream>

int main()
{std::cout << "Введите число: ";
    int x{};
    std::cin >> x;

    // Базовый if-else: выполняется ровно одна ветка
    if (x > 10)
        std::cout << x << " больше 10\n";
    else
        std::cout << x << " не больше 10\n";

    return 0;}

