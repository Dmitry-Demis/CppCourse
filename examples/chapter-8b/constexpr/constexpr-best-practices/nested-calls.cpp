#include <iostream>

constexpr int goo(int c) { return c; }

constexpr int foo(int b)
{
    return goo(b);
}

int main()
{
    constexpr int r { foo(5) };
    std::cout << r << '\n';
    return 0;
}
