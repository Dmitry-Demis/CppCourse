#include <iostream>

int main() {std::cout << std::boolalpha;

    // Преобразования в bool
    std::cout << "0 -> " << (bool)0   << "\n"; // false
    std::cout << "1 -> " << (bool)1   << "\n"; // true
    std::cout << "42-> " << (bool)42  << "\n"; // true

    // Арифметика
    std::cout << std::noboolalpha;
    bool t = true, f = false;
    std::cout << "true+true = " << (t+t) << "\n"; // 2
    std::cout << "true*5    = " << (t*5) << "\n"; // 5

    // Short-circuit
    std::cout << std::boolalpha;
    int divisor{ 0 };
    bool safe = (divisor != 0) && (10 / divisor > 2);
    std::cout << "safe div: " << safe << "\n"; // false (без краша)
    return 0;}


