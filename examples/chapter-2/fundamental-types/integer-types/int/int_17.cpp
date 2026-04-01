#include <iostream>
#include <limits>
#include <type_traits>

int main()
{constexpr int          min_int{std::numeric_limits<int>::min()};
    constexpr int          max_int{std::numeric_limits<int>::max()};
    constexpr unsigned int min_uint{std::numeric_limits<unsigned int>::min()};
    constexpr unsigned int max_uint{std::numeric_limits<unsigned int>::max()};

    constexpr int          i{42};
    // ✅ C++14: digit separators — читаемость больших чисел
    constexpr unsigned int u{4'294'967'295u};

    static_assert(sizeof(int) == sizeof(unsigned int),
        "int и unsigned int должны иметь одинаковый размер");
    static_assert(std::is_signed_v<int> == true,
        "int должен быть знаковым");
    static_assert(std::is_signed_v<unsigned int> == false,
        "unsigned int не должен быть знаковым");
    static_assert(std::is_unsigned_v<int> == false,
        "int не должен быть беззнаковым");
    static_assert(std::is_unsigned_v<unsigned int> == true,
        "unsigned int должен быть беззнаковым");

    std::cout << "INT_MIN    = " << min_int << '\n';
    std::cout << "INT_MAX    = " << max_int << '\n';
    std::cout << "UINT_MIN   = " << min_uint << '\n';
    std::cout << "UINT_MAX   = " << max_uint << '\n';
    std::cout << "sizeof(int)        = " << sizeof(int) << " bytes\n";
    std::cout << "sizeof(unsigned)   = " << sizeof(unsigned int) << " bytes\n";

    constexpr unsigned int zero{0};
    constexpr unsigned int wrapped{zero - 1u};
    std::cout << "0u - 1   = " << wrapped << '\n';

    return 0;}
