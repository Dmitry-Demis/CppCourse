// Тип: fill-code — код с inline-инпутами для заполнения пропусков

export function buildNodes(q, quizId, tplGet) {
    const wrapTpl = tplGet('tpl-fill-code-wrap');
    let pre, codeEl;

    if (wrapTpl) {
        pre    = wrapTpl.content.cloneNode(true).querySelector('pre');
        codeEl = pre.querySelector('.js-fill-code-content');
    } else {
        pre    = document.createElement('pre');
        pre.className = 'quiz-code quiz-fill-code-pre';
        codeEl = document.createElement('code');
        codeEl.className = 'language-cpp';
        pre.appendChild(codeEl);
    }

    const inputTpl = tplGet('tpl-fill-code-input');
    const parts = q.code.split(/_{3,}/);
    const frag  = document.createDocumentFragment();
    let idx = 0;

    parts.forEach((part, pi) => {
        frag.appendChild(document.createTextNode(part));
        if (pi < parts.length - 1) {
            const input = inputTpl
                ? inputTpl.content.cloneNode(true).querySelector('.quiz-fill-inline')
                : _makeInput();
            input.dataset.fillIndex = idx++;
            frag.appendChild(input);
        }
    });

    codeEl.replaceChildren(frag);
    return [pre];
}

function _makeInput() {
    const input = document.createElement('input');
    input.className   = 'quiz-fill-inline';
    input.autocomplete = 'off';
    input.spellcheck  = false;
    input.placeholder = '?';
    return input;
}

export function attachListeners(q, container, checkBtn, onCorrect) {
    if (!checkBtn) return;
    checkBtn.addEventListener('click', () => {
        checkBtn.hidden = true;
        onCorrect(null);
    });
}

export function submit(q, _value, container) {
    const inputs  = container.querySelectorAll('.quiz-fill-inline');
    const correct = Array.isArray(q.correct) ? q.correct : [q.correct];
    let rightCount = 0;

    inputs.forEach((inp, i) => {
        inp.disabled = true;
        const expected = correct[i] ?? '';
        const ok = inp.value.trim().toLowerCase() === expected.toLowerCase();
        if (ok) rightCount++;
        inp.classList.add(ok ? 'quiz-fill-inline--ok' : 'quiz-fill-inline--err');
        if (!ok) inp.title = `Правильно: ${expected}`;
    });

    const isRight = rightCount === inputs.length;
    const earned  = Math.round((rightCount / inputs.length) * 10);
    const extra   = isRight ? null : `Правильно: ${rightCount} из ${inputs.length}`;
    return { isRight, earned, extra };
}
