#include <vector>

int main()
{
    // Пустой вектор
    std::vector<int> empty {};

    // Инициализация списком (предпочтительно)
    std::vector<int> primes { 2, 3, 5, 7, 11 };

    // CTAD (C++17): компилятор выводит тип элемента
    std::vector vowels { 'a', 'e', 'i', 'o', 'u' }; // std::vector<char>

    // Вектор заданной длины (все элементы = 0)
    std::vector<int> data(10); // 10 элементов, инициализированы нулём

    // const вектор
    const std::vector<int> fixed { 1, 2, 3 }; // нельзя изменить

    return 0;
}
