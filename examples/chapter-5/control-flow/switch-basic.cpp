#include <iostream>

// Возвращает название дня недели по номеру (1–7)
std::string dayName(int day)
{switch (day)
    {case 1: return "Понедельник";
        case 2: return "Вторник";
        case 3: return "Среда";
        case 4: return "Четверг";
        case 5: return "Пятница";
        case 6: return "Суббота";
        case 7: return "Воскресенье";
        default: return "Неизвестный день";}}

int main()
{int day {3};
    std::cout << "День " << day << ": " << dayName(day) << "\n";

    // Пример с break: категория числа
    int x {42};
    switch (x % 3)
    {case 0:
            std::cout << x << " делится на 3\n";
            break;
        case 1:
            std::cout << x << " даёт остаток 1 при делении на 3\n";
            break;
        case 2:
            std::cout << x << " даёт остаток 2 при делении на 3\n";
            break;
        default:
            std::cout << "Невозможный случай\n";
            break;}

    return 0;}

