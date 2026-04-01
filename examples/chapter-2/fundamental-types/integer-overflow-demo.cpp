#include <iostream>
#include <limits>
#include <cstdint>

int main() {// Unsigned wrap-around (defined)
    unsigned int u = std::numeric_limits<unsigned int>::max();
    unsigned int wrapped = u + 1;
    std::cout << "uint wrap: " << u << " + 1 = " << wrapped << "\n";

    // uint8_t wrap
    uint8_t b{ 255 };
    ++b;
    std::cout << "uint8_t wrap: 255 + 1 = " << (int)b << "\n";

    // Signed — покажем проблему через long long
    int imax{ std::numeric_limits<int>::max() };
    long long result = (long long)imax + 1;
    std::cout << "INT_MAX + 1 (as long long) = " << result << "\n";
    std::cout << "Это НЕ вмещается в int!\n";

    return 0;}


