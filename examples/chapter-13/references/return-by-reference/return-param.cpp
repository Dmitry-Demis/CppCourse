#include <iostream>
#include <string>

// Возвращаем ту строку, которая идёт первой по алфавиту
const std::string& firstAlphabetical(const std::string& a, const std::string& b)
{return (a < b) ? a : b; // безопасно: a и b живут в вызывающем коде}

int main()
{std::string s1 {"Яблоко"};
    std::string s2 {"Апельсин"};
    std::cout << firstAlphabetical(s1, s2) << '\n'; // Апельсин
    return 0;}

