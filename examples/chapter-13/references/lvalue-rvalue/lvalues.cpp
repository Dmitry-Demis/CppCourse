int main()
{int x {5};       // x — lvalue (переменная с именем)
    const double d {}; // d — lvalue (константная переменная)

    int arr[3] {};
    arr[0];            // arr[0] — lvalue (элемент массива)

    int& ref {x};    // ref — lvalue (ссылка)
    ++x;               // ++x — lvalue (префиксный инкремент возвращает lvalue)

    return 0;}

