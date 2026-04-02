// class ModalQuiz — тест внутри модального окна

import { get } from './templates.js';
import { buildNodes, attachListeners, submit } from './dispatcher.js';
import { quizMd, shuffle, shuffleAnswers, typeLabel, resultMood, rewardParts, saveResult, highlightCode } from './helpers.js';

function buildModalQuestions(data, pickedIds = []) {
    const all  = data.questions || [];
    const byId = Object.fromEntries(all.map(q => [String(q.id), q]));
    const ordered = pickedIds.length
        ? pickedIds.map(id => byId[String(id)]).filter(Boolean)
        : shuffle(all).slice(0, Math.min(data.pick || all.length, all.length));
    // fallback если pickedIds не совпали ни с одним вопросом
    const questions = (ordered.length ? ordered : shuffle(all).slice(0, Math.min(data.pick || all.length, all.length)));
    // Перемешиваем порядок вопросов на клиенте
    return shuffle(questions).map(q => shuffleAnswers(q, shuffle));
}

export class ModalQuiz {
    constructor(container, data, pickedIds = []) {
        this.container    = container;
        this.quizId       = data.quizId || data.id;
        this.title        = data.title;
        this.passingScore = data.passingScore ?? 70;
        this.questions    = buildModalQuestions(data, pickedIds);
        this.current      = 0;
        this.answers      = {};
        this.answered     = false;
        this._render();
    }

    _render() {
        if (this.current >= this.questions.length) { this._showResults(); return; }

        const q         = this.questions[this.current];
        const pct       = Math.round(this.current / this.questions.length * 100);
        const earnedPts = Object.values(this.answers).reduce((s, a) => s + (a.pts ?? 0), 0);
        this.answered   = false;

        const tpl = get('tpl-qm-question');
        if (!tpl) { console.warn('[ModalQuiz] tpl-qm-question not found'); return; }

        const node = tpl.content.cloneNode(true);
        node.querySelector('.qm-title').textContent         = this.title;
        node.querySelector('.qm-counter').textContent       = `${this.current + 1} / ${this.questions.length}`;
        node.querySelector('.qm-progress-fill').style.width = pct + '%';
        node.querySelector('.qm-type-badge').textContent    = typeLabel(q.type);
        node.querySelector('.qm-type-badge').className      = `qm-type-badge qm-type--${q.type}`;
        node.querySelector('.qm-question').innerHTML        = quizMd(q.question);
        node.querySelector('.qm-score-val').textContent     = earnedPts;

        const codeEl = node.querySelector('.qm-code');
        if (q.code && !['fill-code', 'fill-code-drag'].includes(q.type)) {
            codeEl.removeAttribute('hidden');
            codeEl.querySelector('code').textContent = q.code;
        }

        const checkBtn = node.querySelector('.js-qm-check');
        const nextBtn  = node.querySelector('.js-qm-next');
        checkBtn.removeAttribute('hidden');
        nextBtn.textContent = this.current + 1 < this.questions.length ? 'Далее →' : 'Завершить →';

        node.querySelector('.qm-feedback').id = 'qm-feedback';
        node.querySelector('.qm-answers').id  = 'qm-answers';

        this.container.replaceChildren(node);

        // Выносим footer из скроллируемой области наружу (в quiz-modal-box)
        const box = this.container.closest('.quiz-modal-box') || this.container.parentElement;
        const footer = this.container.querySelector('.qm-footer');
        if (footer && box && box !== this.container) {
            // Удаляем старый вынесенный footer если есть
            box.querySelector('.qm-footer--fixed')?.remove();
            footer.classList.add('qm-footer--fixed');
            box.appendChild(footer);
        }

        this.container.querySelector('#qm-answers')
            .replaceChildren(...buildNodes(q, this.quizId));

        nextBtn.hidden = true;
        nextBtn.addEventListener('click', () => { this.current++; this._render(); });

        attachListeners(q, this.container, checkBtn, this.quizId, value => {
            if (this.answered) return;
            this.answered = true;
            checkBtn.hidden = true;
            const { isRight, earned, extra } = submit(q, value, this.container, this.quizId);
            this.answers[this.current] = { isRight, pts: earned, qId: q.id };
            this._showFeedback(isRight, q.explanation, earned, extra);
            nextBtn.hidden = false;
        });

        highlightCode(this.container);
    }

    _showFeedback(isRight, explanation, earned, extra = null) {
        const fb = this.container.querySelector('#qm-feedback');
        if (!fb) return;

        const tpl = get('tpl-qm-feedback');
        if (tpl) {
            const node = tpl.content.cloneNode(true);
            node.querySelector('.qm-fb-icon').textContent      = isRight ? '✅' : '❌';
            node.querySelector('.qm-fb-verdict').textContent   = isRight ? 'Правильно!' : 'Неверно';
            node.querySelector('.qm-fb-explanation').innerHTML = explanation;
            const extraEl = node.querySelector('.qm-fb-extra');
            if (extra) { extraEl.innerHTML = extra; extraEl.removeAttribute('hidden'); }
            const ptsEl = node.querySelector('.qm-fb-pts');
            if (earned) { ptsEl.textContent = `+${earned} очков`; ptsEl.removeAttribute('hidden'); }
            fb.replaceChildren(node);
        }

        fb.removeAttribute('hidden');
        fb.style.display = 'flex';
        fb.className = `qm-feedback qm-feedback--${isRight ? 'correct' : 'wrong'}`;
        if (earned && window.gameSystem) window.gameSystem.earnXP(earned, 'за правильный ответ');
    }

    _saveAbandoned() {
        // Сохраняем попытку если тест не был завершён (закрыт крестиком)
        // Неотвеченные вопросы считаются неправильными
        if (this.current >= this.questions.length) return; // уже завершён нормально
        const answersArr = this.questions.map((q, i) => {
            const a = this.answers[i];
            return { isRight: a?.isRight ?? false, earned: a?.pts ?? 0, qId: q.id };
        });
        const earned = answersArr.reduce((s, a) => s + a.earned, 0);
        const pct    = Math.round((earned / (this.questions.length * 10)) * 100);
        saveResult({ quizId: this.quizId, title: this.title, questions: this.questions, answers: answersArr, pct })
            .then(() => {
                window.dispatchEvent(new CustomEvent('quizCompleted', { detail: { testId: this.quizId } }));
                window.ParagraphLock?.invalidateCache();
            });
    }

    _showResults() {
        const total   = this.questions.length;
        const earned  = Object.values(this.answers).reduce((s, a) => s + (a.pts ?? 0), 0);
        const pct     = Math.round((earned / (total * 10)) * 100);
        const correct = Object.values(this.answers).filter(a => a.isRight).length;
        const { emoji, msg: heading } = resultMood(pct);

        const answersArr = Object.values(this.answers).map(a => ({
            isRight: a.isRight, earned: a.pts, qId: a.qId,
        }));
        saveResult({ quizId: this.quizId, title: this.title, questions: this.questions, answers: answersArr, pct })
            .then(data => {
                const reward = data?.reward ?? data;
                if (reward?.coinsEarned !== undefined) this._showReward(reward);
                window.dispatchEvent(new CustomEvent('quizCompleted', { detail: { testId: this.quizId } }));
                window.ParagraphLock?.invalidateCache();
            });

        const tpl = get('tpl-qm-results');
        if (!tpl) return;

        const node = tpl.content.cloneNode(true);
        node.querySelector('.qm-results-emoji').textContent   = emoji;
        node.querySelector('.qm-results-heading').textContent = heading;
        node.querySelector('.qm-results-pct').textContent     = pct + '%';
        node.querySelector('.js-earned').textContent  = earned;
        node.querySelector('.js-correct').textContent = correct;
        node.querySelector('.js-total').textContent   = total;

        const arc = node.querySelector('.qm-results-arc');
        if (arc) {
            const passed = pct >= this.passingScore;
            arc.setAttribute('stroke', passed ? 'var(--accent-green)' : 'var(--accent-orange)');
            arc.setAttribute('stroke-dasharray', `${pct * 2.639} 263.9`);
        }

        const rewardsEl = node.querySelector('.qm-rewards');
        if (rewardsEl) rewardsEl.id = `qm-rewards-${this.quizId}`;

        node.querySelector('.js-qm-retry').addEventListener('click', () => {
            this.current = 0; this.answers = {}; this._render();
        });
        node.querySelector('.js-qm-close').addEventListener('click', () => window.closeQuizModal(null));

        this.container.replaceChildren(node);
    }

    _showReward(reward) {
        const el = document.getElementById(`qm-rewards-${this.quizId}`);
        if (!el) return;
        const parts = rewardParts(reward);
        if (!parts.length) return;
        el.removeAttribute('hidden');
        el.style.display = 'flex';
        el.replaceChildren(...parts.map(p => Object.assign(document.createElement('span'), { className: 'reward-badge', textContent: p })));
    }
}
