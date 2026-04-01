#include <iostream>

// ❌ Без forward declaration — ошибка компиляции:
// 'add' was not declared in this scope

// ✅ Forward declaration решает проблему:
int add(int x, int y);  // объявление — компилятор знает о функции

int main() {std::cout << add(3, 4) << '\n';  // OK: объявление выше
    return 0;}

// Определение может быть ниже main()
int add(int x, int y) {return x + y;}

