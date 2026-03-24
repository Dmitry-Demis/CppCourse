/**
 * Quiz Widget — универсальный компонент тестов
 *
 * Использование на странице:
 *   <div class="quiz-widget"
 *        data-quizzes="comments,comments-extra"
 *        data-final="comments-paragraph">
 *   </div>
 *
 * data-quizzes  — через запятую quizId мини/стандартных тестов (необязательно)
 * data-final    — quizId итогового теста (необязательно)
 *
 * Компонент сам:
 *  1. Загружает метаданные тестов с /api/quiz/{id}
 *  2. Рендерит карточки и/или итоговый блок
 *  3. Создаёт модальное окно (одно на страницу)
 *  4. Показывает бейдж с лучшим результатом из localStorage
 */

(function () {
    'use strict';

    const TYPE_LABELS = {
        mini:      { label: 'Мини-тест',      q: 5  },
        standard:  { label: 'Стандартный',    q: 10 },
        paragraph: { label: 'Итоговый',       q: 20 },
        chapter:   { label: 'Итог главы',     q: 40 },
    };

    // ── Инициализация всех виджетов на странице ──────────────────────────
    async function initAll() {
        ensureModal();

        const widgets = document.querySelectorAll('.quiz-widget');
        for (const el of widgets) {
            await renderWidget(el);
        }
    }

    // ── Рендер одного виджета ─────────────────────────────────────────────
    async function renderWidget(el) {
        const quizIds  = (el.dataset.quizzes || '').split(',').map(s => s.trim()).filter(Boolean);
        const finalId  = (el.dataset.final   || '').trim();

        el.classList.add('quiz-widget-section');

        // Карточки мини/стандартных тестов
        if (quizIds.length > 0) {
            const metas = await Promise.all(quizIds.map(fetchMeta));
            const grid  = document.createElement('div');
            grid.className = 'qw-cards';
            metas.forEach(meta => {
                if (meta) grid.appendChild(buildCard(meta));
            });
            el.appendChild(grid);
        }

        // Итоговый блок
        if (finalId) {
            const meta = await fetchMeta(finalId);
            if (meta) el.appendChild(buildFinal(meta, el.dataset.finalDesc || ''));
        }
    }

    // ── Получить метаданные теста (только title/type/pick) ───────────────
    const _cache = {};
    async function fetchMeta(quizId) {
        if (_cache[quizId]) return _cache[quizId];
        try {
            const r = await fetch(`/api/quiz/${quizId}`);
            if (!r.ok) return null;
            const d = await r.json();
            _cache[quizId] = d;
            return d;
        } catch { return null; }
    }

    // Считает реальное количество вопросов в тесте
    function calcPick(meta) {
        const total = meta.questions?.length ?? 0;
        const pick  = meta.pick ?? 0;
        if (pick > 0 && total > 0) return Math.min(pick, total);
        if (pick > 0) return pick;
        if (total > 0) return total;
        return TYPE_LABELS[meta.type || 'mini']?.q ?? 5;
    }

    // ── Карточка теста ────────────────────────────────────────────────────
    function buildCard(meta) {
        const type = meta.type || 'mini';
        const info = TYPE_LABELS[type] || TYPE_LABELS.mini;
        const pick = calcPick(meta);
        const best = getBest(meta.quizId);

        const card = document.createElement('div');
        card.className = 'qw-card';
        card.innerHTML = `
            <div class="qw-card__icon">${best !== null ? scoreEmoji(best) : '❓'}</div>
            <div class="qw-card__title">${esc(meta.title)}</div>
            <div class="qw-card__badge qw-card__badge--${type}">${info.label}</div>
            <div class="qw-card__desc">${pick} вопросов${best !== null ? ` · Лучший: ${best}%` : ''}</div>
            <button class="qw-btn qw-btn--${type}">Пройти тест &gt;</button>`;

        card.querySelector('button').addEventListener('click', () => openModal(meta.quizId, meta.title));
        return card;
    }

    // ── Итоговый блок — такой же стиль как карточка ───────────────────────
    function buildFinal(meta, desc) {
        const type = meta.type || 'paragraph';
        const info = TYPE_LABELS[type] || TYPE_LABELS.paragraph;
        const pick = calcPick(meta);
        const best = getBest(meta.quizId);
        const descText = desc || `${pick} вопросов по всем темам`;

        const card = document.createElement('div');
        card.className = `qw-card qw-card--final qw-card--final-${type}`;
        card.innerHTML = `
            <div class="qw-card__icon">${best !== null ? scoreEmoji(best) : '❓'}</div>
            <div class="qw-card__title">${esc(meta.title)}</div>
            <div class="qw-card__badge qw-card__badge--${type}">${info.label}</div>
            <div class="qw-card__desc">${esc(descText)}${best !== null ? ` · Лучший: ${best}%` : ''}</div>
            <button class="qw-btn qw-btn--${type}">Пройти итоговый тест &gt;</button>`;

        card.querySelector('button').addEventListener('click', () => openModal(meta.quizId, meta.title));
        return card;
    }

    // ── Модальное окно ────────────────────────────────────────────────────
    function ensureModal() {
        if (document.getElementById('qw-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id        = 'qw-modal-overlay';
        overlay.className = 'qw-modal-overlay';
        overlay.innerHTML = `
            <div class="qw-modal-box" id="qw-modal-box">
                <button class="qw-modal-close" id="qw-modal-close" aria-label="Закрыть">✕</button>
                <div id="qw-modal-content"></div>
            </div>`;
        document.body.appendChild(overlay);

        document.getElementById('qw-modal-close').addEventListener('click', closeModal);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    }

    async function openModal(quizId, title) {
        // Используем существующую систему из quiz.js если доступна
        if (typeof window.openQuizModal === 'function') {
            window.openQuizModal(quizId, title);
            return;
        }

        const overlay = document.getElementById('qw-modal-overlay');
        const content = document.getElementById('qw-modal-content');
        if (!overlay || !content) return;

        content.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)">⏳ Загрузка...</div>';
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const data = await fetchMeta(quizId);
        if (!data) {
            content.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--accent-red)">❌ Тест недоступен</div>';
            return;
        }

        window._activeModalQuiz = new ModalQuiz(content, data);
    }

    function closeModal() {
        const overlay = document.getElementById('qw-modal-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        window._activeModalQuiz = null;
    }

    // Экспортируем для совместимости с quiz.js
    window.openQuizModal  = window.openQuizModal  || openModal;
    window.closeQuizModal = window.closeQuizModal || function(e) { if (e === null || e === undefined) closeModal(); };

    // ── Вспомогательные ───────────────────────────────────────────────────
    function getBest(quizId) {
        try { return JSON.parse(localStorage.getItem(`quiz_best_${quizId}`)); } catch { return null; }
    }

    function scoreEmoji(pct) {
        if (pct >= 100) return '🥇';
        if (pct >= 90)  return '🥈';
        if (pct >= 80)  return '🥉';
        if (pct >= 70)  return '✅';
        return '📚';
    }

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Запуск ────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
