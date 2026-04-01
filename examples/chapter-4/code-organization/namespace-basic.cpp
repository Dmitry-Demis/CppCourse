#include <iostream>

// Два разных пространства имён с одинаковым именем функции
namespace math {int add(int a, int b) {return a + b;}
    int multiply(int a, int b) {return a * b;}}

namespace io {void print(int value) {std::cout << "Значение: " << value << '\n';}}

int main() {int sum{math::add(3, 4)};       // явная квалификация
    int product{math::multiply(3, 4)};

    io::print(sum);      // 7
    io::print(product);  // 12

    return 0;}

