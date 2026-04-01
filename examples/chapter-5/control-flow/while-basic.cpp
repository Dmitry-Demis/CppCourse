#include <iostream>

int main()
{// Базовый while: счётчик от 1 до 5
    int count {1};
    while (count <= 5)
    {std::cout << count << "\n";
        ++count;}

    // Условие ложно с самого начала — тело не выполняется
    int x {10};
    while (x < 5)
    {std::cout << "Это не выведется\n";
        ++x;}
    std::cout << "После цикла: x = " << x << "\n";

    // Намеренный бесконечный цикл с выходом через break
    int attempts {0};
    while (true)
    {++attempts;
        if (attempts >= 3)
            break;}
    std::cout << "Попыток: " << attempts << "\n";

    // Опасность беззнакового счётчика: переполнение при уменьшении до 0
    // unsigned int u {3};
    // while (u >= 0)  // БЕСКОНЕЧНЫЙ ЦИКЛ: u никогда не станет < 0
    // {//     std::cout << u << "\n";
    //     --u;  // при u==0 следующее значение — максимум unsigned
    //}

    // Правильный вариант: знаковый счётчик
    for (int i {3}; i >= 0; --i)
        std::cout << "i = " << i << "\n";

    return 0;}

