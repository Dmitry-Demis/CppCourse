// Без массива: 5 переменных, не масштабируется
int score1 {84}, score2 {92}, score3 {76}, score4 {81}, score5 {56};
int avg{ (score1 + score2 + score3 + score4 + score5) / 5 };

// С массивом: одна переменная, легко масштабировать
#include <vector>
std::vector scores {84, 92, 76, 81, 56}; // 5 элементов


