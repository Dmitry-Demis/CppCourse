#include <iostream>

void printSeparator() {std::cout << "----------\n";}

void printHeader(const char* title) {printSeparator();           // вызов другой функции
    std::cout << title << '\n';
    printSeparator();}

int main() {printHeader("Результаты");  // вызывает printSeparator внутри
    std::cout << "Счёт: 42\n";
    printHeader("Конец");

    return 0;}

