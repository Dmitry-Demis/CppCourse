#include <iostream>

void printDivision(int a, int b) {if (b == 0) {std::cout << "Ошибка: деление на ноль!\n";
        return;  // ранний выход — дальше не идём}
    std::cout << a << " / " << b << " = " << (a / b) << '\n';}

void printPositive(int n) {if (n <= 0) return;  // guard clause — ничего не делаем
    std::cout << "Положительное: " << n << '\n';}

int main() {printDivision(10, 2);   // 10 / 2 = 5
    printDivision(10, 0);   // Ошибка: деление на ноль!
    printPositive(5);       // Положительное: 5
    printPositive(-3);      // (ничего)
    return 0;}

