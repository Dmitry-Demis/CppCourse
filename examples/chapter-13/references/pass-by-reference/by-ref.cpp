#include <iostream>
#include <string>

// const& — не копируем, не изменяем
void printByRef(const std::string& s)
{
    std::cout << s << '\n';
}

// & без const — не копируем, но можем изменить
void addExclamation(std::string& s)
{
    s += "!";
}

int main()
{
    std::string name { "Привет" };
    printByRef(name);          // дёшево: привязка ссылки
    addExclamation(name);      // изменяет оригинал
    std::cout << name << '\n'; // Привет!

    printByRef("Мир");         // OK: const-ссылка принимает rvalue
    // addExclamation("Мир");  // ОШИБКА: неконстантная ссылка не принимает rvalue
    return 0;
}
