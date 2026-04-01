#include <iostream>

int main()
{std::cout << "Введите число: ";
    int x{};
    std::cin >> x;

    // Вложенные if — труднее читать, легче ошибиться
    // if (x >= 0)
    //     if (x <= 20) ...
    //     else ...
    // else ...

    // Уплощённая версия с else-if — читается как список условий
    if (x < 0)
        std::cout << x << " — отрицательное\n";
    else if (x <= 20)
        std::cout << x << " от 0 до 20\n";
    else
        std::cout << x << " больше 20\n";

    // Логические операторы объединяют условия в одном if
    std::cout << "\nВведите второе число: ";
    int y{};
    std::cin >> y;

    if (x > 0 && y > 0)
        std::cout << "Оба положительные\n";
    else if (x > 0 || y > 0)
        std::cout << "Хотя бы одно положительное\n";
    else
        std::cout << "Оба не положительные\n";

    return 0;}

