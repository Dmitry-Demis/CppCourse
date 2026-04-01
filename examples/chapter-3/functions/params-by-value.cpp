#include <iostream>

void doubleIt(int x) {x *= 2;  // изменяем копию, не оригинал
    std::cout << "Внутри: " << x << '\n';}

int main() {int val{5};
    doubleIt(val);
    std::cout << "Снаружи: " << val << '\n';  // 5 — не изменился!
    return 0;}
// Вывод:
// Внутри: 10
// Снаружи: 5

