/* ============================================
   QUIZ SYSTEM - Mini Tests & Final Tests
   ============================================ */

class QuizSystem {
    constructor() {
        this.currentTest = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.testData = {};
        this.loadTestData();
    }
    
    loadTestData() {
        // Мини-тесты для void
        this.testData['void-functions'] = {
            title: 'Функции void',
            questions: [
                {
                    question: 'Что возвращает функция с типом возврата void?',
                    type: 'single',
                    options: [
                        'Ничего не возвращает',
                        'Возвращает 0',
                        'Возвращает nullptr',
                        'Возвращает пустую строку'
                    ],
                    correct: 0,
                    explanation: 'Функции void не возвращают никакого значения. Они выполняют действия, но не имеют результата.'
                },
                {
                    question: 'Можно ли использовать return в функции void?',
                    type: 'single',
                    options: [
                        'Да, но без значения',
                        'Нет, это ошибка',
                        'Да, с любым значением',
                        'Только с nullptr'
                    ],
                    correct: 0,
                    explanation: 'В функции void можно использовать return без значения для досрочного выхода из функции.'
                },
                {
                    question: 'Что выведет этот код?\n\nvoid func() { return; }\nint main() { int x = func(); }',
                    type: 'single',
                    options: [
                        'Ошибка компиляции',
                        '0',
                        'Случайное значение',
                        'nullptr'
                    ],
                    correct: 0,
                    explanation: 'Нельзя присвоить результат void-функции переменной. Это ошибка компиляции.'
                },
                {
                    question: 'Какое утверждение верно для функций void?',
                    type: 'single',
                    options: [
                        'Они называются процедурами в других языках',
                        'Они всегда возвращают 0',
                        'Они не могут иметь параметров',
                        'Они не могут вызывать другие функции'
                    ],
                    correct: 0,
                    explanation: 'Функции void называются процедурами в других языках программирования.'
                },
                {
                    question: 'Можно ли создать массив функций void?',
                    type: 'single',
                    options: [
                        'Нет, но можно создать массив указателей на функции void',
                        'Да, всегда',
                        'Только в C++17',
                        'Только с использованием шаблонов'
                    ],
                    correct: 0,
                    explanation: 'Нельзя создать массив функций, но можно создать массив указателей на функции void.'
                },
                {
                    question: 'Что произойдёт при вызове: void f() {} int main() { return f(); }',
                    type: 'single',
                    options: [
                        'Ошибка компиляции',
                        'Вернёт 0',
                        'Вернёт случайное значение',
                        'Программа скомпилируется и выполнится'
                    ],
                    correct: 0,
                    explanation: 'Нельзя вернуть результат void-функции из main. Это ошибка компиляции.'
                },
                {
                    question: 'Можно ли перегрузить функцию только по типу возврата void?',
                    type: 'single',
                    options: [
                        'Нет, нужны разные параметры',
                        'Да, всегда',
                        'Только в C++20',
                        'Только с использованием auto'
                    ],
                    correct: 0,
                    explanation: 'Перегрузка только по типу возврата невозможна. Нужны разные параметры.'
                },
                {
                    question: 'Что такое void-функция?',
                    type: 'single',
                    options: [
                        'Функция, которая не возвращает значение',
                        'Функция без параметров',
                        'Функция, которая ничего не делает',
                        'Функция с пустым телом'
                    ],
                    correct: 0,
                    explanation: 'void-функция — это функция, которая не возвращает значение.'
                },
                {
                    question: 'Можно ли использовать void-функцию в выражении?',
                    type: 'single',
                    options: [
                        'Нет, только как отдельный вызов',
                        'Да, всегда',
                        'Только в условных операторах',
                        'Только с оператором запятая'
                    ],
                    correct: 0,
                    explanation: 'void-функцию нельзя использовать в выражениях, так как она не возвращает значение.'
                },
                {
                    question: 'Обязательно ли писать return в void-функции?',
                    type: 'single',
                    options: [
                        'Нет, необязательно',
                        'Да, всегда',
                        'Только если есть параметры',
                        'Только в C++11 и выше'
                    ],
                    correct: 0,
                    explanation: 'В void-функции return необязателен. Функция завершится автоматически.'
                }
            ]
        };
        
        this.testData['void-pointers'] = {
            title: 'Указатели void*',
            questions: [
                {
                    question: 'Можно ли разыменовать указатель void* напрямую?',
                    type: 'single',
                    options: [
                        'Нет, сначала нужно привести к конкретному типу',
                        'Да, всегда',
                        'Да, но только для чтения',
                        'Да, но только для записи'
                    ],
                    correct: 0,
                    explanation: 'void* нельзя разыменовать напрямую, так как компилятор не знает размер и тип данных.'
                },
                {
                    question: 'Какой оператор используется для приведения void* к конкретному типу?',
                    type: 'single',
                    options: [
                        'static_cast',
                        'dynamic_cast',
                        'const_cast',
                        'reinterpret_cast'
                    ],
                    correct: 0,
                    explanation: 'static_cast используется для безопасного приведения void* к конкретному типу указателя.'
                },
                {
                    question: 'Что такое void*?',
                    type: 'single',
                    options: [
                        'Универсальный указатель на любой тип',
                        'Указатель на пустоту',
                        'Нулевой указатель',
                        'Указатель на функцию'
                    ],
                    correct: 0,
                    explanation: 'void* — это универсальный указатель, который может указывать на объект любого типа.'
                },
                {
                    question: 'Можно ли выполнить арифметику указателей с void*?',
                    type: 'single',
                    options: [
                        'Нет, это ошибка компиляции',
                        'Да, всегда',
                        'Только в C',
                        'Только с приведением типа'
                    ],
                    correct: 0,
                    explanation: 'Арифметика указателей с void* невозможна, так как размер типа неизвестен.'
                },
                {
                    question: 'Где чаще всего используется void*?',
                    type: 'single',
                    options: [
                        'В функциях работы с памятью (malloc, memcpy)',
                        'В математических вычислениях',
                        'В строковых операциях',
                        'В файловом вводе-выводе'
                    ],
                    correct: 0,
                    explanation: 'void* часто используется в низкоуровневых функциях работы с памятью.'
                },
                {
                    question: 'Можно ли присвоить void* указателю любого типа?',
                    type: 'single',
                    options: [
                        'Да, неявное преобразование разрешено',
                        'Нет, нужно явное приведение',
                        'Только для указателей на const',
                        'Только в C++11'
                    ],
                    correct: 0,
                    explanation: 'Любой указатель может быть неявно преобразован в void*.'
                },
                {
                    question: 'Можно ли присвоить указателю конкретного типа void* без приведения?',
                    type: 'single',
                    options: [
                        'В C да, в C++ нет',
                        'Да, всегда',
                        'Нет, никогда',
                        'Только для указателей на int'
                    ],
                    correct: 0,
                    explanation: 'В C разрешено неявное преобразование void* к любому указателю, в C++ требуется явное приведение.'
                },
                {
                    question: 'Что вернёт sizeof(void*)?',
                    type: 'single',
                    options: [
                        'Размер указателя на данной платформе',
                        '0',
                        'Ошибку компиляции',
                        'Размер типа void'
                    ],
                    correct: 0,
                    explanation: 'sizeof(void*) возвращает размер указателя (обычно 4 или 8 байт).'
                },
                {
                    question: 'Можно ли создать массив void*?',
                    type: 'single',
                    options: [
                        'Да, это допустимо',
                        'Нет, это ошибка',
                        'Только в C',
                        'Только с использованием new'
                    ],
                    correct: 0,
                    explanation: 'Массив указателей void* создать можно, например: void* arr[10];'
                },
                {
                    question: 'Безопасно ли использовать void* в современном C++?',
                    type: 'single',
                    options: [
                        'Лучше использовать шаблоны и умные указатели',
                        'Да, это рекомендуемый подход',
                        'Только в критичных по производительности участках',
                        'Только для работы с C API'
                    ],
                    correct: 0,
                    explanation: 'В современном C++ предпочтительнее использовать шаблоны и типобезопасные конструкции.'
                }
            ]
        };
        
        this.testData['nullptr'] = {
            title: 'nullptr и nullptr_t',
            questions: [
                {
                    question: 'Какой тип имеет nullptr?',
                    type: 'single',
                    options: [
                        'std::nullptr_t',
                        'void*',
                        'int',
                        'bool'
                    ],
                    correct: 0,
                    explanation: 'nullptr имеет специальный тип std::nullptr_t, введённый в C++11.'
                },
                {
                    question: 'Чему равен sizeof(std::nullptr_t)?',
                    type: 'single',
                    options: [
                        'sizeof(void*)',
                        '0',
                        '1',
                        '4'
                    ],
                    correct: 0,
                    explanation: 'Размер std::nullptr_t равен размеру указателя на данной платформе.'
                },
                {
                    question: 'Можно ли преобразовать nullptr в int?',
                    type: 'single',
                    options: [
                        'Нет, это ошибка компиляции',
                        'Да, результат 0',
                        'Да, результат -1',
                        'Да, результат зависит от платформы'
                    ],
                    correct: 0,
                    explanation: 'nullptr нельзя неявно преобразовать в целочисленный тип (кроме bool).'
                },
                {
                    question: 'В каком стандарте C++ появился nullptr?',
                    type: 'single',
                    options: [
                        'C++11',
                        'C++98',
                        'C++03',
                        'C++14'
                    ],
                    correct: 0,
                    explanation: 'nullptr был введён в стандарте C++11.'
                },
                {
                    question: 'Чем nullptr лучше NULL?',
                    type: 'single',
                    options: [
                        'Типобезопасность при перегрузке функций',
                        'Занимает меньше памяти',
                        'Работает быстрее',
                        'Поддерживается в C'
                    ],
                    correct: 0,
                    explanation: 'nullptr обеспечивает типобезопасность и правильно работает с перегрузкой функций.'
                },
                {
                    question: 'Можно ли сравнивать nullptr с указателями?',
                    type: 'single',
                    options: [
                        'Да, это допустимо',
                        'Нет, это ошибка',
                        'Только с void*',
                        'Только с const указателями'
                    ],
                    correct: 0,
                    explanation: 'nullptr можно сравнивать с любыми указателями.'
                },
                {
                    question: 'Что вернёт выражение (nullptr == 0)?',
                    type: 'single',
                    options: [
                        'Ошибку компиляции',
                        'true',
                        'false',
                        'Зависит от компилятора'
                    ],
                    correct: 0,
                    explanation: 'nullptr нельзя сравнивать с целыми числами напрямую.'
                },
                {
                    question: 'Можно ли присвоить nullptr указателю любого типа?',
                    type: 'single',
                    options: [
                        'Да, неявное преобразование разрешено',
                        'Нет, нужно явное приведение',
                        'Только для void*',
                        'Только для указателей на классы'
                    ],
                    correct: 0,
                    explanation: 'nullptr может быть неявно преобразован в любой тип указателя.'
                },
                {
                    question: 'Что вернёт выражение if (nullptr)?',
                    type: 'single',
                    options: [
                        'false',
                        'true',
                        'Ошибку компиляции',
                        'Зависит от контекста'
                    ],
                    correct: 0,
                    explanation: 'nullptr преобразуется в bool как false.'
                },
                {
                    question: 'Можно ли использовать nullptr в C?',
                    type: 'single',
                    options: [
                        'Нет, это только C++',
                        'Да, начиная с C11',
                        'Да, всегда',
                        'Только с расширениями компилятора'
                    ],
                    correct: 0,
                    explanation: 'nullptr — это ключевое слово C++, в C используется NULL.'
                }
            ]
        };
    }
    
    startMiniTest(testId) {
        const testData = this.testData[testId];
        if (!testData) {
            console.error('Test not found:', testId);
            return;
        }
        
        this.currentTest = testId;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        
        this.showTestModal(testData);
    }
    
    showTestModal(testData) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'quiz-modal';
        modal.id = 'quizModal';
        modal.innerHTML = `
            <div class="quiz-modal-content">
                <div class="quiz-header">
                    <h2>${testData.title}</h2>
                    <div class="quiz-progress">
                        <span class="quiz-question-number">Вопрос <span id="currentQ">1</span> из ${testData.questions.length}</span>
                        <div class="quiz-progress-bar">
                            <div class="quiz-progress-fill" id="progressFill" style="width: 0%"></div>
                        </div>
                    </div>
                    <button class="quiz-close" onclick="quizSystem.closeTest()">×</button>
                </div>
                <div class="quiz-body" id="quizBody"></div>
                <div class="quiz-footer">
                    <button class="btn btn--secondary" onclick="quizSystem.previousQuestion()" id="prevBtn" disabled>
                        ← Назад
                    </button>
                    <button class="btn btn--primary" onclick="quizSystem.nextQuestion()" id="nextBtn">
                        Далее →
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        
        this.showQuestion();
    }
    
    showQuestion() {
        const testData = this.testData[this.currentTest];
        const question = testData.questions[this.currentQuestion];
        const body = document.getElementById('quizBody');
        
        body.innerHTML = `
            <div class="quiz-question">
                <h3>${question.question}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <label class="quiz-option">
                            <input type="radio" name="answer" value="${index}" 
                                ${this.answers[this.currentQuestion] === index ? 'checked' : ''}>
                            <span class="quiz-option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Update progress
        document.getElementById('currentQ').textContent = this.currentQuestion + 1;
        const progress = ((this.currentQuestion + 1) / testData.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        
        // Update buttons
        document.getElementById('prevBtn').disabled = this.currentQuestion === 0;
        document.getElementById('nextBtn').textContent = 
            this.currentQuestion === testData.questions.length - 1 ? 'Завершить' : 'Далее →';
        
        // Add event listeners
        document.querySelectorAll('input[name="answer"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.answers[this.currentQuestion] = parseInt(e.target.value);
            });
        });
    }
    
    nextQuestion() {
        const testData = this.testData[this.currentTest];
        
        if (this.currentQuestion < testData.questions.length - 1) {
            this.currentQuestion++;
            this.showQuestion();
        } else {
            this.finishTest();
        }
    }
    
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion();
        }
    }
    
    finishTest() {
        const testData = this.testData[this.currentTest];
        
        // Calculate score
        this.score = 0;
        testData.questions.forEach((question, index) => {
            if (this.answers[index] === question.correct) {
                this.score++;
            }
        });
        
        const percentage = Math.round((this.score / testData.questions.length) * 100);
        
        // Save progress to server if user is logged in
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (user) {
            const points = Math.round(percentage / 10) * 10;
            // Use absolute path to avoid issues when page is in subdirectory
            fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isuNumber: user.isuNumber,
                    chapterId: 'chapter-1',
                    chapterTitle: 'Глава I: Фундаментальные типы данных',
                    points: points
                })
            })
            .then(r => r.json())
            .then(d => console.log('[Quiz] Progress saved:', d))
            .catch(e => console.error('[Quiz] Failed to save progress:', e));
        } else {
            console.warn('[Quiz] No user in localStorage, progress not saved');
        }

        // Show results
        this.showResults(testData, percentage);
    }
    
    showResults(testData, percentage) {
        const body = document.getElementById('quizBody');
        const passed = percentage >= 70;
        
        body.innerHTML = `
            <div class="quiz-results">
                <div class="quiz-results-icon ${passed ? 'success' : 'fail'}">
                    ${passed ? '🎉' : '😔'}
                </div>
                <h2>${passed ? 'Отлично!' : 'Попробуйте ещё раз'}</h2>
                <div class="quiz-score">
                    <div class="quiz-score-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="${passed ? '#06FFA5' : '#FF6B6B'}" 
                                stroke-width="8" stroke-dasharray="${percentage * 2.827}, 282.7" 
                                transform="rotate(-90 50 50)"/>
                        </svg>
                        <div class="quiz-score-text">${percentage}%</div>
                    </div>
                    <p>Правильных ответов: ${this.score} из ${testData.questions.length}</p>
                </div>
            </div>
        `;
        
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').textContent = 'Закрыть';
        document.getElementById('nextBtn').onclick = () => this.closeTest();
    }
    
    closeTest() {
        const modal = document.getElementById('quizModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Initialize quiz system
let quizSystem;
document.addEventListener('DOMContentLoaded', () => {
    quizSystem = new QuizSystem();
});

// Global functions for buttons
function startMiniTest(testId) {
    quizSystem.startMiniTest(testId);
}

function startFinalTest(topic) {
    alert('Итоговый тест будет доступен в следующей версии!');
}
