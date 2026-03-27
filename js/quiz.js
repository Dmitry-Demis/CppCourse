// ============================================
// QUIZ SYSTEM v2 — C++ Course
// Типы вопросов: single, multiple, fill, code
// Интеграция с GameSystem (gamification.js)
// ============================================

// Утилита: `код` → <code>код</code>
function quizMd(text) {
    return String(text).replace(/`([^`]+)`/g, '<code>$1</code>');
}

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
                    <div class="quiz-question">${quizMd(q.question)}</div>
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
                        <span>${quizMd(ans)}</span>
                    </button>`).join('');

            case 'multiple':
                return q.answers.map((ans, i) => `
                    <label class="quiz-answer quiz-answer--check">
                        <input type="checkbox" data-index="${i}" class="quiz-checkbox">
                        <span class="quiz-answer-letter">${String.fromCharCode(65 + i)}</span>
                        <span>${quizMd(ans)}</span>
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
                        <span>${quizMd(this._escape(ans))}</span>
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
        this.answers[this.current] = { selected: selectedIdx, correct, isRight, qId: q.id };

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
        this.answers[this.current] = { selected: selectedIndices, correct, isRight: allRight, qId: q.id };

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
        this.answers[this.current] = { selected: value, correct: accepted, isRight, qId: q.id };

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

        // Геймификация обрабатывается на сервере — результат придёт в ответе _saveResult

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
                <div class="results-rewards" id="results-rewards-${this.quizId}" style="display:none;"></div>
                <div class="results-actions">
                    <button class="btn btn--primary" onclick="location.reload()">Пройти снова</button>
                    <button class="btn btn--secondary" onclick="window.scrollTo({top:0,behavior:'smooth'})">К началу страницы</button>
                </div>
            </div>`;
    }

    _showReward(reward) {
        const el = document.getElementById(`results-rewards-${this.quizId}`);
        if (!el) return;
        const statusEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉', passed: '✅', failed: '❌' };
        const parts = [];
        if (reward.coinsEarned > 0) parts.push(`🪙 +${reward.coinsEarned} монет`);
        if (reward.xpEarned > 0)    parts.push(`⭐ +${reward.xpEarned} XP`);
        if (reward.idealBonus)       parts.push(`⚡ Бонус x1.5 за идеал!`);
        if (reward.isNewStatus)      parts.push(`${statusEmoji[reward.status] || ''} Новый статус: ${reward.status}`);
        if (parts.length === 0) return;
        el.style.display = 'flex';
        el.innerHTML = parts.map(p => `<span class="reward-badge">${p}</span>`).join('');
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
        // Store best score for quiz-widget
        localStorage.setItem(`quiz_best_${this.quizId}`, JSON.stringify(entry.best));
        // Store history for median calculation in quiz-widget
        const histKey = `quiz_hist_${this.quizId}`;
        const hist = (() => { try { return JSON.parse(localStorage.getItem(histKey) || '[]'); } catch { return []; } })();
        hist.push(pct);
        if (hist.length > 20) hist.splice(0, hist.length - 20);
        localStorage.setItem(histKey, JSON.stringify(hist));

        // Флаг прохождения финального теста (для разблокировки следующего параграфа)
        if (passed && this.type === 'final') {
            localStorage.setItem(`final_passed_${this.quizId}`, '1');
        }

        // Отправляем прогресс на сервер если пользователь залогинен
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (user && user.isuNumber) {
            // paragraphId = filename without extension (e.g. "comments" from /theory/chapter-1/basics/comments.html)
            const parts = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
            const lastPart = parts[parts.length - 1] || '';
            const paragraphId = lastPart.replace(/\.html$/, '') || 'unknown';

            const wrongIds = this.answers
                .map((ans, idx) => (!ans?.isRight && this.questions[idx]?.id !== undefined) ? this.questions[idx].id : null)
                .filter(id => id !== null);

            fetch('/api/test/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Isu-Number': user.isuNumber },
                body: JSON.stringify({
                    paragraphId,
                    testId:          this.quizId,
                    testTitle:       this.title,
                    score:           pct,
                    correctAnswers:  this.answers.filter(a => a?.isRight).length,
                    totalQuestions:  this.questions.length,
                    wrongQuestionIds: wrongIds,
                    correctQuestionIds: this.answers
                        .map((ans, idx) => (ans?.isRight && this.questions[idx]?.id !== undefined) ? this.questions[idx].id : null)
                        .filter(id => id !== null),
                    timeSpent:       0
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data?.reward) this._showReward(data.reward);
            })
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

// QUIZ LOADER — загрузка тестов из JSON-файлов
// ============================================

const QuizLoader = {
    /**
     * Загружает тест с сервера и инициализирует Quiz.
     * @param {string} containerId  — ID DOM-элемента
     * @param {string} jsonPath     — путь к API, например '/api/quiz/comments'
     */
    async init(containerId, jsonPath) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div class="quiz-loading">⏳ Загрузка теста...</div>';

        let data;
        try {
            const res = await fetch(jsonPath);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            data = await res.json();
        } catch (e) {
            container.innerHTML = `<div class="quiz-loading" style="color:var(--accent-red)">❌ Не удалось загрузить тест</div>`;
            console.error('[QuizLoader] Failed to load', jsonPath, e);
            return;
        }

        const questions = QuizLoader._pickQuestions(data);

        new Quiz(containerId, questions, {
            quizId:       data.quizId,
            title:        data.title,
            type:         data.type || 'mini',
            passingScore: data.passingScore ?? 70,
        });
    },

    /**
     * Выбирает N вопросов из банка, приоритизируя ранее неправильно отвеченные.
     */
    _pickQuestions(data) {
        const all    = data.questions || [];
        const pick   = Math.min(data.pick || all.length, all.length);
        const quizId = data.quizId;

        // Загружаем ID неправильно отвеченных вопросов
        const wrongKey  = `quiz_wrong_${quizId}`;
        const wrongIds  = new Set(JSON.parse(localStorage.getItem(wrongKey) || '[]'));

        const wrong   = all.filter(q => wrongIds.has(q.id));
        const correct = all.filter(q => !wrongIds.has(q.id));

        // Перемешиваем каждую группу
        QuizLoader._shuffle(wrong);
        QuizLoader._shuffle(correct);

        // Берём сначала неправильные, потом остальные, до pick штук
        const selected = [...wrong, ...correct].slice(0, pick);
        QuizLoader._shuffle(selected);

        // Оборачиваем в прокси, чтобы после завершения сохранить неправильные
        return QuizLoader._wrapQuestions(selected, quizId);
    },

    /**
     * Добавляет метаданные и перемешивает варианты ответов.
     * Для single/code/multiple пересчитывает индекс(ы) correct после перемешивания.
     */
    _wrapQuestions(questions, quizId) {
        return questions.map(q => {
            const out = { ...q, _quizId: quizId };

            // Перемешиваем ответы только для типов с вариантами
            if ((q.type === 'single' || q.type === 'code' || q.type === 'multiple') && Array.isArray(q.answers)) {
                // Создаём пары [текст, оригинальный_индекс]
                const indexed = q.answers.map((a, i) => ({ a, i }));
                QuizLoader._shuffle(indexed);

                out.answers = indexed.map(x => x.a);

                // Строим карту: старый индекс → новый
                const remap = {};
                indexed.forEach((x, newIdx) => { remap[x.i] = newIdx; });

                if (q.type === 'multiple') {
                    out.correct = q.correct.map(c => remap[c]);
                } else {
                    out.correct = remap[q.correct];
                }
            }

            return out;
        });
    },

    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};

// Патчим Quiz._saveResult для сохранения неправильных вопросов
const _origSaveResult = Quiz.prototype._saveResult;
Quiz.prototype._saveResult = function(pct, passed) {
    _origSaveResult.call(this, pct, passed);

    // Собираем ID неправильно отвеченных вопросов
    const wrongIds = [];
    this.answers.forEach((ans, idx) => {
        if (ans && !ans.isRight) {
            const q = this.questions[idx];
            if (q && q.id !== undefined) wrongIds.push(q.id);
        }
    });

    if (wrongIds.length > 0) {
        const quizId  = this.questions[0]?._quizId || this.quizId;
        const wrongKey = `quiz_wrong_${quizId}`;
        // Объединяем с предыдущими неправильными
        const prev = new Set(JSON.parse(localStorage.getItem(wrongKey) || '[]'));
        wrongIds.forEach(id => prev.add(id));
        localStorage.setItem(wrongKey, JSON.stringify([...prev]));
    } else if (passed) {
        // Если тест пройден без ошибок — очищаем список неправильных
        const quizId  = this.questions[0]?._quizId || this.quizId;
        localStorage.removeItem(`quiz_wrong_${quizId}`);
    }
};


// ============================================
// MODAL QUIZ — универсальная модальная система
// Используется на страницах с openQuizModal()
// ============================================

/**
 * Открывает модальное окно с тестом по quizId.
 * Требует наличия #quiz-modal-overlay и #quiz-modal-content в DOM.
 * Если их нет — создаёт автоматически.
 */
window.openQuizModal = async function(quizId, title) {
    // Fetch first — don't open modal if load fails
    let data;
    try {
        const res = await fetch(`/api/quiz/${quizId}`);
        if (!res.ok) throw new Error('not found');
        data = await res.json();
    } catch {
        // Show inline error without opening modal
        const btn = document.querySelector(`[onclick*="openQuizModal('${quizId}'"]`);
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = '❌ Тест недоступен';
            btn.disabled = true;
            setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
        }
        return;
    }

    let overlay = document.getElementById('quiz-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'quiz-modal-overlay';
        overlay.className = 'quiz-modal-overlay';
        overlay.innerHTML = `
            <div class="quiz-modal-box" id="quiz-modal-box">
                <button class="quiz-modal-close" onclick="closeQuizModal(null)" aria-label="Закрыть">✕</button>
                <div id="quiz-modal-content"></div>
            </div>`;
        document.body.appendChild(overlay);
    }

    const content = document.getElementById('quiz-modal-content');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    window._activeModalQuiz = new ModalQuiz(content, data);
};

window.closeQuizModal = function(e) {
    // Only close when called directly (e === null) — backdrop click is disabled
    if (e !== null && e !== undefined) return;
    const overlay = document.getElementById('quiz-modal-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    window._activeModalQuiz = null;
};

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.closeQuizModal(null);
});

// ── ModalQuiz — рендерит тест внутри модалки ──────────────────────────────
class ModalQuiz {
    constructor(container, data) {
        this.container    = container;
        this.quizId       = data.quizId || data.id;
        this.title        = data.title;
        this.passingScore = data.passingScore ?? 70;
        this.questions    = this._shuffle(ModalQuiz._pickQuestions(data));
        this.current      = 0;
        this.answers      = {};
        this.answered     = false;
        this._render();
    }

    static _pickQuestions(data) {
        const all    = data.questions || [];
        const pick   = Math.min(data.pick || all.length, all.length);
        const quizId = data.quizId;

        const wrongIds = new Set(JSON.parse(localStorage.getItem(`quiz_wrong_${quizId}`) || '[]'));
        const wrong    = all.filter(q => wrongIds.has(q.id));
        const rest     = all.filter(q => !wrongIds.has(q.id));

        const shuffle = arr => {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };

        const selected = [...shuffle(wrong), ...shuffle(rest)].slice(0, pick);

        // Перемешиваем варианты ответов и пересчитываем correct
        return selected.map(q => {
            if ((q.type === 'single' || q.type === 'code' || q.type === 'multiple') && Array.isArray(q.answers)) {
                const indexed = q.answers.map((a, i) => ({ a, i }));
                shuffle(indexed);
                const remap = {};
                indexed.forEach((x, ni) => { remap[x.i] = ni; });
                return {
                    ...q,
                    answers: indexed.map(x => x.a),
                    correct: q.type === 'multiple'
                        ? q.correct.map(c => remap[c])
                        : remap[q.correct]
                };
            }
            return q;
        });
    }

    _render() {
        if (this.current >= this.questions.length) { this._showResults(); return; }
        const q   = this.questions[this.current];
        const pct = Math.round(this.current / this.questions.length * 100);
        this.answered = false;

        // Накопленные очки за сессию
        const earnedPts = Object.values(this.answers).reduce((s, a) => s + a.pts, 0);
        // Первая попытка = нет истории в localStorage
        const histKey = `quiz_hist_${this.quizId}`;
        const hist = (() => { try { return JSON.parse(localStorage.getItem(histKey) || '[]'); } catch { return []; } })();
        const isFirstAttempt = hist.length === 0;
        const firstBadge = isFirstAttempt ? `<span class="qm-score-first" title="Первая попытка">⚡</span>` : '';

        this.container.innerHTML = `
            <div class="qm-header">
                <div class="qm-title">${this.title}</div>
                <div class="qm-counter">${this.current + 1} / ${this.questions.length}</div>
            </div>
            <div class="qm-progress"><div class="qm-progress-fill" style="width:${pct}%"></div></div>
            <div class="qm-body">
                <div class="qm-type-badge qm-type--${q.type}">${this._typeLabel(q.type)}</div>
                <div class="qm-question">${quizMd(q.question)}</div>
                ${q.code ? `<pre class="qm-code"><code class="language-cpp">${this._esc(q.code)}</code></pre>` : ''}
                <div class="qm-answers" id="qm-answers"></div>
                <div class="qm-feedback" id="qm-feedback" style="display:none"></div>
            </div>
            <div class="qm-footer">
                <div class="qm-score">
                    <span class="qm-score-coin">🪙</span>
                    <span class="qm-score-val">${earnedPts}</span>
                    <span style="color:var(--text-tertiary);font-size:.75rem">очков</span>
                    ${firstBadge}
                </div>
                <div class="qm-actions">
                    ${q.type === 'multiple' || q.type === 'fill'
                        ? `<button class="btn-qm btn-qm--check" id="qm-check">Проверить</button>` : ''}
                    <button class="btn-qm btn-qm--next" id="qm-next" style="display:none">
                        ${this.current + 1 < this.questions.length ? 'Далее →' : 'Завершить →'}
                    </button>
                </div>
            </div>`;

        this._renderAnswers(q);
        this._attachListeners(q);
        if (window.hljs) this.container.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
    }

    _renderAnswers(q) {
        const wrap = document.getElementById('qm-answers');
        if (q.type === 'single' || q.type === 'code') {
            wrap.innerHTML = q.answers.map((a, i) => `
                <button class="qm-answer" data-i="${i}">
                    <span class="qm-letter">${String.fromCharCode(65 + i)}</span>
                    <span>${quizMd(this._esc(a))}</span>
                </button>`).join('');
        } else if (q.type === 'multiple') {
            wrap.innerHTML = q.answers.map((a, i) => `
                <label class="qm-answer qm-answer--check">
                    <input type="checkbox" data-i="${i}">
                    <span class="qm-letter">${String.fromCharCode(65 + i)}</span>
                    <span>${quizMd(this._esc(a))}</span>
                </label>`).join('');
        } else if (q.type === 'fill') {
            wrap.innerHTML = `<input class="qm-fill" id="qm-fill-input" placeholder="Введите ответ…" autocomplete="off" spellcheck="false">`;
        }
    }

    _attachListeners(q) {
        const check = document.getElementById('qm-check');
        const next  = document.getElementById('qm-next');

        if (q.type === 'single' || q.type === 'code') {
            this.container.querySelectorAll('.qm-answer').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (this.answered) return;
                    this.answered = true;
                    this._submitSingle(q, parseInt(btn.dataset.i));
                });
            });
        }
        if (q.type === 'multiple' && check) {
            check.addEventListener('click', () => {
                if (this.answered) return;
                this.answered = true;
                const sel = [...this.container.querySelectorAll('.qm-answer input:checked')]
                    .map(cb => parseInt(cb.dataset.i));
                this._submitMultiple(q, sel);
                check.style.display = 'none';
            });
        }
        if (q.type === 'fill') {
            const input = document.getElementById('qm-fill-input');
            const doCheck = () => {
                if (this.answered) return;
                this.answered = true;
                this._submitFill(q, input?.value.trim() ?? '');
                if (check) check.style.display = 'none';
            };
            if (check) check.addEventListener('click', doCheck);
            input?.addEventListener('keydown', e => { if (e.key === 'Enter') doCheck(); });
        }
        if (next) next.addEventListener('click', () => { this.current++; this._render(); });
    }

    _submitSingle(q, idx) {
        const ok  = idx === q.correct;
        const pts = ok ? 10 : 0;
        this.answers[this.current] = { ok, pts, qId: q.id };
        this.container.querySelectorAll('.qm-answer').forEach((btn, i) => {
            btn.disabled = true;
            if (i === q.correct) btn.classList.add('qm-answer--correct');
            if (i === idx && !ok) btn.classList.add('qm-answer--wrong');
        });
        this._feedback(ok, q.explanation, pts);
        if (ok && window.gameSystem) window.gameSystem.earnXP(pts, 'за правильный ответ');
    }

    _submitMultiple(q, sel) {
        const correct = q.correct;
        const allOk   = correct.every(i => sel.includes(i)) && sel.every(i => correct.includes(i));
        const partial = correct.some(i => sel.includes(i));
        const pts     = allOk ? 10 : partial ? 5 : 0;
        this.answers[this.current] = { ok: allOk, pts, qId: q.id };
        this.container.querySelectorAll('.qm-answer').forEach((lbl, i) => {
            lbl.querySelector('input').disabled = true;
            if (correct.includes(i))                   lbl.classList.add('qm-answer--correct');
            if (sel.includes(i) && !correct.includes(i)) lbl.classList.add('qm-answer--wrong');
        });
        this._feedback(allOk, q.explanation, pts);
        if (pts && window.gameSystem) window.gameSystem.earnXP(pts, 'за правильный ответ');
    }

    _submitFill(q, val) {
        const accepted = Array.isArray(q.correct) ? q.correct : [q.correct];
        const ok  = accepted.some(v => v.toLowerCase() === val.toLowerCase());
        const pts = ok ? 10 : 0;
        this.answers[this.current] = { ok, pts, qId: q.id };
        const input = document.getElementById('qm-fill-input');
        if (input) { input.disabled = true; input.classList.add(ok ? 'qm-fill--ok' : 'qm-fill--err'); }
        this._feedback(ok, q.explanation, pts, ok ? null : `Правильный ответ: <code>${accepted[0]}</code>`);
        if (ok && window.gameSystem) window.gameSystem.earnXP(pts, 'за правильный ответ');
    }

    _feedback(ok, explanation, pts, extra = null) {
        const fb = document.getElementById('qm-feedback');
        if (!fb) return;
        fb.style.display = 'flex';
        fb.className = `qm-feedback qm-feedback--${ok ? 'ok' : 'err'}`;
        fb.innerHTML = `
            <span class="qm-fb-icon">${ok ? '✅' : '❌'}</span>
            <div>
                <strong>${ok ? 'Правильно!' : 'Неверно'}</strong>
                <p>${explanation}</p>
                ${extra ? `<p>${extra}</p>` : ''}
                ${pts ? `<span class="qm-fb-pts">+${pts} очков</span>` : ''}
            </div>`;
        document.getElementById('qm-next').style.display = 'inline-flex';
    }

    _showResults() {
        const total   = this.questions.length * 10;
        const earned  = Object.values(this.answers).reduce((s, a) => s + a.pts, 0);
        const pct     = Math.round(earned / total * 100);
        const passed  = pct >= this.passingScore;
        const correct = Object.values(this.answers).filter(a => a.ok).length;

        // Определяем медаль
        const medal = pct === 100 ? '🥇' : pct >= 90 ? '🥈' : pct >= 80 ? '🥉' : pct >= 70 ? '✅' : '📚';
        const statusLabel = pct === 100 ? 'Золото' : pct >= 90 ? 'Серебро' : pct >= 80 ? 'Бронза' : pct >= 70 ? 'Зачёт' : 'Не зачтено';
        const statusCls   = pct === 100 ? 'gold' : pct >= 90 ? 'silver' : pct >= 80 ? 'bronze' : pct >= 70 ? 'pass' : 'fail';

        // Первая попытка?
        const histKey = `quiz_hist_${this.quizId}`;
        const hist = (() => { try { return JSON.parse(localStorage.getItem(histKey) || '[]'); } catch { return []; } })();
        const isFirstAttempt = hist.length === 0;

        this._saveProgress(pct, passed);

        this.container.innerHTML = `
            <div class="qm-results">
                <div class="qm-results-emoji">${medal}</div>
                <h2>${passed ? 'Тест пройден!' : 'Попробуйте ещё раз'}</h2>
                <span class="qm-status-badge qm-status--${statusCls}">${statusLabel}</span>
                ${isFirstAttempt && passed ? `<div class="qm-first-badge">⚡ Первая попытка!</div>` : ''}
                <div class="qm-results-circle">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-primary)" stroke-width="8"/>
                        <circle cx="50" cy="50" r="42" fill="none"
                            stroke="${passed ? '#a6e3a1' : '#f38ba8'}"
                            stroke-width="8"
                            stroke-dasharray="${pct * 2.639} 263.9"
                            stroke-linecap="round"
                            transform="rotate(-90 50 50)"/>
                    </svg>
                    <div class="qm-results-pct">${pct}%</div>
                </div>
                <div class="qm-results-stats">
                    <div><div class="qm-stat-v">${correct}</div><div class="qm-stat-l">Правильных</div></div>
                    <div><div class="qm-stat-v">${this.questions.length}</div><div class="qm-stat-l">Вопросов</div></div>
                </div>
                <div class="qm-rewards" id="qm-rewards-${this.quizId}">
                    <span class="qm-reward-chip coins">🪙 <span id="qm-coins-val">...</span></span>
                    <span class="qm-reward-chip xp">✦ <span id="qm-xp-val">...</span> XP</span>
                </div>
                <div class="qm-results-actions">
                    <button class="btn-qm btn-qm--check" onclick="openQuizModal('${this.quizId}','${this.title.replace(/'/g,"\\'")}')">Пройти снова</button>
                    <button class="btn-qm btn-qm--next" onclick="closeQuizModal(null)">Закрыть</button>
                </div>
            </div>`;
    }

    _saveProgress(pct, passed) {
        // Update best score and attempts history in localStorage
        const lsKey     = `quiz_best_${this.quizId}`;
        const histKey   = `quiz_hist_${this.quizId}`;
        const prev      = (() => { try { return JSON.parse(localStorage.getItem(lsKey) || '0'); } catch { return 0; } })();
        if (pct > prev) localStorage.setItem(lsKey, JSON.stringify(pct));

        // Append to history (keep last 20 attempts)
        const hist = (() => { try { return JSON.parse(localStorage.getItem(histKey) || '[]'); } catch { return []; } })();
        hist.push(pct);
        if (hist.length > 20) hist.splice(0, hist.length - 20);
        localStorage.setItem(histKey, JSON.stringify(hist));

        // Track wrong question IDs for smart re-selection
        const wrongIds = Object.values(this.answers)
            .filter(a => !a.ok && a.qId !== undefined)
            .map(a => a.qId);
        if (wrongIds.length > 0) {
            const wrongKey = `quiz_wrong_${this.quizId}`;
            const prevWrong = new Set(JSON.parse(localStorage.getItem(wrongKey) || '[]'));
            wrongIds.forEach(id => prevWrong.add(id));
            localStorage.setItem(wrongKey, JSON.stringify([...prevWrong]));
        } else if (passed) {
            localStorage.removeItem(`quiz_wrong_${this.quizId}`);
        }

        // Send to server
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (!user?.isuNumber) return;

        const parts = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1] || '';
        const paragraphId = lastPart.replace(/\.html$/, '') || 'unknown';

        fetch('/api/test/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Isu-Number': user.isuNumber },
            body: JSON.stringify({
                paragraphId,
                testId:          this.quizId,
                testTitle:       this.title,
                score:           pct,
                correctAnswers:  Object.values(this.answers).filter(a => a.ok).length,
                totalQuestions:  this.questions.length,
                wrongQuestionIds: wrongIds,
                correctQuestionIds: Object.values(this.answers)
                    .filter(a => a.ok && a.qId !== undefined)
                    .map(a => a.qId),
                timeSpent:       0
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data?.reward) this._showReward(data.reward);
        })
        .catch(() => {});
    }

    _showReward(reward) {
        const coinsEl = document.getElementById('qm-coins-val');
        const xpEl    = document.getElementById('qm-xp-val');
        if (coinsEl) coinsEl.textContent = reward.coinsEarned > 0 ? `+${reward.coinsEarned}` : '0';
        if (xpEl)    xpEl.textContent    = reward.xpEarned > 0   ? `+${reward.xpEarned}`   : '0';

        // Extra badges for bonus/status
        const rewardsEl = document.getElementById(`qm-rewards-${this.quizId}`);
        if (!rewardsEl) return;
        if (reward.idealBonus) {
            rewardsEl.insertAdjacentHTML('beforeend', `<span class="qm-reward-chip" style="color:#fab387;border-color:rgba(250,179,135,.3)">⚡ Бонус ×1.5</span>`);
        }
        if (reward.isNewStatus) {
            const statusEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉', passed: '✅' };
            const e = statusEmoji[reward.status] || '🏅';
            rewardsEl.insertAdjacentHTML('beforeend', `<span class="qm-reward-chip" style="color:#fde68a;border-color:rgba(253,230,138,.3)">${e} Новый статус!</span>`);
        }
    }

    _typeLabel(t) {
        return { single: 'Один ответ', multiple: 'Несколько ответов', fill: 'Введите ответ', code: 'Что выведет код?' }[t] || t;
    }
    _esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    _shuffle(a) {
        const arr = [...a];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
