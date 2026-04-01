#include <iostream>
#include <string>

// const& — читаем без копирования
void printName(const std::string& name) {std::cout << "Имя: " << name << '\n';
    // name += "!";  // ошибка компиляции — const запрещает изменение}

int countVowels(const std::string& s) {int count{0};
    for (char c : s)
        if (c=='a'||c=='e'||c=='i'||c=='o'||c=='u')
            ++count;
    return count;}

int main() {std::string name{"Alexander"};
    printName(name);                         // нет копии строки
    std::cout << countVowels("hello") << '\n';  // 2
    std::cout << countVowels("programming") << '\n';  // 3
    return 0;}

