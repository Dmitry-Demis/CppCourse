// Тип: fill-code-drag — перетаскивание фрагментов кода в слоты
//
// Формат correct — массив допустимых полных комбинаций:
//   [["/*", "*/"], ["//", null]]
//   — комбинация 1: слот0="/*" И слот1="*/"
//   — комбинация 2: слот0="//" И слот1=пусто (null = ничего не вставлено)
//
// Засчитывается если пользователь совпал с ЛЮБОЙ комбинацией полностью.
// Очки — пропорционально слотам лучшей частично совпавшей комбинации.
//
// Для одной комбинации можно писать просто: "correct": ["/*", "*/"]

function _parseCombinations(raw) {
    // Возвращает массив комбинаций: (string|null)[][]
    // Каждая комбинация — массив значений для слотов (null = пустой слот)
    if (!Array.isArray(raw)) return [[raw]];
    // Если первый элемент — массив, то это массив комбинаций
    const combos = Array.isArray(raw[0]) ? raw : [raw];
    // Выравниваем все комбинации до длины самой длинной (хвостовые null дописываются)
    const maxLen = Math.max(...combos.map(c => c.length));
    return combos.map(c => {
        const padded = [...c];
        while (padded.length < maxLen) padded.push(null);
        return padded;
    });
}

// Возвращает маску активных слотов по первой комбинации
// (слот активен если хотя бы в одной комбинации он не null)
function _activeSlots(combos, slotCount) {
    const active = new Array(slotCount).fill(false);
    combos.forEach(combo => {
        combo.forEach((v, i) => { if (v !== null && v !== undefined) active[i] = true; });
    });
    return active;
}

export function buildNodes(q, quizId, tplGet, escape, md, shuffle) {
    const combos     = _parseCombinations(q.correct);
    const slotCount  = combos[0]?.length ?? 0;
    const active     = _activeSlots(combos, slotCount);
    const shuffled   = shuffle([...q.answers]);

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
            : _makeCard(card, md);
        el.dataset.value = card;
        if (cardTpl) el.querySelector('.js-drag-card-text').innerHTML = md(card);
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
    const parts   = q.code.split(/_{3,}/);
    const frag    = document.createDocumentFragment();
    let idx = 0;

    parts.forEach((part, pi) => {
        frag.appendChild(document.createTextNode(part));
        if (pi < parts.length - 1) {
            if (active[idx]) {
                const slot = slotTpl
                    ? slotTpl.content.cloneNode(true).querySelector('.quiz-fill-drop-slot')
                    : _makeSlot();
                slot.dataset.slot = idx;
                slot.id = `fdslot-${quizId}-${idx}`;
                frag.appendChild(slot);
            } else {
                // Слот не нужен ни в одной комбинации — невидимое место
                const fixed = document.createElement('span');
                fixed.className = 'quiz-fill-fixed-slot';
                fixed.dataset.slot = idx;
                frag.appendChild(fixed);
            }
            idx++;
        }
    });

    codeEl.replaceChildren(frag);
    return [pool, pre];
}

function _makeCard(value, md) {
    const el = document.createElement('div');
    el.className = 'quiz-fill-drag-card';
    el.draggable = true;
    el.innerHTML = md(value);
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
    checkBtn.disabled = true;

    // Разблокировать при первом drop в слот
    const enableOnDrop = () => { checkBtn.disabled = false; };
    container.querySelectorAll('.quiz-fill-drop-slot').forEach(slot => {
        slot.addEventListener('drop', enableOnDrop, { once: true });
    });

    checkBtn.addEventListener('click', () => {
        checkBtn.hidden = true;
        onCorrect(null);
    });
}

export function initDnd(container, quizId) {
    let draggedSource   = null;
    let draggedFromSlot = null;

    const bindCard = card => {
        card.addEventListener('dragstart', e => {
            draggedSource   = card;
            draggedFromSlot = card.closest('.quiz-fill-drop-slot') || null;
            card.classList.add('quiz-fill-drag-card--dragging');
            e.dataTransfer.effectAllowed = 'copy';
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('quiz-fill-drag-card--dragging');
            draggedSource   = null;
            draggedFromSlot = null;
        });
    };

    container.querySelectorAll('.quiz-fill-drag-card').forEach(bindCard);

    container.querySelectorAll('.quiz-fill-drop-slot').forEach(slot => {
        slot.addEventListener('dragover',  e => { e.preventDefault(); slot.classList.add('quiz-fill-drop-slot--over'); });
        slot.addEventListener('dragleave', () => slot.classList.remove('quiz-fill-drop-slot--over'));
        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('quiz-fill-drop-slot--over');
            if (!draggedSource) return;

            slot.querySelector('.quiz-fill-drag-card')?.remove();
            slot.querySelector('.quiz-fill-slot-hint')?.remove();

            if (draggedFromSlot && draggedFromSlot !== slot) {
                draggedSource.remove();
                const hint = document.createElement('span');
                hint.className = 'quiz-fill-slot-hint';
                hint.textContent = '?';
                draggedFromSlot.appendChild(hint);
            }

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
            draggedSource.remove();
            const hint = document.createElement('span');
            hint.className = 'quiz-fill-slot-hint';
            hint.textContent = '?';
            draggedFromSlot.appendChild(hint);
        });
    }
}

export function submit(q, _value, container, quizId, tplGet) {
    const combos = _parseCombinations(q.correct);
    const slots  = container.querySelectorAll('.quiz-fill-drop-slot');

    // Собираем текущие значения слотов
    const placed = {};
    slots.forEach(slot => {
        const i   = parseInt(slot.dataset.slot);
        const card = slot.querySelector('.quiz-fill-drag-card');
        placed[i] = card?.dataset.value ?? null;
    });

    // Находим лучшую комбинацию (максимум совпадений)
    let bestCombo   = combos[0];
    let bestMatches = -1;

    combos.forEach(combo => {
        let matches = 0;
        combo.forEach((expected, i) => {
            const actual = placed[i] ?? null;
            if (expected === actual) matches++;
        });
        if (matches > bestMatches) { bestMatches = matches; bestCombo = combo; }
    });

    // Проверяем по лучшей комбинации
    let rightCount = 0;

    slots.forEach(slot => {
        const i        = parseInt(slot.dataset.slot);
        const expected = bestCombo[i] ?? null;
        const actual   = placed[i] ?? null;
        const ok       = expected === actual;

        if (ok) rightCount++;
        slot.classList.add(ok ? 'quiz-fill-drop-slot--ok' : 'quiz-fill-drop-slot--err');

        if (!ok) {
            const answerTpl = tplGet('tpl-fill-drag-answer');
            const hint = answerTpl
                ? answerTpl.content.cloneNode(true).querySelector('.quiz-fill-slot-answer')
                : Object.assign(document.createElement('span'), { className: 'quiz-fill-slot-answer' });
            // Показываем все допустимые значения для этого слота из всех комбинаций
            const allVariants = [...new Set(combos.map(c => c[i]).filter(v => v !== null))];
            hint.textContent  = allVariants.join(' / ') || '(пусто)';
            slot.appendChild(hint);
        }
    });

    const slotCount = slots.length;
    const isRight   = rightCount === slotCount;
    const earned    = slotCount > 0 ? Math.round((rightCount / slotCount) * 10) : 10;
    const extra     = isRight ? null : `Правильно: ${rightCount} из ${slotCount}`;
    return { isRight, earned, extra };
}
