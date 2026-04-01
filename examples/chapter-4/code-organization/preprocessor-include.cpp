#include <iostream>   // стандартная библиотека — угловые скобки
// #include "myfile.h"  // пользовательский файл — кавычки

// #define — макрос-константа (лучше использовать constexpr!)
#define MAX_SIZE 100
#define PI 3.14159265

// constexpr — современная альтернатива #define (C++11)
constexpr int  MAX_ITEMS{100};
constexpr double PI_MODERN{3.14159265};

// Макрос-функция (избегайте — используйте inline или constexpr функции)
#define SQUARE(x) ((x) * (x))

int main() {std::cout << "MAX_SIZE = " << MAX_SIZE << '\n';
    std::cout << "PI = " << PI << '\n';
    std::cout << "SQUARE(5) = " << SQUARE(5) << '\n';

    // constexpr безопаснее: типизирован, отлаживается, нет подводных камней
    std::cout << "MAX_ITEMS = " << MAX_ITEMS << '\n';
    std::cout << "PI_MODERN = " << PI_MODERN << '\n';

    return 0;}

