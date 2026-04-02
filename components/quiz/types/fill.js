// Тип: fill — текстовый ввод

export function buildNodes(q, quizId, tplGet) {
    const tpl = tplGet('tpl-answer-fill');
    if (tpl) {
        const node  = tpl.content.cloneNode(true);
        const input = node.querySelector('.quiz-fill-input');
        input.id = `fill-input-${quizId}`;
        return [node.querySelector('.quiz-fill-wrap') ?? input];
    }
    const wrap  = document.createElement('div');
    wrap.className = 'quiz-fill-wrap';
    const input = document.createElement('input');
    Object.assign(input, { type: 'text', className: 'quiz-fill-input', id: `fill-input-${quizId}`,
        placeholder: 'Введите ответ…', autocomplete: 'off', spellcheck: false });
    wrap.appendChild(input);
    return [wrap];
}

export function attachListeners(q, container, checkBtn, onCorrect) {
    const input = container.querySelector('.quiz-fill-input');
    const doCheck = () => {
        if (!input) return;
        if (checkBtn) checkBtn.hidden = true;
        onCorrect(input.value.trim());
    };
    if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.addEventListener('click', doCheck);
    }
    if (input) {
        input.addEventListener('input', () => { if (checkBtn) checkBtn.disabled = !input.value.trim(); });
        input.addEventListener('keydown', e => { if (e.key === 'Enter' && input.value.trim()) doCheck(); });
    }
}

export function submit(q, value, container) {
    const accepted = Array.isArray(q.correct) ? q.correct : [q.correct];
    const isRight  = accepted.some(v => v.toLowerCase() === value.toLowerCase());
    const earned   = isRight ? 10 : 0;
    const extra    = isRight ? null : `Правильный ответ: <code>${accepted[0]}</code>`;

    const input = container.querySelector('.quiz-fill-input');
    if (input) {
        input.disabled = true;
        input.classList.add(isRight ? 'fill--correct' : 'fill--wrong');
    }

    return { isRight, earned, extra };
}
