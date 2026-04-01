// ============================================
// PARAGRAPH LOCK SYSTEM
// Блокирует доступ к параграфам, пока не пройдены
// тесты предыдущего параграфа на ≥70%.
// Подключается из navigation.js на всех страницах теории.
// ============================================

(function () {
    'use strict';

    // Кэш разблокированных параграфов — сбрасывается при событии 'quizCompleted'
    let _unlockedCache = null;
    let _isAdmin = false;

    // Событие: тест завершён → сбросить кэш и перерисовать навигацию
    window.addEventListener('quizCompleted', () => {
        _unlockedCache = null;
        _loadAndApply();
    });

    async function _fetchUnlocked() {
        if (_unlockedCache !== null) return { unlocked: _unlockedCache, isAdmin: _isAdmin };

        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (!user?.isuNumber) return { unlocked: [], isAdmin: false };

        try {
            const headers = { 'X-Isu-Number': user.isuNumber };
            if (user.isAdmin) headers['X-Is-Admin'] = '1';

            const res = await fetch(`/api/progress/${user.isuNumber}/unlocked-paragraphs`, { headers });
            if (!res.ok) return { unlocked: [], isAdmin: false };
            const data = await res.json();
            _unlockedCache = data.unlocked || [];
            _isAdmin = user.isAdmin || data.isAdmin || false;
            return { unlocked: _unlockedCache, isAdmin: _isAdmin };
        } catch {
            return { unlocked: [], isAdmin: false };
        }
    }

    // Проверяет, открыт ли текущий параграф. Если нет — редирект на locked.html
    async function checkCurrentPage() {
        // Только на страницах теории
        const path = location.pathname;
        if (!path.includes('/theory/')) return;

        // Извлекаем paragraphId из URL
        const parts = path.replace(/\/$/, '').split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1] || '';
        if (!lastPart.endsWith('.html') || lastPart === 'index.html') return;

        const paragraphId = lastPart.replace('.html', '');

        // Загружаем структуру курса
        const navScript = document.querySelector('script[src*="navigation.js"]');
        const navSrc = navScript?.src || '';
        const m = navSrc.match(/^(.*\/)js\/navigation\.js/);
        const base = m ? m[1] : '/';

        let structure;
        try {
            structure = await loadCourseStructure(base);
        } catch { return; }

        // Находим позицию текущего параграфа в плоском списке
        const allParas = structure.chapters.flatMap(ch =>
            (ch.paragraphs || []).map(p => p.id)
        );

        const idx = allParas.indexOf(paragraphId);
        if (idx <= 0) return; // первый параграф всегда открыт

        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');

        // Незалогиненный пользователь — всё кроме первого параграфа заблокировано
        if (!user?.isuNumber) {
            location.replace(`${base}locked.html?para=${encodeURIComponent(paragraphId)}&prev=${encodeURIComponent(allParas[idx - 1])}`);
            return;
        }

        const { unlocked, isAdmin } = await _fetchUnlocked();
        if (isAdmin) return; // admin видит всё

        // Параграф открыт если предыдущий пройден
        const prevId = allParas[idx - 1];
        if (!unlocked.includes(prevId)) {
            location.replace(`${base}locked.html?para=${encodeURIComponent(paragraphId)}&prev=${encodeURIComponent(prevId)}`);
        }
    }

    // Применяет замки к ссылкам в навигации
    async function applyLocksToNav(structure) {
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        const allParas = structure.chapters.flatMap(ch =>
            (ch.paragraphs || []).map(p => p.id)
        );

        let unlockedSet = new Set();
        let isAdmin = false;

        if (user?.isuNumber) {
            const data = await _fetchUnlocked();
            isAdmin = data.isAdmin;
            unlockedSet = new Set(data.unlocked);
        }
        // Незалогиненный: unlockedSet остаётся пустым — всё кроме первого заблокировано

        if (isAdmin) return;

        document.querySelectorAll('.sidebar-section-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            const parts = href.replace(/\/$/, '').split('/').filter(Boolean);
            const last = parts[parts.length - 1]?.replace('.html', '');
            if (!last) return;

            const idx = allParas.indexOf(last);
            if (idx <= 0) return; // первый всегда открыт

            const prevId = allParas[idx - 1];
            const isLocked = !unlockedSet.has(prevId);

            if (isLocked) {
                link.classList.add('para-locked');
                link.setAttribute('title', 'Пройдите тесты предыдущего параграфа на ≥70%');
                link.addEventListener('click', e => {
                    e.preventDefault();
                    _showLockedToast();
                }, { once: false });
            }
        });
    }

    function _showLockedToast() {
        let t = document.getElementById('lock-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'lock-toast';
            t.className = 'lock-toast';
            t.textContent = '🔒 Пройдите тесты предыдущего параграфа на ≥70%';
            document.body.appendChild(t);
        }
        t.classList.add('show');
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('show'), 3000);
    }

    async function _loadAndApply() {
        const navScript = document.querySelector('script[src*="navigation.js"]');
        const navSrc = navScript?.src || '';
        const m = navSrc.match(/^(.*\/)js\/navigation\.js/);
        const base = m ? m[1] : '/';

        let structure;
        try { structure = await loadCourseStructure(base); } catch { return; }

        await applyLocksToNav(structure);
    }

    // Применяет замки к карточкам параграфов на chapter index страницах
    async function applyLocksToChapterIndex(structure) {
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        const allParas = structure.chapters.flatMap(ch =>
            (ch.paragraphs || []).map(p => p.id)
        );

        let unlockedSet = new Set();
        let isAdmin = false;

        if (user?.isuNumber) {
            const data = await _fetchUnlocked();
            isAdmin = data.isAdmin;
            unlockedSet = new Set(data.unlocked);
        }

        if (isAdmin) return;

        document.querySelectorAll('.section-card').forEach(card => {
            const href = card.getAttribute('href') || '';
            const paraId = href.replace(/\.html$/, '').split('/').pop();
            if (!paraId) return;

            const idx = allParas.indexOf(paraId);
            if (idx <= 0) return; // первый всегда открыт

            const isGuest = !user?.isuNumber;
            const prevId = allParas[idx - 1];
            const isLocked = isGuest || !unlockedSet.has(prevId);
            if (!isLocked) return;

            card.classList.add('para-locked');
            card.setAttribute('title', isGuest
                ? 'Войдите в аккаунт, чтобы открывать параграфы'
                : 'Пройдите тесты предыдущего параграфа на ≥70%');
            card.addEventListener('click', e => {
                e.preventDefault();
                let t = document.getElementById('lock-toast');
                if (!t) {
                    t = document.createElement('div');
                    t.id = 'lock-toast';
                    t.className = 'lock-toast';
                    document.body.appendChild(t);
                }
                t.textContent = isGuest
                    ? '🔒 Войдите в аккаунт, чтобы открывать параграфы'
                    : '🔒 Пройдите тесты предыдущего параграфа на ≥70%';
                t.classList.add('show');
                clearTimeout(t._timer);
                t._timer = setTimeout(() => t.classList.remove('show'), 3000);
            }, { once: false });
        });
    }

    // Экспортируем для вызова из navigation.js после buildCourseNav
    window.ParagraphLock = {
        checkCurrentPage,
        applyLocksToNav,
        applyLocksToChapterIndex,
        invalidateCache: () => { _unlockedCache = null; }
    };

    // Запускаем проверку текущей страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkCurrentPage);
    } else {
        checkCurrentPage();
    }
})();
