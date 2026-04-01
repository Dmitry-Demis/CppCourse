#include <iostream>

// Классический синтаксис
int add_classic(int a, int b) {return a + b;}

// Trailing return type — тип после -> (C++11)
auto add_trailing(int a, int b) -> int {return a + b;}

// Полезно когда тип зависит от параметров (шаблоны)
template<typename T, typename U>
auto multiply(T a, U b) -> decltype(a * b) {return a * b;}

int main() {std::cout << add_trailing(3, 4) << '\n';   // 7
    std::cout << multiply(3, 4.5) << '\n';     // 13.5
    return 0;}

