#include <iostream>

namespace constants
{constexpr int minHeightCm{140};}

int main()
{std::cout << "Введите ваш рост (см): ";
    int height{};
    std::cin >> height;

    if (height >= constants::minHeightCm)
    {std::cout << "Вы можете кататься.\n";
        std::cout << "Приятного отдыха!\n";}
    else
    {// Блок {} позволяет выполнить несколько инструкций в одной ветке
        std::cout << "Вы ещё не доросли.\n";
        std::cout << "Нужно ещё " << (constants::minHeightCm - height) << " см.\n";}

    return 0;}

