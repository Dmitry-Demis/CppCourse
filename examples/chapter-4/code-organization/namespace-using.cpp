#include <iostream>

namespace math {double pi{3.14159265};
    double circleArea(double r) {return pi * r * r;}}

int main() {// Вариант 1: явная квалификация (рекомендуется)
    std::cout << math::circleArea(5.0) << '\n';

    // Вариант 2: using-declaration — вводит одно имя
    using math::circleArea;
    std::cout << circleArea(3.0) << '\n';

    // Вариант 3: using-directive — вводит всё пространство имён
    // using namespace math;  // осторожно: может вызвать конфликты имён!
    // std::cout << pi << '\n';

    // std:: — тоже пространство имён, поэтому пишем std::cout, std::cin
    return 0;}

