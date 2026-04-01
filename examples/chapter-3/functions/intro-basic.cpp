#include <iostream>

void sayHello() {std::cout << "Hello!\n";}

void countDown() {std::cout << "3...\n";
    std::cout << "2...\n";
    std::cout << "1...\n";
    std::cout << "Go!\n";}

int main() {sayHello();    // вызов — переходим в sayHello, потом возвращаемся
    sayHello();    // вызываем снова — код не дублируется!
    countDown();   // вызов другой функции
    sayHello();    // ещё раз

    return 0;}

