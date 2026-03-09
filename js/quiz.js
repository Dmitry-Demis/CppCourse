// Quiz System for C++ Course
class Quiz {
    constructor(containerId, questions) {
        this.container = document.getElementById(containerId);
        this.questions = questions;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        
        if (this.container) {
            this.render();
        }
    }
    
    render() {
        const question = this.questions[this.currentQuestion];
        
        this.container.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <div class="quiz-progress">
                        <div class="quiz-progress-bar" style="width: ${(this.currentQuestion / this.questions.length) * 100}%"></div>
                    </div>
                    <div class="quiz-info">
                        <span>Вопрос ${this.currentQuestion + 1} из ${this.questions.length}</span>
                        <span>Баллы: ${this.score}</span>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h3>${question.question}</h3>
                    ${question.code ? `<pre><code class="language-cpp">${this.escapeHtml(question.code)}</code></pre>` : ''}
                </div>
                
                <div class="quiz-answers">
                    ${question.answers.map((answer, index) => `
                        <button class="quiz-answer" data-index="${index}">
                            ${answer}
                        </button>
                    `).join('')}
                </div>
                
                <div class="quiz-feedback" style="display: none;"></div>
                
                <div class="quiz-actions">
                    ${this.currentQuestion > 0 ? '<button class="btn-quiz btn-prev">← Назад</button>' : ''}
                    <button class="btn-quiz btn-next" style="display: none;">Далее →</button>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
        
        // Re-highlight code if Prism is available
        if (window.Prism) {
            Prism.highlightAllUnder(this.container);
        }
    }
    
    attachEventListeners() {
        const answers = this.container.querySelectorAll('.quiz-answer');
        answers.forEach(answer => {
            answer.addEventListener('click', (e) => this.handleAnswer(e));
        });
        
        const prevBtn = this.container.querySelector('.btn-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }
        
        const nextBtn = this.container.querySelector('.btn-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
    }
    
    handleAnswer(e) {
        const selectedIndex = parseInt(e.target.dataset.index);
        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedIndex === question.correct;
        
        // Disable all answers
        const answers = this.container.querySelectorAll('.quiz-answer');
        answers.forEach((answer, index) => {
            answer.disabled = true;
            if (index === question.correct) {
                answer.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                answer.classList.add('incorrect');
            }
        });
        
        // Show feedback
        const feedback = this.container.querySelector('.quiz-feedback');
        feedback.style.display = 'block';
        feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
        feedback.innerHTML = `
            <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
            <div class="feedback-text">
                <strong>${isCorrect ? 'Правильно!' : 'Неправильно'}</strong>
                <p>${question.explanation}</p>
            </div>
        `;
        
        // Update score
        if (isCorrect) {
            this.score += 10;
            this.container.querySelector('.quiz-info span:last-child').textContent = `Баллы: ${this.score}`;
        }
        
        // Store answer
        this.answers[this.currentQuestion] = selectedIndex;
        
        // Show next button
        const nextBtn = this.container.querySelector('.btn-next');
        if (nextBtn) {
            nextBtn.style.display = 'inline-flex';
        }
    }
    
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.render();
        } else {
            this.showResults();
        }
    }
    
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.render();
        }
    }
    
    showResults() {
        const percentage = (this.score / (this.questions.length * 10)) * 100;
        let message = '';
        let emoji = '';
        
        if (percentage >= 90) {
            message = 'Отлично! Вы отлично усвоили материал!';
            emoji = '🏆';
        } else if (percentage >= 70) {
            message = 'Хорошо! Но есть куда расти.';
            emoji = '👍';
        } else if (percentage >= 50) {
            message = 'Неплохо, но стоит повторить материал.';
            emoji = '📚';
        } else {
            message = 'Рекомендуем перечитать параграф.';
            emoji = '💪';
        }
        
        this.container.innerHTML = `
            <div class="quiz-results">
                <div class="results-icon">${emoji}</div>
                <h2>Результаты теста</h2>
                <div class="results-score">
                    <div class="score-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-primary)" stroke-width="8"/>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-green)" stroke-width="8"
                                    stroke-dasharray="${percentage * 2.827}, 282.7"
                                    transform="rotate(-90 50 50)"/>
                        </svg>
                        <div class="score-text">${Math.round(percentage)}%</div>
                    </div>
                </div>
                <p class="results-message">${message}</p>
                <div class="results-stats">
                    <div class="stat">
                        <div class="stat-value">${this.score}</div>
                        <div class="stat-label">Баллов</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${this.answers.filter((a, i) => a === this.questions[i].correct).length}</div>
                        <div class="stat-label">Правильных</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${this.questions.length}</div>
                        <div class="stat-label">Всего</div>
                    </div>
                </div>
                <div class="results-actions">
                    <button class="btn btn--primary" onclick="location.reload()">Пройти снова</button>
                    <button class="btn btn--secondary" onclick="window.scrollTo(0, 0)">К началу</button>
                </div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Sample questions for paragraph 1
const fundamentalTypesQuestions = [
    {
        question: 'Какой тип данных используется для хранения целых чисел в C++?',
        answers: [
            'float',
            'int',
            'char',
            'string'
        ],
        correct: 1,
        explanation: 'Тип int используется для хранения целых чисел. float используется для чисел с плавающей точкой, char для символов, а string не является фундаментальным типом.'
    },
    {
        question: 'Сколько байт обычно занимает тип int на современных системах?',
        answers: [
            '1 байт',
            '2 байта',
            '4 байта',
            '8 байт'
        ],
        correct: 2,
        explanation: 'На большинстве современных систем тип int занимает 4 байта (32 бита), что позволяет хранить числа от -2,147,483,648 до 2,147,483,647.'
    },
    {
        question: 'Какой тип данных следует использовать для хранения значений true/false?',
        answers: [
            'int',
            'char',
            'bool',
            'byte'
        ],
        correct: 2,
        explanation: 'Тип bool специально предназначен для хранения логических значений true (истина) или false (ложь).'
    },
    {
        question: 'Что выведет этот код?',
        code: `int x = 5;
std::cout << sizeof(x);`,
        answers: [
            '5',
            '4',
            '1',
            'Ошибка компиляции'
        ],
        correct: 1,
        explanation: 'Оператор sizeof возвращает размер типа в байтах. Для int это обычно 4 байта, а не значение переменной.'
    },
    {
        question: 'Какой тип имеет наибольшую точность для вещественных чисел?',
        answers: [
            'float',
            'double',
            'long double',
            'int'
        ],
        correct: 2,
        explanation: 'long double обеспечивает максимальную точность для вещественных чисел среди стандартных типов C++.'
    }
];
