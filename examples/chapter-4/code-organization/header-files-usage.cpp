#include <iostream>

// Паттерн .h + .cpp: объявления в заголовке, определения в .cpp
// Здесь всё в одном файле для демонстрации

// --- math.h (содержимое заголовка) ---
// #pragma once
// int add(int a, int b);
// int multiply(int a, int b);
// double circleArea(double radius);

// --- math.cpp (реализация) ---
int add(int a, int b)       {return a + b;}
int multiply(int a, int b)  {return a * b;}
double circleArea(double r) {return 3.14159265 * r * r;}

// --- main.cpp (использование) ---
int main()
{std::cout << "3 + 4 = "        << add(3, 4)          << '\n';  // 7
    std::cout << "3 * 4 = "        << multiply(3, 4)     << '\n';  // 12
    std::cout << "circle(5) = "    << circleArea(5.0)    << '\n';  // 78.5398

    return 0;}

