#include <iostream>

int main()
{int x {2};

    // Непреднамеренный fallthrough: нет break после case 2
    // Выполнение «проваливается» в case 3 и выводит обе строки
    switch (x)
    {case 1:
            std::cout << "case 1\n";
            break;
        case 2:
            std::cout << "case 2\n";
            // break отсутствует — выполнение продолжается в case 3!
        case 3:
            std::cout << "case 3\n";
            break;
        default:
            std::cout << "default\n";
            break;}

    // Намеренное «стекирование» меток: несколько case для одного действия
    char grade {'B'};
    switch (grade)
    {case 'A':
        case 'B':
        case 'C':
            std::cout << "Зачёт\n";
            break;
        case 'D':
        case 'F':
            std::cout << "Незачёт\n";
            break;
        default:
            std::cout << "Неизвестная оценка\n";
            break;}

    return 0;}

