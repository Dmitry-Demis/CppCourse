#include <iostream>
#include <string>

void printByValue(std::string s)  // копирует всю строку!
{
    std::cout << s << '\n';
}

int main()
{
    std::string name { "Александр Иванович Петров" };
    printByValue(name); // дорогое копирование при каждом вызове
    return 0;
}
