#include <iostream>
#include <vector>

int main()
{
    std::vector<double> grades { 4.5, 3.8, 5.0, 4.2, 3.5 };

    double sum { 0.0 };
    for (double g : grades)
        sum += g;

    std::cout << "Средняя оценка: " << sum / grades.size() << '\n'; // 4.2

    return 0;
}
