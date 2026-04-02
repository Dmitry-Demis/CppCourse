// Тип: fill-code-drag — перетаскивание фрагментов кода в слоты

export function buildNodes(q, quizId, tplGet, escape, md, shuffle) {
    const shuffled = shuffle([...q.answers]);

    // Пул карточек
    const poolTpl = tplGet('tpl-fill-drag-pool');
    const pool = poolTpl
        ? poolTpl.content.cloneNode(true).querySelector('.quiz-fill-drag-cards')
        : Object.assign(document.createElement('div'), { className: 'quiz-fill-drag-cards' });
    pool.id = `fdcards-${quizId}`;

    const cardTpl = tplGet('tpl-fill-drag-card');
    shuffled.forEach(card => {
        const el = cardTpl
            ? cardTpl.content.cloneNode(true).querySelector('.quiz-fill-drag-card')
            : _makeCard(card, escape, md);
        el.dataset.value = card;
        if (cardTpl) el.querySelector('.js-drag-card-text').innerHTML = md(escape(card));
        pool.appendChild(el);
    });

    // Код со слотами
    const codeTpl = tplGet('tpl-fill-drag-code');
    let pre, codeEl;
    if (codeTpl) {
        pre    = codeTpl.content.cloneNode(true).querySelector('pre');
        codeEl = pre.querySelector('.js-fill-drag-code');
    } else {
        pre    = document.createElement('pre');
        pre.className = 'quiz-code quiz-fill-code-pre';
        codeEl = document.createElement('code');
        codeEl.className = 'language-cpp';
        pre.appendChild(codeEl);
    }

    const slotTpl = tplGet('tpl-fill-drag-slot');
    const parts = q.code.split(/_{3,}/);
    const frag  = document.createDocumentFragment();
    let idx = 0;

    parts.forEach((part, pi) => {
        frag.appendChild(document.createTextNode(part));
        if (pi < parts.length - 1) {
            const slot = slotTpl
                ? slotTpl.content.cloneNode(true).querySelector('.quiz-fill-drop-slot')
                : _makeSlot();
            slot.dataset.slot = idx;
            slot.id = `fdslot-${quizId}-${idx}`;
            idx++;
            frag.appendChild(slot);
        }
    });

    codeEl.replaceChildren(frag);
    return [pool, pre];
}

function _makeCard(value, escape, md) {
    const el = document.createElement('div');
    el.className = 'quiz-fill-drag-card';
    el.draggable = true;
    el.innerHTML = md(escape(value));
    return el;
}

function _makeSlot() {
    const slot = document.createElement('span');
    slot.className = 'quiz-fill-drop-slot';
    const hint = document.createElement('span');
    hint.className = 'quiz-fill-slot-hint';
    hint.textContent = '?';
    slot.appendChild(hint);
    return slot;
}

export function attachListeners(q, container, checkBtn, quizId, onCorrect) {
    initDnd(container, quizId);
    if (!checkBtn) return;
    checkBtn.addEventListener('click', () => {
        checkBtn.hidden = true;
        onCorrect(null);
    });
}

export function initDnd(container, quizId) {
    // draggedSource — оригинальная карточка (из пула или из слота)
    let draggedSource = null;
    let draggedFromSlot = null; // слот откуда тащим (если из слота)

    const bindCard = card => {
        card.addEventListener('dragstart', e => {
            draggedSource = card;
            draggedFromSlot = card.closest('.quiz-fill-drop-slot') || null;
            card.classList.add('quiz-fill-drag-card--dragging');
            e.dataTransfer.effectAllowed = 'copy';
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('quiz-fill-drag-card--dragging');
            draggedSource = null;
            draggedFromSlot = null;
        });
    };

    container.querySelectorAll('.quiz-fill-drag-card').forEach(bindCard);

    container.querySelectorAll('.quiz-fill-drop-slot').forEach(slot => {
        slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('quiz-fill-drop-slot--over'); });
        slot.addEventListener('dragleave', () => slot.classList.remove('quiz-fill-drop-slot--over'));
        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('quiz-fill-drop-slot--over');
            if (!draggedSource) return;

            // Если в слоте уже есть карточка — убираем её (она была клоном, просто удаляем)
            slot.querySelector('.quiz-fill-drag-card')?.remove();
            slot.querySelector('.quiz-fill-slot-hint')?.remove();

            // Если тащим из другого слота — убираем карточку оттуда
            if (draggedFromSlot && draggedFromSlot !== slot) {
                draggedSource.remove();
                const hint = document.createElement('span');
                hint.className = 'quiz-fill-slot-hint';
                hint.textContent = '?';
                draggedFromSlot.appendChild(hint);
            }

            // Клонируем карточку из пула, или перемещаем из слота
            const clone = draggedFromSlot ? draggedSource : draggedSource.cloneNode(true);
            bindCard(clone);
            slot.appendChild(clone);
        });
    });

    const pool = container.querySelector(`#fdcards-${quizId}`);
    if (pool) {
        pool.addEventListener('dragover', e => e.preventDefault());
        pool.addEventListener('drop', e => {
            e.preventDefault();
            if (!draggedSource || !draggedFromSlot) return;
            // Возврат карточки из слота в пул — удаляем из слота, восстанавливаем hint
            draggedSource.remove();
            const hint = document.createElement('span');
            hint.className = 'quiz-fill-slot-hint';
            hint.textContent = '?';
            draggedFromSlot.appendChild(hint);
        });
    }
}

export function submit(q, _value, container, quizId, tplGet) {
    const slots   = container.querySelectorAll('.quiz-fill-drop-slot');
    const correct = Array.isArray(q.correct) ? q.correct : [q.correct];
    let rightCount = 0;

    slots.forEach((slot, i) => {
        const card     = slot.querySelector('.quiz-fill-drag-card');
        const placed   = card?.dataset.value ?? null;
        const expected = correct[i] ?? '';
        const ok       = placed === expected;
        if (ok) rightCount++;
        slot.classList.add(ok ? 'quiz-fill-drop-slot--ok' : 'quiz-fill-drop-slot--err');
        if (!ok) {
            const answerTpl = tplGet('tpl-fill-drag-answer');
            const hint = answerTpl
                ? answerTpl.content.cloneNode(true).querySelector('.quiz-fill-slot-answer')
                : Object.assign(document.createElement('span'), { className: 'quiz-fill-slot-answer' });
            hint.textContent = expected;
            slot.appendChild(hint);
        }
    });

    const isRight = rightCount === slots.length;
    const earned  = Math.round((rightCount / slots.length) * 10);
    const extra   = isRight ? null : `Правильно: ${rightCount} из ${slots.length}`;
    return { isRight, earned, extra };
}
