#include <iostream>

// Условная компиляция — включает/исключает блоки кода
#define DEBUG  // закомментируй, чтобы отключить отладку

#ifdef DEBUG
    #define LOG(msg) std::cout << "[DEBUG] " << msg << '\n'
#else
    #define LOG(msg)  // в release-сборке LOG ничего не делает
#endif

// Проверка версии стандарта
#if __cplusplus >= 202002L
    constexpr bool HAS_CPP20{true};
#elif __cplusplus >= 201703L
    constexpr bool HAS_CPP20{false};
#endif

int divide(int a, int b) {LOG("divide вызван с " << a << " и " << b);
    if (b == 0) {LOG("Ошибка: деление на ноль!");
        return 0;}
    return a / b;}

int main() {std::cout << divide(10, 2) << '\n';
    std::cout << divide(5, 0) << '\n';
    return 0;}

