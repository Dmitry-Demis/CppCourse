#include <iostream>

// base по умолчанию = 10
int power(int n, int base = 10) {int result{1};
    for (int i{0}; i < n; ++i)
        result *= base;
    return result;}

void printSeparator(char ch = '-', int count = 20) {for (int i{0}; i < count; ++i)
        std::cout << ch;
    std::cout << '\n';}

int main() {std::cout << power(3)     << '\n';  // 1000  (base=10)
    std::cout << power(3, 2)  << '\n';  // 8     (base=2)
    std::cout << power(4, 10) << '\n';  // 10000

    printSeparator();          // --------------------
    printSeparator('=');       // ====================
    printSeparator('*', 5);    // *****
    return 0;}

