// ============================================
// QUIZ SYSTEM v2 — C++ Course
// Типы вопросов: single, multiple, fill, code
// Интеграция с GameSystem (gamification.js)
// ============================================

class Quiz {
    /**
     * @param {string}  containerId  — ID DOM-элемента для рендера
     * @param {Array}   questions    — массив вопросов (см. форматы ниже)
     * @param {Object}  options      — { quizId, title, type: 'mini'|'final', passingScore: 70 }
     */
    constructor(containerId, questions, options = {}) {
        this.container     = document.getElementById(containerId);
        this.questions     = this._shuffle(questions);
        this.quizId        = options.quizId    || containerId;
        this.title         = options.title     || 'Тест';
        this.type          = options.type      || 'mini';   // 'mini' | 'final'
        this.passingScore  = options.passingScore ?? 70;    // % для зачёта

        this.current  = 0;
        this.score    = 0;
        this.answers  = [];   // сохранённые ответы
        this.answered = false;

        if (this.container) this._render();
    }

    // ------------------------------------------
    // РЕНДЕР ВОПРОСА
    // ------------------------------------------
    _render() {
        if (this.current >= this.questions.length) {
            this._showResults();
            return;
        }

        const q   = this.questions[this.current];
        const pct = Math.round((this.current / this.questions.length) * 100);
        this.answered = false;

        this.container.innerHTML = `
            <div class="quiz-container quiz--${this.type}">
                <div class="quiz-header">
                    <div class="quiz-meta">
                        <span class="quiz-title">${this.title}</span>
                        <span class="quiz-counter">Вопрос ${this.current + 1} / ${this.questions.length}</span>
                    </div>
                    <div class="quiz-progress">
                        <div class="quiz-progress-bar" style="width:${pct}%"></div>
                    </div>
                </div>

                <div class="quiz-body">
                    <div class="quiz-type-badge quiz-type--${q.type}">${this._typeLabel(q.type)}</div>
                    <div class="quiz-question">${q.question}</div>
                    ${q.code ? `<pre class="quiz-code"><code class="language-cpp">${this._escape(q.code)}</code></pre>` : ''}
                    <div class="quiz-answers" id="quiz-answers-${this.quizId}">
                        ${this._renderAnswers(q)}
                    </div>
                    <div class="quiz-feedback" id="quiz-feedback-${this.quizId}" style="display:none;"></div>
                </div>

                <div class="quiz-footer">
                    <div class="quiz-score-display">⭐ ${this.score} очков</div>
                    <div class="quiz-actions">
                        ${this.current > 0 ? `<button class="btn-quiz btn--ghost" id="btn-prev-${this.quizId}">← Назад</button>` : ''}
                        <button class="btn-quiz btn--primary" id="btn-next-${this.quizId}" style="display:none;">
                            ${this.current + 1 < this.questions.length ? 'Далее →' : 'Завершить →'}
                        </button>
                        ${q.type === 'multiple' ? `<button class="btn-quiz btn--check" id="btn-check-${this.quizId}">Проверить</button>` : ''}
                        ${q.type === 'fill'     ? `<button class="btn-quiz btn--check" id="btn-check-${this.quizId}">Проверить</button>` : ''}
                    </div>
                </div>
            </div>`;

        this._attachListeners(q);

        if (window.Prism) Prism.highlightAllUnder(this.container);
    }

    // ------------------------------------------
    // РЕНДЕР ВАРИАНТОВ ОТВЕТА по типу вопроса
    // ------------------------------------------
    _renderAnswers(q) {
        switch (q.type) {
            case 'single':
                return q.answers.map((ans, i) => `
                    <button class="quiz-answer" data-index="${i}">
                        <span class="quiz-answer-letter">${String.fromCharCode(65 + i)}</span>
                        <span>${ans}</span>
                    </button>`).join('');

            case 'multiple':
                return q.answers.map((ans, i) => `
                    <label class="quiz-answer quiz-answer--check">
                        <input type="checkbox" data-index="${i}" class="quiz-checkbox">
                        <span class="quiz-answer-letter">${String.fromCharCode(65 + i)}</span>
                        <span>${ans}</span>
                    </label>`).join('');

            case 'fill':
                return `<div class="quiz-fill-wrap">
                    <input type="text" class="quiz-fill-input" id="fill-input-${this.quizId}"
                           placeholder="Введите ответ…" autocomplete="off" spellcheck="false">
                </div>`;

            case 'code':
                // Вопрос типа «что выведет программа» — single-choice с кодом
                return q.answers.map((ans, i) => `
                    <button class="quiz-answer" data-index="${i}">
                        <span class="quiz-answer-letter">${String.fromCharCode(65 + i)}</span>
                        <span>${this._escape(ans)}</span>
                    </button>`).join('');

            default:
                return '';
        }
    }

    // ------------------------------------------
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ------------------------------------------
    _attachListeners(q) {
        const prevBtn  = document.getElementById(`btn-prev-${this.quizId}`);
        const nextBtn  = document.getElementById(`btn-next-${this.quizId}`);
        const checkBtn = document.getElementById(`btn-check-${this.quizId}`);

        if (prevBtn) prevBtn.addEventListener('click', () => { this.current--; this._render(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { this.current++; this._render(); });

        // single / code — клик по кнопке-ответу
        if (q.type === 'single' || q.type === 'code') {
            this.container.querySelectorAll('.quiz-answer').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (this.answered) return;
                    this.answered = true;
                    const idx = parseInt(btn.dataset.index);
                    this._submitSingle(q, idx);
                });
            });
        }

        // multiple — кнопка «Проверить»
        if (q.type === 'multiple' && checkBtn) {
            checkBtn.addEventListener('click', () => {
                if (this.answered) return;
                this.answered = true;
                const checked = Array.from(
                    this.container.querySelectorAll('.quiz-checkbox:checked')
                ).map(cb => parseInt(cb.dataset.index));
                this._submitMultiple(q, checked);
                checkBtn.style.display = 'none';
            });
        }

        // fill — кнопка «Проверить» или Enter
        if (q.type === 'fill') {
            const input = document.getElementById(`fill-input-${this.quizId}`);
            const doCheck = () => {
                if (this.answered || !input) return;
                this.answered = true;
                this._submitFill(q, input.value.trim());
                if (checkBtn) checkBtn.style.display = 'none';
            };
            if (checkBtn) checkBtn.addEventListener('click', doCheck);
            if (input)    input.addEventListener('keydown', e => { if (e.key === 'Enter') doCheck(); });
        }
    }

    // ------------------------------------------
    // ПРОВЕРКА ОТВЕТОВ
    // ------------------------------------------
    _submitSingle(q, selectedIdx) {
        const correct  = q.correct;
        const isRight  = selectedIdx === correct;
        const earned   = isRight ? 10 : 0;
        this.score    += earned;
        this.answers[this.current] = { selected: selectedIdx, correct, isRight };

        this.container.querySelectorAll('.quiz-answer').forEach((btn, i) => {
            btn.disabled = true;
            if (i === correct)    btn.classList.add('quiz-answer--correct');
            if (i === selectedIdx && !isRight) btn.classList.add('quiz-answer--wrong');
        });

        this._showFeedback(isRight, q.explanation, earned);
        this._showNextButton();
    }

    _submitMultiple(q, selectedIndices) {
        const correct    = q.correct; // массив индексов
        const allRight   = correct.every(i => selectedIndices.includes(i)) &&
                           selectedIndices.every(i => correct.includes(i));
        const partialOk  = correct.some(i => selectedIndices.includes(i));
        const earned     = allRight ? 10 : partialOk ? 5 : 0;
        this.score      += earned;
        this.answers[this.current] = { selected: selectedIndices, correct, isRight: allRight };

        this.container.querySelectorAll('.quiz-answer').forEach((label, i) => {
            const cb = label.querySelector('.quiz-checkbox');
            if (cb) cb.disabled = true;
            if (correct.includes(i))                          label.classList.add('quiz-answer--correct');
            if (selectedIndices.includes(i) && !correct.includes(i)) label.classList.add('quiz-answer--wrong');
        });

        this._showFeedback(allRight, q.explanation, earned);
        this._showNextButton();
    }

    _submitFill(q, value) {
        const accepted = Array.isArray(q.correct) ? q.correct : [q.correct];
        const isRight  = accepted.some(v => v.toLowerCase() === value.toLowerCase());
        const earned   = isRight ? 10 : 0;
        this.score    += earned;
        this.answers[this.current] = { selected: value, correct: accepted, isRight };

        const input = document.getElementById(`fill-input-${this.quizId}`);
        if (input) {
            input.disabled = true;
            input.classList.add(isRight ? 'fill--correct' : 'fill--wrong');
        }
        this._showFeedback(isRight, q.explanation, earned, isRight ? null : `Правильный ответ: <code>${accepted[0]}</code>`);
        this._showNextButton();
    }

    // ------------------------------------------
    // ВСПОМОГАТЕЛЬНЫЕ
    // ------------------------------------------
    _showFeedback(isRight, explanation, earned, extra = null) {
        const fb = document.getElementById(`quiz-feedback-${this.quizId}`);
        if (!fb) return;
        fb.style.display = 'flex';
        fb.className     = `quiz-feedback quiz-feedback--${isRight ? 'correct' : 'wrong'}`;
        fb.innerHTML     = `
            <div class="feedback-icon">${isRight ? '✅' : '❌'}</div>
            <div class="feedback-body">
                <strong>${isRight ? 'Правильно!' : 'Неверно'}</strong>
                <p>${explanation}</p>
                ${extra ? `<p>${extra}</p>` : ''}
                ${earned ? `<span class="feedback-points">+${earned} очков</span>` : ''}
            </div>`;

        // Анимация очков в HUD
        if (earned && window.gameSystem) {
            window.gameSystem.earnXP(earned, 'за правильный ответ');
        }
    }

    _showNextButton() {
        const btn = document.getElementById(`btn-next-${this.quizId}`);
        if (btn) btn.style.display = 'inline-flex';
    }

    _typeLabel(type) {
        return { single: 'Один ответ', multiple: 'Несколько ответов', fill: 'Введите ответ', code: 'Что выведет код?' }[type] || type;
    }

    _escape(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ------------------------------------------
    // РЕЗУЛЬТАТЫ
    // ------------------------------------------
    _showResults() {
        const maxScore = this.questions.length * 10;
        const pct      = Math.round((this.score / maxScore) * 100);
        const passed   = pct >= this.passingScore;

        let emoji, msg;
        if (pct >= 90)      { emoji = '🏆'; msg = 'Отлично! Превосходный результат!'; }
        else if (pct >= 70) { emoji = '👍'; msg = 'Хорошо! Есть небольшие пробелы.'; }
        else if (pct >= 50) { emoji = '📚'; msg = 'Неплохо, но стоит повторить материал.'; }
        else                { emoji = '💪'; msg = 'Рекомендуем перечитать параграф.'; }

        // Сохраняем результат
        this._saveResult(pct, passed);

        // Начисляем очки в геймификацию
        if (passed && window.gameSystem) {
            const pts = this.type === 'final' ? 30 : 10;
            window.gameSystem.earnXP(pts, `за ${this.type === 'final' ? 'итоговый' : 'мини'}-тест`);
            window.gameSystem.earnCoins(pts, `за ${this.type === 'final' ? 'итоговый' : 'мини'}-тест`);
            if (this.type === 'final') {
                window.gameSystem.updateQuest('weekly_1');
            }
        }

        const correctCount = this.answers.filter(a => a && a.isRight).length;

        this.container.innerHTML = `
            <div class="quiz-results">
                <div class="results-emoji">${emoji}</div>
                <h2 class="results-title">Результаты теста</h2>
                <div class="results-circle">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-primary)" stroke-width="8"/>
                        <circle cx="50" cy="50" r="42" fill="none"
                                stroke="${passed ? 'var(--accent-green)' : 'var(--accent-orange)'}"
                                stroke-width="8"
                                stroke-dasharray="${pct * 2.639} 263.9"
                                stroke-linecap="round"
                                transform="rotate(-90 50 50)"/>
                    </svg>
                    <div class="results-pct">${pct}%</div>
                </div>
                <p class="results-msg">${msg}</p>
                <div class="results-stats">
                    <div class="rstat"><div class="rstat-v">${this.score}</div><div class="rstat-l">Очков</div></div>
                    <div class="rstat"><div class="rstat-v">${correctCount}</div><div class="rstat-l">Правильных</div></div>
                    <div class="rstat"><div class="rstat-v">${this.questions.length}</div><div class="rstat-l">Вопросов</div></div>
                </div>
                ${passed && this.type === 'final' ? `<div class="results-achievement">🏆 Достижение разблокировано!</div>` : ''}
                <div class="results-actions">
                    <button class="btn btn--primary" onclick="location.reload()">Пройти снова</button>
                    <button class="btn btn--secondary" onclick="window.scrollTo({top:0,behavior:'smooth'})">К началу страницы</button>
                </div>
            </div>`;
    }

    _saveResult(pct, passed) {
        const key   = `quiz_${this.quizId}`;
        const prev  = JSON.parse(localStorage.getItem(key) || '{}');
        const entry = {
            date:    new Date().toISOString(),
            score:   this.score,
            pct,
            passed,
            type:    this.type,
            attempt: (prev.attempt || 0) + 1,
            best:    Math.max(pct, prev.best || 0)
        };
        localStorage.setItem(key, JSON.stringify(entry));

        // Флаг прохождения финального теста (для разблокировки следующего параграфа)
        if (passed && this.type === 'final') {
            localStorage.setItem(`final_passed_${this.quizId}`, '1');
        }

        // Отправляем прогресс на сервер если пользователь залогинен
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (user && user.isuNumber) {
            fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isuNumber: user.isuNumber,
                    chapterId: 'chapter-1',
                    chapterTitle: 'Глава I: Фундаментальные типы данных',
                    testId: this.quizId,
                    testTitle: this.title,
                    points: pct
                })
            })
            .then(r => r.json())
            .then(d => console.log('[Quiz] Progress saved:', d))
            .catch(e => console.error('[Quiz] Failed to save progress:', e));
        }
    }
}

// ============================================
// FINAL QUIZ — класс-обёртка для итогового теста
// ============================================
class FinalQuiz extends Quiz {
    constructor(containerId, questions, options = {}) {
        super(containerId, questions, {
            type: 'final',
            passingScore: 70,
            ...options
        });
    }
}

// ============================================
// БАНКИ ВОПРОСОВ — §1 Введение в типы
// ============================================

/** Мини-тест §1: Введение в фундаментальные типы (10 вопросов) */
const introTypesQuestions = [
    {
        type: 'single',
        question: 'Что такое фундаментальные типы данных в C++?',
        answers: [
            'Типы, определённые пользователем через struct и class',
            'Встроенные типы языка: целые числа, числа с плавающей точкой, символы, bool',
            'Типы из стандартной библиотеки std::string, std::vector',
            'Типы, зависящие от операционной системы'
        ],
        correct: 1,
        explanation: 'Фундаментальные (встроенные) типы — это базовые типы, определённые самим стандартом C++: целочисленные, с плавающей точкой, символьные, bool и void.'
    },
    {
        type: 'single',
        question: 'Какой оператор позволяет узнать размер типа или переменной в байтах?',
        answers: ['size()', 'sizeof', 'length()', 'bitcount()'],
        correct: 1,
        explanation: 'Оператор sizeof возвращает размер типа или объекта в байтах. Например, sizeof(int) обычно равно 4.'
    },
    {
        type: 'code',
        question: 'Что выведет этот код?',
        code: `#include <iostream>
int main() {
    std::cout << sizeof(char) << " " << sizeof(bool);
}`,
        answers: ['1 1', '1 4', '2 1', '4 1'],
        correct: 0,
        explanation: 'char всегда занимает ровно 1 байт (гарантия стандарта). bool также обычно 1 байт, хотя стандарт не фиксирует его размер жёстко.'
    },
    {
        type: 'multiple',
        question: 'Отметьте ВСЕ фундаментальные типы C++:',
        answers: ['int', 'std::string', 'double', 'bool', 'std::vector<int>'],
        correct: [0, 2, 3],
        explanation: 'int, double и bool — фундаментальные типы. std::string и std::vector — это классы из стандартной библиотеки, не фундаментальные типы.'
    },
    {
        type: 'single',
        question: 'C++ — это язык со статической или динамической типизацией?',
        answers: [
            'Динамической — тип переменной определяется во время выполнения',
            'Статической — тип переменной известен на этапе компиляции',
            'Нет типизации — C++ untyped язык',
            'Смешанной — зависит от компилятора'
        ],
        correct: 1,
        explanation: 'C++ — статически типизированный язык. Тип каждой переменной должен быть известен компилятору во время компиляции. Это позволяет ловить ошибки типов ещё до запуска программы.'
    },
    {
        type: 'fill',
        question: 'Напишите название модификатора, который делает целочисленный тип беззнаковым (только положительные числа):',
        correct: ['unsigned'],
        explanation: 'Ключевое слово unsigned убирает знак и удваивает максимальный диапазон положительных значений. Например, unsigned int хранит от 0 до 4 294 967 295.'
    },
    {
        type: 'single',
        question: 'Что гарантирует стандарт C++ о размерах целочисленных типов?',
        answers: [
            'Точные размеры: short=2 байта, int=4 байта, long=8 байт',
            'Только минимальные размеры: sizeof(short) ≥ 2, sizeof(int) ≥ 2 и т.д.',
            'Ничего — размеры полностью определяет компилятор',
            'Размеры одинаковы на всех платформах'
        ],
        correct: 1,
        explanation: 'Стандарт гарантирует только минимальные размеры: short ≥ 16 бит, int ≥ 16 бит, long ≥ 32 бита, long long ≥ 64 бита. Фактические размеры могут быть больше.'
    },
    {
        type: 'code',
        question: 'Найдите ошибку в коде:',
        code: `int x = 3.14;
std::cout << x;`,
        answers: [
            'Ошибки нет, x == 3.14',
            'Нет ошибки компиляции, но x == 3 (усечение дробной части)',
            'Ошибка компиляции: нельзя присваивать double переменной int',
            'Нет ошибки, x == 3.0'
        ],
        correct: 1,
        explanation: 'Это неявное сужающее преобразование (narrowing conversion). Компилятор молча усечёт 3.14 до 3. Код скомпилируется (возможно, с предупреждением), но x будет равен 3.'
    },
    {
        type: 'multiple',
        question: 'Какие из перечисленных модификаторов применимы к типу int?',
        answers: ['signed', 'unsigned', 'short', 'long', 'float'],
        correct: [0, 1, 2, 3],
        explanation: 'К int применимы: signed/unsigned (знаковость) и short/long (размер). float не является модификатором — это отдельный тип.'
    },
    {
        type: 'single',
        question: 'Какой заголовочный файл нужно подключить для использования std::numeric_limits?',
        answers: ['<limits.h>', '<cstdlib>', '<limits>', '<numeric>'],
        correct: 2,
        explanation: 'Шаблон std::numeric_limits<T> находится в заголовке <limits>. Он позволяет узнать точные характеристики любого числового типа: минимум, максимум, epsilon и т.д.'
    }
];

/** Мини-тест §2: Целочисленные типы — long long (10 вопросов) */
const longLongQuestions = [
    {
        type: 'single',
        question: 'Какой минимальный гарантированный размер типа long long?',
        answers: ['32 бита', '48 битов', '64 бита', '128 битов'],
        correct: 2,
        explanation: 'Стандарт C++11 гарантирует, что long long имеет размер не менее 64 бит (8 байт).'
    },
    {
        type: 'fill',
        question: 'Какой суффикс используется для целочисленных литералов типа long long? (например: 100___)',
        correct: ['LL', 'll'],
        explanation: 'Суффикс LL (или ll) указывает компилятору, что литерал является типом long long. Например: 9000000000LL'
    },
    {
        type: 'code',
        question: 'Что выведет программа?',
        code: `#include <iostream>
int main() {
    long long x = 9000000000LL;
    std::cout << x;
}`,
        answers: ['9000000000', 'Ошибка компиляции', 'Переполнение: -1294967296', '0'],
        correct: 0,
        explanation: '9 миллиардов помещается в long long (макс. ~9.2×10^18). Программа выводит 9000000000.'
    },
    {
        type: 'single',
        question: 'Максимальное значение signed long long равно приблизительно:',
        answers: ['2.1 × 10^9', '4.3 × 10^9', '9.2 × 10^18', '1.8 × 10^19'],
        correct: 2,
        explanation: 'Максимум signed long long = 2^63 − 1 ≈ 9.22 × 10^18. Это ~9.2 квинтиллиона.'
    },
    {
        type: 'multiple',
        question: 'Отметьте корректные объявления переменной long long:',
        answers: [
            'long long x = 100LL;',
            'long long x = 100;',
            'long long x = 100.0;',
            'long long int x = 100;'
        ],
        correct: [0, 1, 3],
        explanation: 'Все варианты кроме 100.0 корректны (100.0 — double, потребует явного каста). long long и long long int — это одно и то же.'
    },
    {
        type: 'code',
        question: 'Что произойдёт при выполнении кода?',
        code: `int a = 2000000000;
int b = 2000000000;
long long result = a + b;
std::cout << result;`,
        answers: [
            '4000000000',
            '-294967296 (переполнение int происходит ДО расширения до long long)',
            'Ошибка компиляции',
            'Неопределённое поведение'
        ],
        correct: 1,
        explanation: 'Сложение a + b выполняется как int + int, что переполняется (UB для signed). Результат не определён стандартом, а на практике часто даёт отрицательное число.'
    },
    {
        type: 'fill',
        question: 'Напишите имя константы из <climits>, которая хранит максимальное значение long long:',
        correct: ['LLONG_MAX'],
        explanation: 'LLONG_MAX определена в <climits> и равна 9 223 372 036 854 775 807. Также доступна через std::numeric_limits<long long>::max().'
    },
    {
        type: 'single',
        question: 'В каком стандарте C++ был официально введён тип long long?',
        answers: ['C++98', 'C++03', 'C++11', 'C++14'],
        correct: 2,
        explanation: 'long long был де-факто расширением GCC до C++11, но официально стал частью стандарта именно в C++11.'
    },
    {
        type: 'code',
        question: 'Как корректно посчитать произведение двух int и сохранить в long long?',
        code: `int a = 100000, b = 100000;
// Выберите правильный вариант:`,
        answers: [
            'long long r = a * b;',
            'long long r = (long long)a * b;',
            'long long r = long long(a * b);',
            'long long r = a * (long long)b;'
        ],
        correct: 1,
        explanation: 'Нужно привести хотя бы один операнд к long long ДО умножения. Варианты Б и Г правильны. Вариант А: умножение идёт как int*int и уже переполняется. Вариант В приводит уже переполненный результат.'
    },
    {
        type: 'multiple',
        question: 'Какие применения типично требуют long long (а не int)?',
        answers: [
            'Хранение размера файла в байтах (до нескольких ГБ)',
            'Счётчик итераций цикла до 1000',
            'Временны́е метки Unix в миллисекундах',
            'Идентификаторы записей в большой базе данных',
            'Цвет пикселя (0–255)'
        ],
        correct: [0, 2, 3],
        explanation: 'long long нужен, когда значения превышают ~2.1 млрд. Размеры файлов, timestamp в мс (≈1.7×10^12) и большие ID требуют 64-битного типа.'
    }
];

/** Мини-тест §3: Типы с плавающей точкой (10 вопросов) */
const floatingPointQuestions = [
    {
        type: 'single',
        question: 'Какой стандарт описывает представление вещественных чисел в C++?',
        answers: ['ISO 9899', 'IEEE 754', 'POSIX 1003', 'ISO 14882'],
        correct: 1,
        explanation: 'Большинство реализаций C++ используют стандарт IEEE 754 для представления чисел float и double.'
    },
    {
        type: 'single',
        question: 'Сколько байт занимает тип double?',
        answers: ['4 байта', '6 байт', '8 байт', '10 байт'],
        correct: 2,
        explanation: 'double — 64-битное (8 байт) число с двойной точностью по IEEE 754.'
    },
    {
        type: 'fill',
        question: 'Какой суффикс обозначает литерал типа float? (например: 3.14___)',
        correct: ['f', 'F'],
        explanation: 'Суффикс f или F делает числовой литерал типом float. Без суффикса 3.14 имеет тип double.'
    },
    {
        type: 'code',
        question: 'Что выведет код?',
        code: `#include <iostream>
int main() {
    float a = 0.1f + 0.2f;
    std::cout << (a == 0.3f);
}`,
        answers: ['1 (true)', '0 (false)', 'Ошибка компиляции', 'Неопределённое поведение'],
        correct: 1,
        explanation: '0.1 + 0.2 в двоичном IEEE 754 даёт 0.30000001192..., что не равно 0.3f. Сравнение вещественных чисел через == — типичная ловушка.'
    },
    {
        type: 'multiple',
        question: 'Какие из следующих значений являются специальными в IEEE 754?',
        answers: ['NaN (Not a Number)', 'Infinity (бесконечность)', '-0.0', '42.0', 'DBL_MAX + 1'],
        correct: [0, 1, 2],
        explanation: 'NaN, ±Infinity и -0.0 — специальные значения IEEE 754. 42.0 — обычное число. DBL_MAX + 1 даёт Inf, но сам DBL_MAX не является специальным.'
    },
    {
        type: 'single',
        question: 'Что такое «машинный эпсилон» (epsilon)?',
        answers: [
            'Минимальное положительное число типа',
            'Наименьшее x > 0 такое, что 1.0 + x ≠ 1.0',
            'Разность между max и min значениями типа',
            'Погрешность любого вычисления'
        ],
        correct: 1,
        explanation: 'Машинный эпсилон — это наименьшее число, которое при сложении с 1.0 даёт результат, отличный от 1.0. Для double ≈ 2.22×10^-16.'
    },
    {
        type: 'code',
        question: 'Как корректно сравнить два вещественных числа?',
        code: `double a = 0.1 + 0.2;
double b = 0.3;
// Выберите правильный способ сравнения`,
        answers: [
            'if (a == b)',
            'if (std::abs(a - b) < 1e-9)',
            'if (a - b == 0)',
            'if ((int)a == (int)b)'
        ],
        correct: 1,
        explanation: 'Вещественные числа нужно сравнивать через абсолютную (или относительную) погрешность: |a - b| < epsilon. Прямое сравнение == ненадёжно из-за ошибок округления.'
    },
    {
        type: 'single',
        question: 'Чему равно sizeof(float) согласно стандарту C++?',
        answers: [
            'Всегда 4',
            'Не определено стандартом, но sizeof(float) ≤ sizeof(double)',
            'Зависит только от компилятора',
            'Всегда 8'
        ],
        correct: 1,
        explanation: 'Стандарт не фиксирует точный размер float, но требует sizeof(float) ≤ sizeof(double) ≤ sizeof(long double). На практике float = 4 байта.'
    },
    {
        type: 'fill',
        question: 'Напишите результат деления 1.0 / 0.0 в C++ (не исключение, а особое значение):',
        correct: ['inf', 'Inf', 'infinity', '+inf'],
        explanation: 'Деление ненулевого числа на 0.0 в IEEE 754 даёт +Infinity (inf). Это не исключение и не UB для типов с плавающей точкой.'
    },
    {
        type: 'multiple',
        question: 'Отметьте верные утверждения о long double:',
        answers: [
            'sizeof(long double) >= sizeof(double)',
            'На x86 Windows long double == double (8 байт)',
            'long double всегда 16 байт',
            'На Linux x86-64 long double обычно 10 байт (80-битный формат)'
        ],
        correct: [0, 1, 3],
        explanation: 'long double ≥ double по стандарту. На Windows MSVC long double == double = 8 байт. На Linux/GCC x86-64 — 80-битный расширенный формат (10 байт, выровненный до 12 или 16).'
    }
];

/** Мини-тест §4: Символьные типы (10 вопросов) */
const characterTypesQuestions = [
    {
        type: 'single',
        question: 'Чему равно sizeof(char) по стандарту C++?',
        answers: ['Зависит от платформы', 'Всегда 1', 'Обычно 2 для Unicode', '4 в C++20'],
        correct: 1,
        explanation: 'sizeof(char) == 1 — это единственный тип, размер которого жёстко зафиксирован стандартом.'
    },
    {
        type: 'code',
        question: 'Что выведет код?',
        code: `#include <iostream>
int main() {
    char c = 'A';
    std::cout << (int)c;
}`,
        answers: ['A', '65', '1', 'Ошибка компиляции'],
        correct: 1,
        explanation: "Символ 'A' имеет ASCII-код 65. Приведение к int выводит числовое значение символа."
    },
    {
        type: 'fill',
        question: 'Какой escape-последовательностью обозначается символ новой строки?',
        correct: ['\\n', '\n'],
        explanation: "Символ '\\n' — это escape-последовательность для LF (Line Feed, код 10). Он переводит курсор на новую строку."
    },
    {
        type: 'single',
        question: 'Является ли тип char знаковым или беззнаковым?',
        answers: [
            'Всегда знаковый (signed)',
            'Всегда беззнаковый (unsigned)',
            'Определяется реализацией (implementation-defined)',
            'Беззнаковый на little-endian системах'
        ],
        correct: 2,
        explanation: 'Знаковость обычного char не определена стандартом — это зависит от компилятора и платформы. Для надёжности используйте явно signed char или unsigned char.'
    },
    {
        type: 'multiple',
        question: 'Какие типы символов введены в C++11 для Unicode?',
        answers: ['wchar_t', 'char16_t', 'char32_t', 'uchar_t', 'unicode_t'],
        correct: [1, 2],
        explanation: 'char16_t (UTF-16) и char32_t (UTF-32) введены в C++11. wchar_t существовал раньше. uchar_t и unicode_t не существуют.'
    },
    {
        type: 'code',
        question: 'Что выведет код?',
        code: `#include <iostream>
int main() {
    char a = 'a', z = 'z';
    std::cout << (z - a);
}`,
        answers: ['25', '26', '1', 'Ошибка'],
        correct: 0,
        explanation: "ASCII-код 'z' = 122, 'a' = 97. Разница = 122 - 97 = 25. Это число букв между a и z (не включая a)."
    },
    {
        type: 'single',
        question: 'Для чего предназначен тип char8_t (C++20)?',
        answers: [
            'Хранение 8-битных целых чисел',
            'Хранение UTF-8 кодовых единиц с явной семантикой',
            'Замена unsigned char в низкоуровневом коде',
            'Хранение символов китайского алфавита'
        ],
        correct: 1,
        explanation: 'char8_t введён в C++20 для явного обозначения UTF-8 кодовых единиц. Это устраняет неоднозначность: обычный char может быть signed/unsigned, а char8_t — всегда беззнаковый и семантически — UTF-8.'
    },
    {
        type: 'fill',
        question: 'Напишите escape-последовательность для символа табуляции:',
        correct: ['\\t', '\t'],
        explanation: "'\\t' — горизонтальная табуляция (HT, код 9). Используется для отступов в тексте."
    },
    {
        type: 'single',
        question: 'Какой размер имеет wchar_t на Windows (MSVC)?',
        answers: ['1 байт', '2 байта (UTF-16)', '4 байта (UTF-32)', 'Зависит от настроек'],
        correct: 1,
        explanation: 'На Windows wchar_t = 2 байта (UTF-16LE). На Linux/GCC = 4 байта (UTF-32). Это ключевое отличие, делающее wchar_t непортабельным.'
    },
    {
        type: 'multiple',
        question: 'Какие escape-последовательности корректны в C++?',
        answers: ["'\\n' — новая строка", "'\\0' — нулевой символ", "'\\r' — возврат каретки", "'\\e' — Escape (ASCII 27)", "'\\q' — двойные кавычки"],
        correct: [0, 1, 2],
        explanation: "'\\n', '\\0', '\\r' — стандартные escape-последовательности C++. '\\e' не является стандартной (только GCC-расширение). Для двойных кавычек используется '\\\"', а не '\\q'."
    }
];

/** Мини-тест §5: bool и void (10 вопросов) */
const boolVoidQuestions = [
    {
        type: 'single',
        question: 'Какое числовое значение соответствует true при преобразовании bool → int?',
        answers: ['0', '1', '-1', 'Зависит от компилятора'],
        correct: 1,
        explanation: 'В C++ true всегда преобразуется в 1, false — в 0. Это гарантировано стандартом.'
    },
    {
        type: 'code',
        question: 'Что выведет программа?',
        code: `#include <iostream>
int main() {
    bool b = 42;
    std::cout << b;
}`,
        answers: ['42', '1', '0', 'Ошибка компиляции'],
        correct: 1,
        explanation: 'Любое ненулевое число при преобразовании в bool даёт true, которое при выводе через cout отображается как 1.'
    },
    {
        type: 'fill',
        question: 'Напишите манипулятор потока для вывода "true"/"false" вместо 1/0:',
        correct: ['boolalpha', 'std::boolalpha'],
        explanation: 'std::boolalpha заставляет cout выводить bool как "true" или "false". Отменяется через std::noboolalpha.'
    },
    {
        type: 'single',
        question: 'Что означает тип возврата void у функции?',
        answers: [
            'Функция возвращает нулевое значение',
            'Функция не возвращает никакого значения',
            'Функция возвращает указатель',
            'Функция может вернуть любой тип'
        ],
        correct: 1,
        explanation: 'void означает отсутствие значения. Функция с void в качестве типа возврата не должна содержать return с выражением (или return вообще).'
    },
    {
        type: 'multiple',
        question: 'Какие выражения имеют тип bool в C++?',
        answers: [
            'x > 0 (сравнение)',
            'x && y (логическое И)',
            'x + y (сложение двух int)',
            '!flag (логическое НЕ)',
            '"hello" (строковый литерал)'
        ],
        correct: [0, 1, 3],
        explanation: 'Операторы сравнения (>, <, ==, !=), логические операторы (&&, ||, !) возвращают bool. Арифметические операции и строковые литералы не дают bool напрямую.'
    },
    {
        type: 'single',
        question: 'Что такое void* (указатель на void)?',
        answers: [
            'Нулевой указатель',
            'Указатель, который не может ни на что указывать',
            'Указатель на объект произвольного типа (обобщённый указатель)',
            'Указатель на void-функцию'
        ],
        correct: 2,
        explanation: 'void* — обобщённый указатель, который может хранить адрес объекта любого типа. Для его разыменования нужен явный каст к конкретному типу.'
    },
    {
        type: 'code',
        question: 'Что выведет код?',
        code: `#include <iostream>
int main() {
    bool x = true, y = false;
    std::cout << (x + y) << " " << (x * 5);
}`,
        answers: ['true false', '1 5', '1 true', 'Ошибка компиляции'],
        correct: 1,
        explanation: 'true преобразуется в 1, false в 0. true + false = 1 + 0 = 1. true * 5 = 1 * 5 = 5. Вывод: "1 5".'
    },
    {
        type: 'single',
        question: 'Что такое nullptr в C++11?',
        answers: [
            'Макрос, равный (void*)0',
            'Целочисленная константа 0',
            'Литерал типа std::nullptr_t, не приводимый к int',
            'Псевдоним для NULL'
        ],
        correct: 2,
        explanation: 'nullptr — типизированный нулевой указатель. Его тип — std::nullptr_t. В отличие от NULL (= 0), nullptr не приводится неявно к int, что предотвращает ошибки перегрузки.'
    },
    {
        type: 'fill',
        question: 'Напишите ключевое слово C++11 для нулевого указателя (вместо NULL):',
        correct: ['nullptr'],
        explanation: 'nullptr — предпочтительная замена NULL в современном C++. Он имеет собственный тип nullptr_t и не вызывает путаницы при перегрузке функций.'
    },
    {
        type: 'multiple',
        question: 'Что из перечисленного является некорректным (вызовет ошибку компиляции)?',
        answers: [
            'void* p = nullptr;',
            'int x = nullptr;',
            'bool b = nullptr;',
            'void* p = (void*)0;',
            'if (nullptr) {}'
        ],
        correct: [1, 2],
        explanation: 'nullptr нельзя присвоить типу int (в отличие от NULL). bool b = nullptr тоже ошибка. void* p = nullptr и (void*)0 корректны. if(nullptr) — ложное условие, компилируется.'
    }
];
