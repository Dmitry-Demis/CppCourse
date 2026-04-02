#include <iostream>
#include <string>

const std::string& getProgramName()
{
    static const std::string name { "Мой калькулятор" }; // static: живёт до конца программы
    return name; // безопасно: name не уничтожается при выходе из функции
}

int main()
{
    std::cout << getProgramName() << '\n'; // Мой калькулятор
    return 0;
}
