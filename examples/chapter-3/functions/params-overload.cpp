#include <iostream>
#include <string>

// Три перегрузки print
void print(int x) {std::cout << "int: " << x << '\n';}

void print(double x) {std::cout << "double: " << x << '\n';}

void print(const std::string& s) {std::cout << "string: " << s << '\n';}

int main() {print(42);                    // вызывает print(int)
    print(3.14);                  // вызывает print(double)
    print(std::string("hello"));  // вызывает print(const string&)
    return 0;}

