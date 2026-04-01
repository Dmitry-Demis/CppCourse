#include <array>
#include <iostream>

// Принимает только std::array<int, 5> — жёсткая привязка к типу и размеру
void printArray(std::array<int, 5> arr)
{for (int x : arr)
        std::cout << x << ' ';
    std::cout << '\n';}

int main()
{std::array a {1, 2, 3, 4, 5};
    printArray(a); // копирует весь массив
    return 0;}

