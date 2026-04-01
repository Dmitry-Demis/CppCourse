#include <iostream>

int main()
{// Целочисленные типы
    int         population  {2'000'000'000};   // C++14: апостроф — разделитель разрядов
    short       port        {8080};
    long long   distance    {9'460'730'472'580'800LL}; // световой год в метрах

    // Вещественные типы
    float       pi_f  {3.14159f};
    double      pi_d  {3.141592653589793};
    long double pi_ld {3.141592653589793238L};

    // Символьный и логический
    char        letter     {'A'};
    bool        is_running {true};

    std::cout << "int:       " << population   << '\n';
    std::cout << "short:     " << port         << '\n';
    std::cout << "long long: " << distance     << '\n';
    std::cout << "float:     " << pi_f         << '\n';
    std::cout << "double:    " << pi_d         << '\n';
    std::cout << "char:      " << letter       << '\n';
    std::cout << std::boolalpha;
    std::cout << "bool:      " << is_running   << '\n';

    return 0;}

