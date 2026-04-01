#include <array>
#include <iostream>

std::array<int, 5> makeSequence()
{return {1, 2, 3, 4, 5};}

int main()
{auto seq {makeSequence()};
    for (int x : seq)
        std::cout << x << ' ';
    std::cout << '\n';
    return 0;}

