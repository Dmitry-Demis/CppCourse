/**
 * core/callout.js
 *
 * 1. Апгрейдит legacy-блоки (info-card, warning-block, iso-quote, note-card)
 *    до новой системы .callout.callout--<type>
 * 2. Инициализирует IntersectionObserver для fade-in анимации
 * 3. Вставляет SVG-иконки по типу
 */
(function () {
    'use strict';

    /* ── SVG иконки ─────────────────────────────────────────────────────── */
    const ICONS = {
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="8" stroke-width="3"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
        </svg>`,

        warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="3"/>
        </svg>`,

        danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`,

        tip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6L15 17H9l-.7-2C6.3 13.7 5 11.5 5 9a7 7 0 017-7z"/>
            <line x1="9" y1="21" x2="15" y2="21"/>
            <line x1="9.5" y1="18" x2="14.5" y2="18"/>
        </svg>`,

        important: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>`,

        hot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2c0 6-6 8-6 13a6 6 0 0012 0c0-5-6-7-6-13z"/>
            <path d="M12 12c0 3-2 4-2 6a2 2 0 004 0c0-2-2-3-2-6z"/>
        </svg>`,

        note: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>`,

        quote: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v7c0 1.25.75 2 2 2h3c0 3-1 5-3 5v2z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 2v7c0 1.25.75 2 2 2h3c0 3-1 5-3 5v2z"/>
        </svg>`,
    };

    /* ── Маппинг legacy → новый тип ─────────────────────────────────────── */
    const LEGACY_MAP = [
        { selector: '.info-card',     type: 'info',    titleSel: '.info-card__title' },
        { selector: '.warning-block', type: 'warning', titleSel: '.warning-block__title' },
        { selector: '.note-card',     type: 'note',    titleSel: '.note-card__title' },
        { selector: '.iso-quote',     type: 'quote',   titleSel: '.iso-ref' },
    ];

    /* ── Апгрейд legacy-блока ────────────────────────────────────────────── */
    function upgradeLegacy(el, type, titleSel) {
        if (el.dataset.calloutUpgraded) return;
        el.dataset.calloutUpgraded = '1';

        el.classList.add('callout', `callout--${type}`);

        // Иконка
        const iconEl = document.createElement('span');
        iconEl.className = 'callout__icon';
        iconEl.innerHTML = ICONS[type] || ICONS.info;

        // Заголовок
        const titleEl = el.querySelector(titleSel);
        if (titleEl) titleEl.classList.add('callout__title');

        // Тело — всё кроме заголовка
        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'callout__body';
        const children = [...el.childNodes];
        children.forEach(child => {
            if (child !== titleEl) bodyWrapper.appendChild(child);
        });

        el.innerHTML = '';

        // Заголовочная строка: иконка + заголовок рядом
        if (titleEl) {
            const header = document.createElement('div');
            header.className = 'callout__header';
            header.appendChild(iconEl);
            header.appendChild(titleEl);
            el.appendChild(header);
        } else {
            el.appendChild(iconEl);
        }
        el.appendChild(bodyWrapper);
    }

    /* ── Инициализация нативных .callout ─────────────────────────────────── */
    function initNative(el) {
        if (el.dataset.calloutUpgraded) return;
        el.dataset.calloutUpgraded = '1';

        const type = [...el.classList]
            .find(c => c.startsWith('callout--') && c !== 'callout--visible')
            ?.replace('callout--', '') || 'info';

        const titleEl = el.querySelector('.callout__title');
        const bodyEl  = el.querySelector('.callout__body');

        // Вставляем иконку и оборачиваем заголовок в header
        if (!el.querySelector('.callout__header')) {
            const iconEl = document.createElement('span');
            iconEl.className = 'callout__icon';
            iconEl.innerHTML = ICONS[type] || ICONS.info;

            if (titleEl) {
                const header = document.createElement('div');
                header.className = 'callout__header';
                header.appendChild(iconEl);
                titleEl.parentNode.insertBefore(header, titleEl);
                header.appendChild(titleEl);
            } else {
                el.prepend(iconEl);
            }
        }
    }

    /* ── IntersectionObserver для fade-in ───────────────────────────────── */
    function setupObserver() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.callout').forEach(el => el.classList.add('callout--visible'));
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('callout--visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.callout').forEach(el => obs.observe(el));
    }

    /* ── Main ────────────────────────────────────────────────────────────── */
    function init() {
        // Апгрейд legacy
        LEGACY_MAP.forEach(({ selector, type, titleSel }) => {
            document.querySelectorAll(selector).forEach(el => upgradeLegacy(el, type, titleSel));
        });

        // Нативные callout
        document.querySelectorAll('.callout:not([data-callout-upgraded])').forEach(initNative);

        // Анимация
        setupObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
