// ============================================
// REVIEW BANNER — показывает параграфы к повтору
// Подключается из navigation.js на всех страницах теории
// ============================================

(function () {
    // Запускаем после DOMContentLoaded чтобы course.js точно загрузился
    function run() {
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (!user?.isuNumber) return;

        // Проверяем, не закрыл ли пользователь баннер сегодня
        const dismissKey = `review_banner_dismissed_${new Date().toISOString().slice(0, 10)}`;
        if (localStorage.getItem(dismissKey)) return;

        // Вычисляем корень сайта по navigation.js
        const navScript = document.querySelector('script[src*="navigation.js"]');
        const navSrc = navScript?.src || '';
        const m = navSrc.match(/^(.*\/)js\/navigation\.js/);
        const base = m ? m[1] : '/';

        fetch('/api/review/due', {
            headers: { 'X-Isu-Number': user.isuNumber }
        })
        .then(r => r.ok ? r.json() : null)
        .then(async dueItems => {
            if (!dueItems || dueItems.length === 0) return;

            // Загружаем структуру курса для названий параграфов
            let paraMap = {};
            try {
                if (typeof loadCourseStructure === 'function') {
                    const structure = await loadCourseStructure(base);
                    if (structure?.chapters) {
                        for (const ch of structure.chapters) {
                            for (const para of ch.paragraphs || []) {
                                paraMap[para.id] = {
                                    title: para.title,
                                    href: `${base}theory/${ch.id}/${ch.groupId}/${para.id}.html`
                                };
                            }
                        }
                    }
                }
            } catch { /* без названий */ }

            _renderReviewBanner(dueItems, paraMap, dismissKey);
        })
        .catch(() => {});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();

function _renderReviewBanner(items, paraMap, dismissKey) {
    // Не показываем дубль если уже есть
    if (document.getElementById('review-banner')) return;

    const count = items.length;
    const label = count === 1 ? 'параграф' : count < 5 ? 'параграфа' : 'параграфов';

    // Список параграфов (максимум 5 в баннере)
    const shown = items.slice(0, 5);
    const extra = items.length - shown.length;

    const listHtml = shown.map(item => {
        const info = paraMap[item.paragraphId];
        const name = info?.title || item.paragraphId;
        // wrongCount — сколько вопросов с ошибками ждут повтора
        const badge = item.wrongCount > 0
            ? `<span class="rb-score rb-score--wrong">✗${item.wrongCount}</span>`
            : `<span class="rb-score">↻${item.totalDueCount}</span>`;
        if (info?.href) {
            return `<a class="rb-para-link" href="${info.href}">${name}${badge}</a>`;
        }
        return `<span class="rb-para-link">${name}${badge}</span>`;
    }).join('');

    const extraHtml = extra > 0
        ? `<span class="rb-extra">и ещё ${extra}...</span>`
        : '';

    const banner = document.createElement('div');
    banner.id = 'review-banner';
    banner.className = 'review-banner';
    banner.innerHTML = `
        <div class="rb-icon">🔔</div>
        <div class="rb-body">
            <div class="rb-title">Надо повторить ${count} ${label}</div>
            <div class="rb-list">${listHtml}${extraHtml}</div>
        </div>
        <button class="rb-accept" id="rb-accept-btn">Принять</button>
        <button class="rb-close" id="rb-close-btn" aria-label="Закрыть">✕</button>`;

    // Вставляем перед основным контентом (после header)
    const header = document.querySelector('header, .site-header, .top-bar');
    if (header?.nextSibling) {
        header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
        document.body.prepend(banner);
    }

    // Анимация появления
    requestAnimationFrame(() => banner.classList.add('rb-visible'));

    document.getElementById('rb-accept-btn').addEventListener('click', () => {
        localStorage.setItem(dismissKey, '1');
        _closeReviewBanner(banner);
    });

    document.getElementById('rb-close-btn').addEventListener('click', () => {
        _closeReviewBanner(banner);
    });
}

function _closeReviewBanner(banner) {
    banner.classList.remove('rb-visible');
    banner.classList.add('rb-hiding');
    setTimeout(() => banner.remove(), 350);
}
