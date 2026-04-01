#include <iostream>

// ❌ Плохо: всё в main(), трудно читать и переиспользовать
// int main() {//     int a, b;
//     std::cin >> a >> b;
//     int sum = a + b;
//     std::cout << sum;
//}

// ✅ Хорошо: каждая функция делает одно дело

int getInput(const char* prompt) {std::cout << prompt;
    int value{};
    std::cin >> value;
    return value;}

int add(int a, int b) {return a + b;}

void printResult(int result) {std::cout << "Результат: " << result << '\n';}

int main() {int a{getInput("Введите первое число: ")};
    int b{getInput("Введите второе число: ")};
    printResult(add(a, b));
    return 0;}

