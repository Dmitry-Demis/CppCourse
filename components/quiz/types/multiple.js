// Тип: multiple — несколько вариантов ответа

export function buildNodes(q, quizId, tplGet, escape, md) {
    return q.answers.map((ans, i) => {
        const tpl = tplGet('tpl-answer-multiple');
        const label = tpl
            ? tpl.content.cloneNode(true).querySelector('.quiz-answer')
            : document.createElement('label');

        if (!tpl) {
            label.className = 'quiz-answer quiz-answer--check';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            const letter = document.createElement('span');
            letter.className = 'quiz-answer-letter';
            const text = document.createElement('span');
            text.className = 'quiz-answer-text';
            label.append(cb, letter, text);
        }

        const cb = label.querySelector('input[type="checkbox"]');
        cb.dataset.index = i;
        cb.classList.add('quiz-checkbox');
        label.querySelector('.quiz-answer-letter').textContent = String.fromCharCode(65 + i);
        label.querySelector('.quiz-answer-text').innerHTML = md(ans);
        return label;
    });
}

export function attachListeners(q, container, checkBtn, onCorrect) {
    if (!checkBtn) return;
    checkBtn.addEventListener('click', () => {
        checkBtn.hidden = true;
        const checked = Array.from(container.querySelectorAll('.quiz-checkbox:checked'))
            .map(cb => parseInt(cb.dataset.index));
        onCorrect(checked);
    });
}

export function submit(q, selectedIndices, container) {
    const correct   = q.correct;
    const allRight  = correct.every(i => selectedIndices.includes(i)) &&
                      selectedIndices.every(i => correct.includes(i));
    const partialOk = correct.some(i => selectedIndices.includes(i));
    const earned    = allRight ? 10 : partialOk ? 5 : 0;

    container.querySelectorAll('.quiz-answer').forEach((label, i) => {
        const cb = label.querySelector('.quiz-checkbox');
        if (cb) cb.disabled = true;
        if (correct.includes(i))                                label.classList.add('quiz-answer--correct');
        if (selectedIndices.includes(i) && !correct.includes(i)) label.classList.add('quiz-answer--wrong');
    });

    return { isRight: allRight, earned, extra: null };
}
