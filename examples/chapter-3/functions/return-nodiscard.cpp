#include <iostream>

// [[nodiscard]] — предупреждение если результат игнорируется (C++17)
[[nodiscard]] int computeImportantValue() {return 42;}

[[nodiscard]] bool tryConnect(const char* host) {(void)host;  // заглушка
    return true;}

int main() {// computeImportantValue();  // ⚠️ warning: ignoring return value

    int val{computeImportantValue()};  // OK
    std::cout << val << '\n';

    if (!tryConnect("localhost")) {// OK — используем результат
        std::cout << "Ошибка подключения\n";} else {std::cout << "Подключено!\n";}

    return 0;}

