#include <iostream>

consteval int doSomething(int x, int y)
{
    x = x + 2;
    int z { x + y };
    if (x > y)
        z = z - 1;
    return z;
}

int main()
{
    constexpr int g { doSomething(5, 6) }; // 12
    std::cout << g << '\n';
    return 0;
}
