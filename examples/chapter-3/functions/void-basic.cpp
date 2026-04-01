#include <iostream>

void printLine() {std::cout << "========================\n";}

void printScore(int score, int maxScore) {std::cout << "Счёт: " << score << " / " << maxScore << '\n';
    double percent{100.0 * score / maxScore};
    std::cout << "Процент: " << percent << "%\n";}

int main() {printLine();
    printScore(85, 100);
    printLine();
    return 0;}

