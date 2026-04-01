// Шаблон заголовочного файла mymodule.h
// Этот файл демонстрирует правильную структуру .h файла

// --- mymodule.h ---
#pragma once  // защита от двойного включения

#include <string>  // зависимости — только необходимые!

namespace myproject {// Объявления функций
int processData(const std::string& input);
void printReport(int result);

// Константы
constexpr int MAX_INPUT_SIZE{1024};}  // namespace myproject

// --- mymodule.cpp ---
// #include "mymodule.h"
//
// namespace myproject {//     int processData(const std::string& input) {//         return static_cast<int>(input.size());
//}
//     void printReport(int result) {//         // ...
//}
//}

// --- main.cpp ---
#include <iostream>

// Демонстрация использования
int main() {std::cout << "MAX_INPUT_SIZE = " << myproject::MAX_INPUT_SIZE << "\n";
    int result{ myproject::processData("hello") };
    std::cout << "processData result = " << result << "\n";
    return 0;}

// Реализации для компиляции примера
namespace myproject {int processData(const std::string& input) {return static_cast<int>(input.size());}
    void printReport(int result) {std::cout << "Report: " << result << "\n";}}


