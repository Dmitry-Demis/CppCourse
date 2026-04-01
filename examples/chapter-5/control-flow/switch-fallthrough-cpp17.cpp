#include <iostream>

int main()
{// C++17: [[fallthrough]] — явное указание намеренного fallthrough
    // Подавляет предупреждение компилятора и документирует намерение
    int x {1};
    switch (x)
    {case 1:
            std::cout << "Подготовка...\n";
            [[fallthrough]]; // намеренный fallthrough — предупреждения нет
        case 2:
            std::cout << "Выполнение\n";
            break;
        default:
            break;}

    // C++17: switch с инициализатором — switch(init; expr)
    // Переменная живёт только внутри блока switch
    switch (int value {42}; value % 3)
    {case 0:
            std::cout << value << " делится на 3\n";
            break;
        case 1:
            std::cout << value << " даёт остаток 1\n";
            break;
        case 2:
            std::cout << value << " даёт остаток 2\n";
            break;}
    // value недоступна здесь

    return 0;}

