#include <iostream>
#include <cctype>

int main() {char c = 'H';
    std::cout << "char: " << c << ", code: " << (int)c << "\n";

    // Арифметика
    std::cout << "H+1 = " << (char)(c+1) << "\n"; // I

    // Проверки
    std::cout << std::boolalpha;
    std::cout << "isalpha: " << (bool)std::isalpha(c) << "\n";
    std::cout << "isupper: " << (bool)std::isupper(c) << "\n";

    // Алфавит
    for (char ch = 'a'; ch <= 'z'; ++ch) std::cout << ch;
    std::cout << "\n";

    // Размеры
    std::cout << "sizeof(wchar_t)  = " << sizeof(wchar_t)  << "\n";
    std::cout << "sizeof(char16_t) = " << sizeof(char16_t) << "\n";
    std::cout << "sizeof(char32_t) = " << sizeof(char32_t) << "\n";
    return 0;}

