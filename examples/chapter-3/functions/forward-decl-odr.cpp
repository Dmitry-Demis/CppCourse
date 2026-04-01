#include <iostream>

// One Definition Rule (ODR):
// Объявлений может быть много, определение — только одно

int add(int x, int y);  // объявление #1
int add(int x, int y);  // объявление #2 — OK, повторные объявления разрешены

int main() {std::cout << add(1, 2) << '\n';
    return 0;}

int add(int x, int y) {return x + y;}  // определение — только одно!

// int add(int x, int y) {return x + y;}  // ❌ второе определение — ошибка ODR

