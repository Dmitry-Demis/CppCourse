// Тип: matching — перетаскивание карточек в слоты

export function buildNodes(q, quizId, tplGet, escape, md, shuffle) {
    const shuffledPairs = shuffle([...q.pairs]);          // перемешиваем пары (left меняется)
    const shuffledRight = shuffle(shuffledPairs.map(p => p.right)); // правые карточки в пуле
    const wrap = document.createElement('div');
    wrap.className = 'quiz-matching';

    // Пул карточек
    const poolTpl = tplGet('tpl-matching-pool');
    const pool = poolTpl
        ? poolTpl.content.cloneNode(true).querySelector('.quiz-matching-cards')
        : Object.assign(document.createElement('div'), { className: 'quiz-matching-cards' });
    pool.id = `matching-cards-${quizId}`;

    const cardTpl = tplGet('tpl-matching-card');
    shuffledRight.forEach(item => {
        const card = cardTpl
            ? cardTpl.content.cloneNode(true).querySelector('.quiz-matching-card')
            : _makeCard(item, escape, md);
        card.dataset.value = item;
        if (cardTpl) card.querySelector('.js-card-text').innerHTML = md(escape(item));
        pool.appendChild(card);
    });

    // Слоты
    const slotsTpl = tplGet('tpl-matching-slots');
    const slotsWrap = slotsTpl
        ? slotsTpl.content.cloneNode(true).querySelector('.quiz-matching-slots')
        : Object.assign(document.createElement('div'), { className: 'quiz-matching-slots' });

    const rowTpl = tplGet('tpl-matching-row');
    shuffledPairs.forEach((pair, i) => {
        const row = rowTpl
            ? _fillRow(rowTpl.content.cloneNode(true).querySelector('.quiz-matching-row'), pair, i, quizId, escape, md)
            : _makeRow(pair, i, quizId, escape, md);
        slotsWrap.appendChild(row);
    });

    wrap.appendChild(pool);
    wrap.appendChild(slotsWrap);
    return [wrap];
}

function _makeCard(item, escape, md) {
    const card = document.createElement('div');
    card.className = 'quiz-matching-card';
    card.draggable = true;
    const handle = document.createElement('span');
    handle.className = 'quiz-matching-drag-handle';
    handle.textContent = '⠿';
    const text = document.createElement('span');
    text.innerHTML = md(escape(item));
    card.append(handle, text);
    return card;
}

function _fillRow(row, pair, i, quizId, escape, md) {
    row.querySelector('.js-row-letter').textContent = i + 1;
    row.querySelector('.js-row-left').innerHTML = md(escape(pair.left));
    const slot = row.querySelector('.js-slot');
    slot.dataset.slot = i;
    slot.dataset.expected = pair.right;   // сохраняем правильный ответ для этого слота
    slot.id = `mslot-${quizId}-${i}`;
    return row;
}

function _makeRow(pair, i, quizId, escape, md) {
    const row = document.createElement('div');
    row.className = 'quiz-matching-row';

    const label = document.createElement('div');
    label.className = 'quiz-matching-label';
    const letter = document.createElement('span');
    letter.className = 'quiz-answer-letter';
    letter.textContent = i + 1;
    const left = document.createElement('span');
    left.innerHTML = md(escape(pair.left));
    label.append(letter, left);

    const slot = document.createElement('div');
    slot.className = 'quiz-matching-slot';
    slot.dataset.slot = i;
    slot.dataset.expected = pair.right;   // сохраняем правильный ответ для этого слота
    slot.id = `mslot-${quizId}-${i}`;
    const hint = document.createElement('span');
    hint.className = 'quiz-matching-slot-hint';
    hint.textContent = 'Перетащите сюда';
    slot.appendChild(hint);

    row.append(label, slot);
    return row;
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
    let dragged = null;

    const bindCard = card => {
        card.addEventListener('dragstart', e => {
            dragged = card;
            card.classList.add('quiz-matching-card--dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('quiz-matching-card--dragging');
            dragged = null;
        });
    };

    container.querySelectorAll('.quiz-matching-card').forEach(bindCard);

    container.querySelectorAll('.quiz-matching-slot').forEach(slot => {
        slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('quiz-matching-slot--over'); });
        slot.addEventListener('dragleave', () => slot.classList.remove('quiz-matching-slot--over'));
        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('quiz-matching-slot--over');
            if (!dragged) return;
            const existing = slot.querySelector('.quiz-matching-card');
            const pool = container.querySelector(`#matching-cards-${quizId}`);
            if (existing && pool) { pool.appendChild(existing); bindCard(existing); }
            slot.querySelector('.quiz-matching-slot-hint')?.remove();
            slot.appendChild(dragged);
        });
    });

    const pool = container.querySelector(`#matching-cards-${quizId}`);
    if (pool) {
        pool.addEventListener('dragover', e => e.preventDefault());
        pool.addEventListener('drop', e => { e.preventDefault(); if (dragged) pool.appendChild(dragged); });
    }
}

export function submit(q, _value, container, quizId, tplGet) {
    const slots = container.querySelectorAll('.quiz-matching-slot');
    let correct = 0;

    slots.forEach((slot) => {
        const card     = slot.querySelector('.quiz-matching-card');
        const placed   = card?.dataset.value ?? null;
        const expected = slot.dataset.expected;   // берём из dataset, не из q.pairs
        const ok       = placed === expected;
        if (ok) correct++;
        slot.classList.add(ok ? 'quiz-matching-slot--correct' : 'quiz-matching-slot--wrong');
        if (!ok) {
            const hintTpl = tplGet('tpl-matching-hint');
            const hint = hintTpl
                ? hintTpl.content.cloneNode(true).querySelector('.quiz-matching-answer-hint')
                : Object.assign(document.createElement('span'), { className: 'quiz-matching-answer-hint' });
            hint.textContent = expected;
            slot.appendChild(hint);
        }
    });

    const isRight = correct === slots.length;
    const earned  = Math.round((correct / slots.length) * 10);
    const extra   = isRight ? null : `Правильно: ${correct} из ${slots.length}`;
    return { isRight, earned, extra };
}
