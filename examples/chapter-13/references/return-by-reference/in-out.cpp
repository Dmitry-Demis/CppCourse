#include <cmath>
#include <iostream>

// sinOut и cosOut — out-параметры: функция записывает в них результат
void getSinCos(double degrees, double& sinOut, double& cosOut)
{constexpr double pi {3.14159265358979};
    double radians {degrees * pi / 180.0};
    sinOut = std::sin(radians);
    cosOut = std::cos(radians);}

int main()
{double s {}, c {};
    getSinCos(45.0, s, c);
    std::cout << "sin(45°) = " << s << '\n'; // ~0.707
    std::cout << "cos(45°) = " << c << '\n'; // ~0.707
    return 0;}

