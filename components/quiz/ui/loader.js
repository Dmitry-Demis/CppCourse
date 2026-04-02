// QuizLoader — загрузка теста из JSON-файла

import { Quiz } from './quiz-inline.js';
import { shuffle } from './helpers.js';

export const QuizLoader = {
    async init(containerId, jsonPath) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loading = document.createElement('div');
        loading.className = 'quiz-loading';
        loading.textContent = '⏳ Загрузка теста…';
        container.replaceChildren(loading);

        let data;
        try {
            const res = await fetch(jsonPath);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            data = await res.json();
        } catch (e) {
            loading.textContent = '❌ Не удалось загрузить тест';
            loading.style.color = 'var(--accent-red)';
            console.error('[QuizLoader]', jsonPath, e);
            return;
        }

        const wrongIds  = await this._fetchWrongIds(data.quizId);
        const questions = this._pickQuestions(data, wrongIds);
        new Quiz(containerId, questions, {
            quizId: data.quizId, title: data.title,
            type: data.type || 'mini', passingScore: data.passingScore ?? 70,
        });
    },

    async _fetchWrongIds(quizId) {
        try {
            const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
            if (!user?.isuNumber) return new Set();
            const res = await fetch(`/api/quiz/${quizId}/wrong-ids`, { headers: { 'X-Isu-Number': user.isuNumber } });
            return res.ok ? new Set(await res.json()) : new Set();
        } catch { return new Set(); }
    },

    _pickQuestions(data, wrongIds = new Set()) {
        const all     = data.questions || [];
        const pick    = Math.min(data.pick || all.length, all.length);
        const wrong   = shuffle(all.filter(q => wrongIds.has(q.id)));
        const correct = shuffle(all.filter(q => !wrongIds.has(q.id)));
        return shuffle([...wrong, ...correct].slice(0, pick));
    },
};
