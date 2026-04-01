#include <iostream>

bool isAdminMode() {return true;}

int main()
{// ОШИБКА: лишняя точка с запятой после if — null statement!
    // if (isAdminMode());   <-- точка с запятой здесь — пустой оператор
    //     std::cout << "...\n";  <-- выполняется ВСЕГДА, не условно

    // Правильно: без точки с запятой после условия
    if (isAdminMode())
    {std::cout << "Режим администратора активен\n";}

    // Ещё одна классическая ошибка: = вместо ==
    int x{};
    std::cout << "Введите 0 или 1: ";
    std::cin >> x;

    // НЕВЕРНО: if (x = 0) — это присваивание, всегда false!
    // if (x = 0)
    //     std::cout << "Ноль\n";

    // ВЕРНО: if (x == 0)
    if (x == 0)
        std::cout << "Вы ввели ноль\n";
    else
        std::cout << "Вы ввели не ноль\n";

    return 0;}

