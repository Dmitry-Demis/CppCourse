#include <iostream>
#include <limits>
#include <utility>   // std::cmp_less (C++20)

int main() {unsigned int umax = std::numeric_limits<unsigned int>::max();

    // Ловушка: -1 становится UINT_MAX
    std::cout << "Значение (unsigned int)(-1) = " << (unsigned int)(-1) << "\n";
    std::cout << "UINT_MAX                    = " << umax << "\n\n";

    // Обычное сравнение (ошибочное)
    if (-1 > umax)
        std::cout << "-1 > UINT_MAX??  <-- баг из-за неявного приведения!\n";
    else
        std::cout << "Компилятор в норме\n";

    // Правильное
    if ((long long)-1 < (long long)umax)
        std::cout << "Явное приведение: OK, -1 < UINT_MAX\n";

    return 0;}

