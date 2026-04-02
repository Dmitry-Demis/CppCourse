// Вспомогательные утилиты

export function quizMd(text) {
    return String(text).replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Безопасная версия — экранирует HTML перед обработкой backtick-разметки
export function safeQuizMd(text) {
    const escaped = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function escape(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

export function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function shuffleAnswers(q, shuffleFn) {
    if (!['single', 'code', 'multiple'].includes(q.type) || !Array.isArray(q.answers)) return q;
    const indexed = q.answers.map((a, i) => ({ a, i }));
    shuffleFn(indexed);
    const remap = {};
    indexed.forEach((x, ni) => { remap[x.i] = ni; });
    return {
        ...q,
        answers: indexed.map(x => x.a),
        correct: q.type === 'multiple' ? q.correct.map(c => remap[c]) : remap[q.correct],
    };
}

export function typeLabel(type) {
    return {
        single: 'Один ответ', multiple: 'Несколько ответов', fill: 'Введите ответ',
        code: 'Что выведет код?', matching: 'Соответствие',
        'fill-code': 'Восстановите код', 'fill-code-drag': 'Расставьте фрагменты',
        'classify': 'Распределите по категориям',
    }[type] || type;
}

export function resultMood(pct) {
    if (pct >= 90) return { emoji: '🏆', msg: 'Отлично! Превосходный результат!' };
    if (pct >= 70) return { emoji: '👍', msg: 'Хорошо! Есть небольшие пробелы.' };
    if (pct >= 50) return { emoji: '📚', msg: 'Неплохо, но стоит повторить материал.' };
    return           { emoji: '💪', msg: 'Рекомендуем перечитать параграф.' };
}

export function rewardParts(reward) {
    const statusEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉', passed: '✅', failed: '❌' };
    const parts = [];
    if (reward.coinsEarned > 0) parts.push(`🪙 +${reward.coinsEarned} монет`);
    if (reward.xpEarned > 0)    parts.push(`⭐ +${reward.xpEarned} XP`);
    if (reward.idealBonus)       parts.push('⚡ Бонус x1.5 за идеал!');
    if (reward.isNewStatus)      parts.push(`${statusEmoji[reward.status] || ''} Новый статус: ${reward.status}`);
    return parts;
}

export function saveResult({ quizId, title, questions, answers, pct }) {
    const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
    if (!user?.isuNumber) return Promise.resolve(null);

    const parts       = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    const paragraphId = (parts.at(-1) || '').replace(/\.html$/, '') || 'unknown';
    const wrongIds    = answers.map((a, i) => (!a?.isRight && questions[i]?.id != null) ? questions[i].id : null).filter(Boolean);
    const correctIds  = answers.map((a, i) => (a?.isRight  && questions[i]?.id != null) ? questions[i].id : null).filter(Boolean);

    return fetch('/api/test/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Isu-Number': user.isuNumber },
        body: JSON.stringify({
            paragraphId, testId: quizId, testTitle: title, score: pct,
            correctAnswers: correctIds.length, totalQuestions: questions.length,
            wrongQuestionIds: wrongIds, correctQuestionIds: correctIds, timeSpent: 0,
        }),
    }).then(r => r.json()).catch(() => null);
}

export function highlightCode(container) {
    if (window.Prism) {
        container.querySelectorAll('pre code').forEach(b => {
            if (!b.querySelector('input, .quiz-fill-drop-slot')) Prism.highlightElement(b);
        });
    } else if (window.hljs) {
        container.querySelectorAll('pre code').forEach(b => {
            if (!b.querySelector('input, .quiz-fill-drop-slot')) hljs.highlightElement(b);
        });
    }
}
