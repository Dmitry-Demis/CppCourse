#include <iostream>
#include <limits>
#include <cmath>
#include <iomanip>

int main() {// Точность
    std::cout << std::setprecision(20);
    std::cout << "float  0.1+0.2 = " << (0.1f + 0.2f) << "\n";
    std::cout << "double 0.1+0.2 = " << (0.1  + 0.2)  << "\n";

    // Epsilon
    std::cout << std::setprecision(6);
    std::cout << "float  eps = " << std::numeric_limits<float>::epsilon()  << "\n";
    std::cout << "double eps = " << std::numeric_limits<double>::epsilon() << "\n";

    // Специальные значения
    std::cout << std::boolalpha;
    double nan{ 0.0 / 0.0 };
    std::cout << "nan==nan: " << (nan == nan) << ", isnan: " << std::isnan(nan) << "\n";
    return 0;}


