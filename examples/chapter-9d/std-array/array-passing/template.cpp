#include <array>
#include <iostream>

// T — тип элемента, N — размер (нетиповой параметр шаблона)
template <typename T, std::size_t N>
void printArray(const std::array<T, N>& arr)
{for (const auto& x : arr)
        std::cout << x << ' ';
    std::cout << '\n';}

int main()
{constexpr std::array ints {1, 2, 3, 4, 5};
    constexpr std::array doubles {1.1, 2.2, 3.3};

    printArray(ints);    // T=int, N=5
    printArray(doubles); // T=double, N=3

    return 0;}

