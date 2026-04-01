#include <iostream>
#include <limits>
#include <climits>
#include <cstdint>

int main() {long long          ll{9'000'000'000LL};
    unsigned long long ull{18'446'744'073'709'551'615ULL};

    std::cout << "sizeof(long long)  = " << sizeof(long long) << " bytes\n";
    std::cout << "LLONG_MAX          = " << LLONG_MAX << '\n';
    std::cout << "9 млрд             = " << ll << '\n';

    // ЛОВУШКА: переполнение до расширения типа
    int a{100'000}, b{100'000};
    long long wrong = a * b;           // int*int — UB (переполнение)
    long long right = (long long)a * b;// один операнд long long — OK
    std::cout << "\nwrong (int*int) = " << wrong << '\n';
    std::cout << "right (ll*int)  = " << right << '\n';

    // int64_t — переносимый аналог
    int64_t ts = 1'710'000'000'000LL; // Unix timestamp в мс
    std::cout << "timestamp ms    = " << ts << '\n';

    return 0;}

