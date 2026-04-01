#include <iostream>

int add(int x, int y) {// x и y — локальные параметры, живут только внутри add()
    return x + y;}

int main() {int a{5};  // локальная переменная main()
    int b{3};

    std::cout << add(a, b) << '\n';  // 8

    // x и y из add() здесь недоступны — они уже уничтожены
    // std::cout << x;  // ошибка компиляции

    return 0;}

