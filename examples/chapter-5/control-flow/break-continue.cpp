#include <iostream>

int main()
{// break: выход из бесконечного цикла при условии
    int i {0};
    while (true)
    {if (i >= 5)
            break;  // завершает цикл while
        std::cout << i << " ";
        ++i;}
    std::cout << "\n";

    // continue: пропуск чётных чисел
    for (int n {0}; n < 10; ++n)
    {if (n % 2 == 0)
            continue;  // переходит к следующей итерации
        std::cout << n << " ";  // выводятся только нечётные}
    std::cout << "\n";

    // Опасность continue в while: пропуск инкремента
    // int x {0};
    // while (x < 5)
    // {//     if (x == 2)
    //         continue;  // БЕСКОНЕЧНЫЙ ЦИКЛ: ++x никогда не выполнится при x==2
    //     ++x;
    //}

    // Правильный вариант: инкремент до continue
    int x {0};
    while (x < 5)
    {++x;  // инкремент до continue — всегда выполняется
        if (x == 3)
            continue;
        std::cout << x << " ";}
    std::cout << "\n";

    return 0;}

