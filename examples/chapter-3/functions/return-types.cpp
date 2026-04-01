#include <iostream>
#include <string>

double circleArea(double radius) {return 3.14159265 * radius * radius;}

bool isEven(int n) {return n % 2 == 0;}

char firstChar(const std::string& s) {return s.empty() ? '\0' : s[0];}

std::string repeat(const std::string& s, int n) {std::string result{};
    for (int i{0}; i < n; ++i)
        result += s;
    return result;}

int main() {std::cout << circleArea(5.0) << '\n';       // 78.5398
    std::cout << isEven(4) << '\n';             // 1 (true)
    std::cout << firstChar("Hello") << '\n';    // H
    std::cout << repeat("ab", 3) << '\n';       // ababab
    return 0;}

