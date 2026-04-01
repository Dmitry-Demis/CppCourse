#include <iostream>

void doubleIt(int& x) {// & — ссылка
    x *= 2;  // изменяем оригинал!}

void swap(int& a, int& b) {int temp{a};
    a = b;
    b = temp;}

int main() {int val{5};
    doubleIt(val);
    std::cout << val << '\n';  // 10 — изменился!

    int x{3}, y{7};
    swap(x, y);
    std::cout << x << ' ' << y << '\n';  // 7 3
    return 0;}

