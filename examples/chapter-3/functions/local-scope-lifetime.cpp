#include <iostream>

void demonstrate() {int x{10};  // x создаётся здесь
    std::cout << "x = " << x << '\n';
    x = 20;
    std::cout << "x = " << x << '\n';}  // x уничтожается здесь

int main() {demonstrate();  // x создаётся и уничтожается
    demonstrate();  // x создаётся заново — всегда начинает с 10!

    // Каждый вызов — свой независимый экземпляр переменных
    return 0;}

