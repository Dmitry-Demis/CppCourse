#include <algorithm>
#include <iostream>
#include <vector>

void sortVector(std::vector<int>& v) // изменяем оригинал
{std::sort(v.begin(), v.end());}

void printVector(const std::vector<int>& v) // только читаем
{for (const auto& x : v)
        std::cout << x << ' ';
    std::cout << '\n';}

int main()
{std::vector data {5, 2, 8, 1, 9, 3};
    sortVector(data);   // сортируем оригинал
    printVector(data);  // 1 2 3 5 8 9
    return 0;}

