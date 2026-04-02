// Тип: single / code — один вариант ответа

export function buildNodes(q, quizId, tplGet, escape, md) {
    return q.answers.map((ans, i) => {
        const tpl = tplGet('tpl-answer-single');
        const btn = tpl
            ? tpl.content.cloneNode(true).querySelector('.quiz-answer')
            : Object.assign(document.createElement('button'), { className: 'quiz-answer', type: 'button' });

        btn.dataset.index = i;
        btn.querySelector('.quiz-answer-letter').textContent = String.fromCharCode(65 + i);
        btn.querySelector('.quiz-answer-text').innerHTML = md(ans);
        return btn;
    });
}

export function attachListeners(q, container, checkBtn, onCorrect) {
    let selected = null;

    container.querySelectorAll('.quiz-answer').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.quiz-answer').forEach(b => b.classList.remove('quiz-answer--selected'));
            btn.classList.add('quiz-answer--selected');
            selected = parseInt(btn.dataset.index);
            if (checkBtn) checkBtn.disabled = false;
        });
    });

    if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.addEventListener('click', () => {
            if (selected === null) return;
            checkBtn.hidden = true;
            onCorrect(selected);
        });
    }
}

export function submit(q, selectedIdx, container) {
    const isRight = selectedIdx === q.correct;
    const earned  = isRight ? 10 : 0;

    container.querySelectorAll('.quiz-answer').forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct)                       btn.classList.add('quiz-answer--correct');
        if (i === selectedIdx && !isRight)         btn.classList.add('quiz-answer--wrong');
    });

    return { isRight, earned, extra: null };
}
