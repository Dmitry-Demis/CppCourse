#include <iostream>

int abs_value(int x) {if (x < 0)
        return -x;  // ранний выход для отрицательных
    return x;       // для остальных}

int classify(int x) {if (x < 0)  return -1;
    if (x == 0) return  0;
    return 1;}

int main() {std::cout << abs_value(-5) << '\n';  // 5
    std::cout << abs_value(3)  << '\n';  // 3
    std::cout << classify(-10) << '\n';  // -1
    std::cout << classify(0)   << '\n';  // 0
    std::cout << classify(42)  << '\n';  // 1
    return 0;}

