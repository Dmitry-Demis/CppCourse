#include <iostream>

// if-else: выполняется только первая истинная ветка
void checkElse(bool a, bool b, bool c)
{if (a)
        std::cout << "a";
    else if (b)   // проверяется только если a == false
        std::cout << "b";
    else if (c)   // проверяется только если a и b == false
        std::cout << "c";
    std::cout << '\n';}

// if-if: проверяются все условия независимо
void checkAll(bool a, bool b, bool c)
{if (a) std::cout << "a";   // всегда проверяется
    if (b) std::cout << "b";   // всегда проверяется
    if (c) std::cout << "c";   // всегда проверяется
    std::cout << '\n';}

int main()
{// false, true, true
    std::cout << "if-else: "; checkElse(false, true, true);  // выведет: b
    std::cout << "if-if:   "; checkAll(false, true, true);   // выведет: bc

    return 0;}

