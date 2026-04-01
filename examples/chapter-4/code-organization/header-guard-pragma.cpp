// Два способа защиты заголовочного файла от двойного включения

// ── Способ 1: #pragma once (рекомендуется) ──────────────────────────────────
// #pragma once

// ── Способ 2: классические include guards ───────────────────────────────────
// #ifndef MYPROJECT_MYMODULE_H
// #define MYPROJECT_MYMODULE_H
//   ... содержимое заголовка ...
// #endif  // MYPROJECT_MYMODULE_H

// Демонстрация: без защиты двойное включение вызывает ошибку переопределения
// Здесь показываем, как #pragma once решает проблему

#pragma once

#include <string>

namespace myproject
{int processData(const std::string& input);
    void printReport(int result);

    constexpr int MAX_INPUT_SIZE{1024};}

