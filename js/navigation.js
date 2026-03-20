// ============================================
// NAVIGATION SYSTEM v3 — C++ Course
// • Мобильное меню
// • Динамический левый сайдбар из course-structure.json
// • Динамическая prev/next навигация секций
// • Динамическая prev/next навигация параграфов
// • Индикаторы прогресса и блокировки параграфов
// ============================================

// Вычисляем корень сайта по URL самого скрипта — работает и с file://, и с http://
// document.currentScript доступен синхронно при разборе скрипта
const _siteRoot = (() => {
    const src = (document.currentScript || {}).src || '';
    const m = src.match(/^(.*\/)js\/navigation\.js/);
    return m ? m[1] : './';
})();

// ── Highlight.js — подключается один раз отсюда, не нужен в каждом HTML ──
(function () {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    s.onload = () => {
        // Скрипты в конце <body>: DOM уже разобран, но DOMContentLoaded ещё не сработал
        if (document.readyState !== 'loading') {
            hljs.highlightAll();
        } else {
            document.addEventListener('DOMContentLoaded', () => hljs.highlightAll());
        }
    };
    document.head.appendChild(s);
}());

document.addEventListener('DOMContentLoaded', async () => {
    initMobileMenu();
    initReadingProgress();
    initCopyCode();
    initHeaderUser();

    // Mark paragraph as read when page is opened
    const pathParts = normalizePath(window.location.pathname).split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart.endsWith('.html') && lastPart !== 'index.html') {
        const paraId = lastPart.replace('.html', '');
        localStorage.setItem(`para_read_${paraId}`, '1');
    }

    // Загружаем structure один раз — используем везде
    const structure = await _loadStructure();
    if (!structure) return;

    buildCourseNav(structure);
    buildSectionNav(structure);
    buildParagraphNav(structure);
});

// ------------------------------------------
// ЗАГРУЗКА course-structure (кэш)
// course.js подключён раньше и содержит loadCourseStructure(base)
// ------------------------------------------
let _structureCache = null;

async function _loadStructure() {
    if (_structureCache) return _structureCache;
    _structureCache = await loadCourseStructure(_siteRoot);
    return _structureCache;
}

// ------------------------------------------
// ЛЕВЫЙ САЙДБАР (все главы и параграфы)
// ------------------------------------------
function buildCourseNav(structure) {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    const currentPath = normalizePath(window.location.pathname);
    nav.innerHTML = '';

    const titleEl = document.querySelector('.sidebar-title');
    if (titleEl) titleEl.textContent = 'Содержание курса';

    structure.chapters.forEach(chapter => {
        const chapterEl = document.createElement('li');
        chapterEl.className = 'sidebar-chapter';

        // Check if any paragraph in this chapter is active
        const isChapterActive = chapter.paragraphs.some(p =>
            currentPath.includes(`/${chapter.id}/${chapter.groupId}/`)
        );

        const chapterTitle = document.createElement('div');
        chapterTitle.className = 'sidebar-chapter-title' + (isChapterActive ? ' open' : '');

        // Click on label → go to chapter index.html
        const labelEl = document.createElement('span');
        labelEl.className = 'sidebar-chapter-label';
        labelEl.textContent = `Глава ${chapter.number}. ${chapter.title}`;
        labelEl.style.cursor = 'pointer';
        labelEl.addEventListener('click', (e) => {
            e.stopPropagation();
            location.href = _siteRoot + `theory/${chapter.id}/${chapter.groupId}/index.html`;
        });

        const arrowEl = document.createElement('span');
        arrowEl.className = 'sidebar-chapter-arrow';
        arrowEl.textContent = isChapterActive ? '▾' : '▸';
        arrowEl.style.cursor = 'pointer';

        chapterTitle.appendChild(labelEl);
        chapterTitle.appendChild(arrowEl);
        chapterEl.appendChild(chapterTitle);

        const ul = document.createElement('ul');
        ul.className = 'sidebar-paragraphs' + (isChapterActive ? ' open' : '');

        // Click anywhere on chapterTitle toggles the list
        const doToggle = () => {
            const open = ul.classList.toggle('open');
            chapterTitle.classList.toggle('open', open);
            arrowEl.textContent = open ? '▾' : '▸';
        };
        chapterTitle.addEventListener('click', doToggle);
        // Label click navigates AND toggles
        labelEl.addEventListener('click', (e) => {
            e.stopPropagation();
            doToggle();
            location.href = _siteRoot + `theory/${chapter.id}/${chapter.groupId}/index.html`;
        });

        chapter.paragraphs.forEach((para, idx) => {
            const href = _siteRoot + `theory/${chapter.id}/${chapter.groupId}/${para.id}.html`;
            const isActive = currentPath.endsWith(`/${chapter.groupId}/${para.id}.html`);
            const testCount = (para.tests || []).length;

            let testBadge = '';
            if (testCount > 0) {
                const best = (() => { try { const v = localStorage.getItem(`quiz_best_${para.id}`); return v !== null ? JSON.parse(v) : null; } catch { return null; } })();
                const pctLabel = best !== null ? `<span class="sidebar-section-pct ${best >= 70 ? 'pass' : 'fail'}">${best}%</span>` : '';
                testBadge = `<span class="sidebar-section-test" title="Есть тест">✎</span>${pctLabel}`;
            }

            const sli = document.createElement('li');
            sli.className = 'sidebar-section-item';
            sli.innerHTML = `<a class="sidebar-section-link${isActive ? ' active' : ''}" href="${href}">
                <span class="sidebar-section-number">§${chapter.number}.${idx + 1}</span>
                <span class="sidebar-section-title">${para.title}</span>
                ${testBadge}
            </a>`;
            ul.appendChild(sli);
        });

        chapterEl.appendChild(ul);
        nav.appendChild(chapterEl);
    });
}

// ------------------------------------------
// PREV/NEXT НАВИГАЦИЯ ДЛЯ ПАРАГРАФОВ
// ------------------------------------------
function buildSectionNav(structure) {
    // handled by buildParagraphNav now
}

function buildParagraphNav(structure) {
    const container = document.querySelector('.paragraph-nav');
    if (!container) return;

    const currentPath = normalizePath(window.location.pathname);

    // Flat list of all paragraphs across all chapters
    const allParas = structure.chapters.flatMap(ch =>
        ch.paragraphs.map(p => ({
            ...p,
            chapterId: ch.id,
            groupId: ch.groupId,
            chapterNum: ch.number,
            href: `theory/${ch.id}/${ch.groupId}/${p.id}.html`
        }))
    );

    const currentIdx = allParas.findIndex(p => currentPath.endsWith(`/${p.groupId}/${p.id}.html`));
    if (currentIdx === -1) return;

    const prev = currentIdx > 0 ? allParas[currentIdx - 1] : null;
    const next = currentIdx < allParas.length - 1 ? allParas[currentIdx + 1] : null;

    const prevHtml = prev
        ? `<a href="${_siteRoot + prev.href}" class="nav-prev">
               <span class="nav-dir">← Назад</span>
               <span class="nav-name">§${prev.chapterNum}.${allParas.slice(0, currentIdx).filter(p => p.chapterId === prev.chapterId).length} ${prev.title}</span>
           </a>`
        : `<a href="${_siteRoot}index.html" class="nav-prev">
               <span class="nav-dir">← Назад</span>
               <span class="nav-name">Главная</span>
           </a>`;

    const nextHtml = next
        ? `<a href="${_siteRoot + next.href}" class="nav-next">
               <span class="nav-dir">Далее →</span>
               <span class="nav-name">${next.title}</span>
           </a>`
        : '';

    container.innerHTML = prevHtml + nextHtml;
}

// ------------------------------------------
// МОБИЛЬНОЕ МЕНЮ
// ------------------------------------------
function initMobileMenu() {
    const btn     = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const headerNav = document.querySelector('.header-nav');

    if (!btn) return;

    // Landing page: no sidebar — toggle header-nav instead
    if (!sidebar) {
        if (!headerNav) return;
        btn.addEventListener('click', () => {
            const open = headerNav.classList.toggle('mobile-open');
            btn.setAttribute('aria-expanded', open);
        });
        document.addEventListener('click', (e) => {
            if (!headerNav.contains(e.target) && !btn.contains(e.target)) {
                headerNav.classList.remove('mobile-open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
        return;
    }

    btn.addEventListener('click', () => {
        const open = sidebar.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
            sidebar.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ------------------------------------------
// ПРОГРЕСС-БАР ЧТЕНИЯ
// ------------------------------------------
function initReadingProgress() {
    const bar = document.querySelector('.reading-progress-bar');
    if (!bar) return;

    const update = () => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = docH > 0 ? `${Math.min(window.scrollY / docH * 100, 100)}%` : '0%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}

// ------------------------------------------
// КНОПКИ «КОПИРОВАТЬ КОД»
// ------------------------------------------
function initCopyCode() {
    document.querySelectorAll('.btn-code').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.closest('.code-block')?.querySelector('code')?.textContent || '';
            navigator.clipboard.writeText(code).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Скопировано ✓';
                btn.classList.add('copied');
                setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
            });
        });
    });
}

// ------------------------------------------
// ВСПОМОГАТЕЛЬНЫЕ
// ------------------------------------------
function isParagraphUnlocked(paragraphs, idx) {
    if (idx === 0) return true;
    const prev = paragraphs[idx - 1];
    if (!prev.finalTest) return true;
    return !!localStorage.getItem(`final_passed_${prev.id}`);
}

function isParagraphDone(paraId) {
    return !!localStorage.getItem(`final_passed_${paraId}`);
}

function getQuizProgress(paraId) {
    const data = localStorage.getItem(`quiz_final_${paraId}`);
    if (!data) return null;
    try { return JSON.parse(data).best; } catch { return null; }
}

function showLockedNotice() {
    let toast = document.querySelector('.nav-locked-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'nav-locked-toast';
        toast.textContent = '🔒 Пройдите итоговый тест предыдущего параграфа';
        document.body.appendChild(toast);
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function normalizePath(path) {
    return path.replace(/^\//, '').replace(/\\/g, '/');
}

function isCurrentPage(currentPath, ...files) {
    return files.some(f => f && currentPath.endsWith(f));
}

// Строит абсолютный URL от корня сайта — работает для любой глубины и любого протокола
function resolveHref(_currentPath, targetFile) {
    return _siteRoot + targetFile;
}

// Глобальный copyCode для inline onclick
window.copyCode = function(btn) {
    const code = btn.closest('.code-block')?.querySelector('code')?.textContent || '';
    navigator.clipboard.writeText(code).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Скопировано ✓';
        setTimeout(() => btn.textContent = orig, 2000);
    });
};

// ------------------------------------------
// HEADER USER INFO (streak + profile link)
// ------------------------------------------
function initHeaderUser() {
    const nav = document.querySelector('.header-nav');
    if (!nav) return;

    const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
    if (!user) return;

    // Remove existing profile link if any
    nav.querySelectorAll('.header-profile-link').forEach(el => el.remove());

    const streak = user.currentStreak ?? 0;
    const a = document.createElement('a');
    a.href = _siteRoot + 'profile.html';
    a.className = 'header-profile-link';
    a.innerHTML = streak > 0
        ? `<span class="header-streak">🔥${streak}</span> ${user.firstName}`
        : user.firstName;
    a.style.cssText = 'display:inline-flex;align-items:center;gap:6px;';
    nav.appendChild(a);
}

// Style for streak badge (injected once)
(function() {
    const style = document.createElement('style');
    style.textContent = `.header-streak{background:rgba(250,179,135,.15);color:#fab387;border-radius:99px;padding:2px 8px;font-size:.8rem;font-weight:700;}`;
    document.head.appendChild(style);
}());
