/**
 * feedback.js — секция «Оцените страницу»
 * GET /api/feedback/{pageId}  → { count, average, myRating }
 * POST /api/feedback          → { pageId, rating, comment }
 */
(function () {
    'use strict';

    const API = '/api/feedback';

    const PAGE_ID = location.pathname
        .split('/')
        .pop()
        .replace(/\.html?$/, '');

    function getIsu() {
        try {
            return JSON.parse(localStorage.getItem('cpp_user') || 'null')?.isuNumber ?? null;
        } catch { return null; }
    }

    function headers() {
        const h = { 'Content-Type': 'application/json' };
        const isu = getIsu();
        if (isu) h['X-Isu-Number'] = isu;
        return h;
    }

    // Цвет числа по рейтингу
    function applyRatingColor(el, val) {
        if (!val) {
            el.textContent = '—';
            el.removeAttribute('data-rating');
        } else {
            el.textContent = Number.isInteger(val) ? val : val.toFixed(1);
            el.setAttribute('data-rating', Math.round(val));
        }
    }

    function setStars(stars, count) {
        stars.forEach((s, i) => {
            s.classList.toggle('selected', i < count);
            s.classList.remove('hovered');
        });
    }

    function init() {
        let section = document.querySelector('.feedback-section');
        if (!section) return;

        // Если секция пустая — рендерим разметку
        if (!section.querySelector('.feedback-star')) {
            section.innerHTML = `
                <div class="feedback-section__title">Оцените этот параграф</div>
                <div class="feedback-section__subtitle">Нажмите на звезду, чтобы оставить оценку</div>
                <div class="feedback-stars-row">
                    <div class="feedback-stars">
                        ${[1,2,3,4,5,6,7,8,9,10].map(n =>
                            `<span class="feedback-star" aria-label="Оценка ${n}"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>`
                        ).join('')}
                    </div>
                    <span class="feedback-rating-value">—</span>
                </div>
                <div class="feedback-form">
                    <textarea class="feedback-form__textarea" maxlength="1024" placeholder="Комментарий (необязательно)…"></textarea>
                    <div class="feedback-form__row">
                        <span class="feedback-form__char">0 / 1024</span>
                        <button class="feedback-form__submit">Отправить</button>
                    </div>
                </div>
                <div class="feedback-done">
                    <span class="feedback-done__icon">✓</span>
                    <span>Спасибо за отзыв!</span>
                </div>`;
        }

        const stars     = [...section.querySelectorAll('.feedback-star')];
        const ratingVal = section.querySelector('.feedback-rating-value');
        const form      = section.querySelector('.feedback-form');
        const textarea  = section.querySelector('.feedback-form__textarea');
        const charEl    = section.querySelector('.feedback-form__char');
        const submitBtn = section.querySelector('.feedback-form__submit');
        const doneEl    = section.querySelector('.feedback-done');

        let selectedRating = 0;
        let alreadyVoted   = false;

        // ── Загрузка состояния при открытии страницы ──────────────────────
        (async () => {
            try {
                const res = await fetch(`${API}/${PAGE_ID}`, {
                    headers: { 'X-Isu-Number': getIsu() ?? '' }
                });
                if (!res.ok) return;
                const data = await res.json();

                // Общий рейтинг справа
                applyRatingColor(ratingVal, data.average);

                // Если пользователь уже голосовал — показываем его оценку и блокируем
                if (data.myRating) {
                    selectedRating = data.myRating;
                    alreadyVoted   = true;
                    setStars(stars, selectedRating);
                    stars.forEach(s => s.style.pointerEvents = 'none');
                    doneEl.classList.add('visible');
                }
            } catch { /* сервер недоступен — ничего не показываем */ }
        })();

        // ── Звёзды ────────────────────────────────────────────────────────
        stars.forEach((star, idx) => {
            star.addEventListener('mouseenter', () => {
                if (alreadyVoted) return;
                stars.forEach((s, i) => {
                    s.classList.toggle('hovered', i <= idx);
                    s.classList.remove('selected');
                });
                applyRatingColor(ratingVal, idx + 1);
            });

            star.addEventListener('mouseleave', () => {
                if (alreadyVoted) return;
                stars.forEach((s, i) => {
                    s.classList.remove('hovered');
                    s.classList.toggle('selected', i < selectedRating);
                });
                applyRatingColor(ratingVal, selectedRating || null);
            });

            star.addEventListener('click', () => {
                if (alreadyVoted) return;
                selectedRating = idx + 1;
                setStars(stars, selectedRating);
                applyRatingColor(ratingVal, selectedRating);
                form.classList.add('visible');
                textarea.focus();
            });
        });

        // ── Счётчик символов ──────────────────────────────────────────────
        textarea.addEventListener('input', () => {
            if (textarea.value.length > 1024) textarea.value = textarea.value.slice(0, 1024);
            charEl.textContent = `${textarea.value.length} / 1024`;
        });

        // ── Отправка ──────────────────────────────────────────────────────
        submitBtn.addEventListener('click', async () => {
            if (!selectedRating || alreadyVoted) return;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка…';

            try {
                const res = await fetch(API, {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify({
                        pageId:  PAGE_ID,
                        rating:  selectedRating,
                        comment: textarea.value.trim() || null,
                    }),
                });

                if (res.ok) {
                    alreadyVoted = true;
                    form.classList.remove('visible');
                    stars.forEach(s => s.style.pointerEvents = 'none');
                    doneEl.classList.add('visible');
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить';
                    alert('Ошибка при отправке. Попробуйте позже.');
                }
            } catch {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Отправить';
                alert('Нет соединения с сервером.');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
