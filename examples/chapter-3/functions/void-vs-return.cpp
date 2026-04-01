#include <iostream>

// Разделяем вычисление и вывод
int add(int a, int b) {return a + b;  // только вычисляет}

void printResult(int result) {std::cout << "Результат: " << result << '\n';  // только выводит}

int main() {int r{add(3, 4)};
    printResult(r);

    // add() можно использовать без вывода:
    int doubled{add(r, r)};
    std::cout << "Удвоенный: " << doubled << '\n';
    return 0;}

