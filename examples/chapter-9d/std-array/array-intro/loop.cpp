#include <array>
#include <iostream>

int main()
{
    constexpr std::array scores { 85, 92, 78, 96, 61 };

    // Range-for (предпочтительно)
    for (int s : scores)
        std::cout << s << ' ';
    std::cout << '\n';

    // Индексный цикл
    for (std::size_t i { 0 }; i < scores.size(); ++i)
        std::cout << scores[i] << ' ';
    std::cout << '\n';

    return 0;
}
