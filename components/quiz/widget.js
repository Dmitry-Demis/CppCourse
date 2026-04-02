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

        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        const isLoggedIn = !!(user?.isuNumber);

        // Загружаем серверную статистику для всех тестов виджета
        const allIds = [...quizIds, ...(finalId ? [finalId] : [])];
        const serverStats = isLoggedIn ? await fetchServerStats(allIds) : {};

        // Карточки мини/стандартных тестов
        if (quizIds.length > 0) {
            const metas = await Promise.all(quizIds.map(fetchMeta));
            const grid  = document.createElement('div');
            grid.className = 'qw-cards';
            metas.forEach((meta, i) => {
                if (meta) {
                    grid.appendChild(buildCard(meta, serverStats[meta.quizId] || null, isLoggedIn));
                } else {
                    grid.appendChild(buildUnavailable(quizIds[i]));
                }
            });
            el.appendChild(grid);
        }

        // Итоговый блок
        if (finalId) {
            const meta = await fetchMeta(finalId);
            if (meta) {
                el.appendChild(buildFinal(meta, el.dataset.finalDesc || '', serverStats[meta.quizId] || null, isLoggedIn));
            } else {
                el.appendChild(buildUnavailable(finalId));
            }
        }
    }

    // ── Плашка «Тест в разработке» ────────────────────────────────────────
    function buildUnavailable(quizId) {
        const div = document.createElement('div');
        div.className = 'qw-card qw-card--unavailable';
        div.innerHTML = `
            <div class="qw-card__icon">🚧</div>
            <div class="qw-card__title">Тест в разработке</div>
            <div class="qw-card__desc" style="color:var(--text-muted);font-size:.8rem">${esc(quizId)}</div>`;
        return div;
    }

    // ── Загрузить статистику тестов с сервера ─────────────────────────────
    async function fetchServerStats(quizIds) {
        const result = {};
        try {
            const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
            if (!user?.isuNumber || quizIds.length === 0) return result;

            const parts = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
            const lastPart = parts[parts.length - 1] || '';
            const paragraphId = lastPart.replace(/\.html$/, '');
            if (!paragraphId) return result;

            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 4000);
            const res = await fetch(`/api/progress/${user.isuNumber}/${paragraphId}`, {
                headers: { 'X-Isu-Number': user.isuNumber },
                signal: ctrl.signal
            });
            clearTimeout(timer);
            if (!res.ok) return result;
            const data = await res.json();
            const tests = data.tests || {};

            for (const [testId, stats] of Object.entries(tests)) {
                if (stats.attemptsCount > 0) {
                    result[testId] = {
                        best:     stats.bestScore,
                        attempts: stats.attemptsCount,
                        median:   null
                    };
                }
            }
        } catch { /* silent */ }
        return result;
    }

    // ── Получить метаданные теста (только title/type/pick) ───────────────
    const _cache = {};
    async function fetchMeta(quizId) {
        if (_cache[quizId]) return _cache[quizId];
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 5000);
            const r = await fetch(`/api/quiz/${quizId}`, { signal: ctrl.signal });
            clearTimeout(timer);
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
    function buildCard(meta, stats, isLoggedIn) {
        const type  = meta.type || 'mini';
        const info  = TYPE_LABELS[type] || TYPE_LABELS.mini;
        const pick  = calcPick(meta);

        const card = document.createElement('div');
        card.className = 'qw-card';
        card.innerHTML = `
            <div class="qw-card__icon">${stats ? scoreEmoji(stats.best) : '❓'}</div>
            <div class="qw-card__title">${esc(meta.title)}</div>
            <div class="qw-card__badge qw-card__badge--${type}">${info.label}</div>
            <div class="qw-card__desc">${pick} вопросов</div>
            ${stats ? `<div class="qw-card__stats">
                <span class="qw-stat"><span class="qw-stat__label">Лучший</span><span class="qw-stat__val">${stats.best}%</span></span>
                ${stats.median !== null ? `<span class="qw-stat"><span class="qw-stat__label">Медиана</span><span class="qw-stat__val">${stats.median}%</span></span>` : ''}
                <span class="qw-stat"><span class="qw-stat__label">Попыток</span><span class="qw-stat__val">${stats.attempts}</span></span>
            </div>` : ''}
            ${isLoggedIn
                ? `<button class="qw-btn qw-btn--${type}">Пройти тест &gt;</button>`
                : `<a href="/login.html" class="qw-btn qw-btn--login">🔑 Войдите для прохождения</a>`
            }`;

        if (isLoggedIn) {
            card.querySelector('button').addEventListener('click', () => openModal(meta.quizId));
        }
        return card;
    }

    // ── Итоговый блок ─────────────────────────────────────────────────────
    function buildFinal(meta, desc, stats, isLoggedIn) {
        const type  = meta.type || 'paragraph';
        const info  = TYPE_LABELS[type] || TYPE_LABELS.paragraph;
        const pick  = calcPick(meta);
        const descText = desc || `${pick} вопросов по всем темам`;

        const statsHtml = stats ? `
            <div class="qw-card__stats">
                <span class="qw-stat"><span class="qw-stat__label">Лучший</span><span class="qw-stat__val">${stats.best}%</span></span>
                ${stats.median !== null ? `<span class="qw-stat"><span class="qw-stat__label">Медиана</span><span class="qw-stat__val">${stats.median}%</span></span>` : ''}
                <span class="qw-stat"><span class="qw-stat__label">Попыток</span><span class="qw-stat__val">${stats.attempts}</span></span>
            </div>` : '';

        const btnHtml = isLoggedIn
            ? `<button class="qw-btn qw-btn--${type}" style="margin-top:0">Пройти итоговый тест &gt;</button>`
            : `<a href="/login.html" class="qw-btn qw-btn--login" style="margin-top:0">🔑 Войдите для прохождения</a>`;

        const card = document.createElement('div');
        card.className = `qw-card qw-card--final qw-card--final-${type}`;
        card.innerHTML = `
            <div class="qw-card__row">
                <div class="qw-card__icon">${stats ? scoreEmoji(stats.best) : '❓'}</div>
                <div class="qw-card__title">${esc(meta.title)}</div>
                <div class="qw-card__badge qw-card__badge--${type}">${info.label}</div>
            </div>
            <div class="qw-card__desc">${esc(descText)} · ${pick} вопросов</div>
            <div class="qw-card__row">
                ${statsHtml}
                ${btnHtml}
            </div>`;

        if (isLoggedIn) {
            card.querySelector('button').addEventListener('click', () => openModal(meta.quizId));
        }
        return card;
    }

    // ── Модальное окно ────────────────────────────────────────────────────
    function openModal(quizId) {
        // Делегируем в quiz.js — он определяет window.openQuizModal как async function
        if (typeof window.openQuizModal === 'function') {
            window.openQuizModal(quizId);
        }
    }

    function closeModal() {
        if (typeof window.closeQuizModal === 'function') {
            window.closeQuizModal(null);
        }
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

    // ── Обновление после завершения теста ─────────────────────────────────
    // Перерисовываем все виджеты на странице чтобы показать новую статистику
    window.addEventListener('quizCompleted', async () => {
        // Сбрасываем кэш метаданных чтобы подтянуть свежую статистику
        Object.keys(_cache).forEach(k => delete _cache[k]);

        for (const el of document.querySelectorAll('.quiz-widget')) {
            el.innerHTML = '';
            await renderWidget(el);
        }
    });
})();
