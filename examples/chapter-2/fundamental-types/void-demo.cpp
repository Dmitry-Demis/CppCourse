#include <iostream>
#include <cstddef>

void printBytes(const void* data, std::size_t size) {const unsigned char* bytes = static_cast<const unsigned char*>(data);
    for (std::size_t i = 0; i < size; ++i)
        std::cout << std::hex << (int)bytes[i] << ' ';
    std::cout << std::dec << '\n';}

int main() {double pi = 3.14159265358979;
    std::cout << "Байты double: ";
    printBytes(&pi, sizeof(pi));

    void* ptr{ nullptr };
    std::cout << "nullptr == false: " << std::boolalpha << !ptr << '\n';
    std::cout << "sizeof(nullptr_t) = " << sizeof(std::nullptr_t) << '\n';
    return 0;}


