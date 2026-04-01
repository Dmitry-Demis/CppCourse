#include <iostream>
#include <array>

int main()
{// Range-based for: перебор массива
    std::array<int, 5> numbers {10, 20, 30, 40, 50};

    for (int n : numbers)
        std::cout << n << "\n";

    // С const-ссылкой — эффективнее для крупных объектов
    for (const int& n : numbers)
        std::cout << n * 2 << "\n";

    // Перебор строки посимвольно
    for (char c : "hello")
    {if (c != '\0')  // строковый литерал содержит завершающий нуль
            std::cout << c << " ";}
    std::cout << "\n";

    return 0;}

