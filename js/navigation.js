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

    // Загружаем structure один раз — используем везде
    const structure = await loadCourseStructure();
    if (!structure) return;

    buildCourseNav(structure);
    buildSectionNav(structure);
    buildParagraphNav(structure);
});

// ------------------------------------------
// ЗАГРУЗКА course-structure.json (кэш)
// ------------------------------------------
let _structureCache = null;

async function loadCourseStructure() {
    if (_structureCache) return _structureCache;

    try {
        const res = await fetch('/api/course-structure');
        _structureCache = await res.json();
        return _structureCache;
    } catch (err) {
        console.error('Navigation: failed to load course-structure', err);
        return null;
    }
}

// ------------------------------------------
// ЛЕВЫЙ САЙДБАР (все главы и секции)
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

        // Determine if any page in this chapter is active
        const allChapterFiles = chapter.paragraphs.flatMap(p =>
            [p.file, p.legacyFile, ...(p.sections || []).map(s => s.file)].filter(Boolean)
        );
        const isChapterActive = allChapterFiles.some(f => isCurrentPage(currentPath, f));
        const isChapterOpen = isChapterActive; // collapsed by default unless active

        // Заголовок главы — стрелка сворачивает, текст переходит на страницу главы
        const chapterTitle = document.createElement('div');
        chapterTitle.className = 'sidebar-chapter-title' + (isChapterOpen ? ' open' : '');

        // Find chapter index file (first paragraph's index.html)
        const firstPara = chapter.paragraphs[0];
        const chapterIndexFile = firstPara?.file || null;

        const labelEl = document.createElement('span');
        labelEl.className = 'sidebar-chapter-label';
        labelEl.textContent = `Глава ${chapter.number}. ${chapter.title}`;
        if (chapterIndexFile) {
            labelEl.style.cursor = 'pointer';
            labelEl.addEventListener('click', (e) => {
                e.stopPropagation();
                location.href = resolveHref(currentPath, chapterIndexFile);
            });
        }

        const arrowEl = document.createElement('span');
        arrowEl.className = 'sidebar-chapter-arrow';
        arrowEl.textContent = isChapterOpen ? '▾' : '▸';
        arrowEl.style.cursor = 'pointer';

        chapterTitle.appendChild(labelEl);
        chapterTitle.appendChild(arrowEl);
        chapterTitle.style.cursor = 'default';
        chapterEl.appendChild(chapterTitle);

        const ul = document.createElement('ul');
        ul.className = 'sidebar-paragraphs' + (isChapterOpen ? ' open' : '');

        arrowEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = ul.classList.toggle('open');
            chapterTitle.classList.toggle('open', open);
            arrowEl.textContent = open ? '▾' : '▸';
        });

        let sectionCounter = 0; // global counter across all paragraphs in chapter

        chapter.paragraphs.forEach((para, idx) => {
            const isUnlocked = isParagraphUnlocked(chapter.paragraphs, idx);
            const sections   = para.sections || [];
            const chapterNum = chapter.number;

            sections.forEach((section, sIdx) => {
                sectionCounter++;
                const isSectionActive = section.file && isCurrentPage(currentPath, section.file);
                const sli = document.createElement('li');
                sli.className = 'sidebar-section-item';

                const sa = document.createElement('a');
                sa.className = 'sidebar-section-link' + (isSectionActive ? ' active' : '');

                if (!isUnlocked) {
                    sa.href = '#';
                    sa.className += ' locked';
                    sa.title = 'Пройдите итоговый тест предыдущего параграфа';
                    sa.addEventListener('click', e => { e.preventDefault(); showLockedNotice(); });
                } else {
                    sa.href = section.file ? resolveHref(currentPath, section.file) : '#';
                }

                const sNum = `§${chapterNum}.${sectionCounter}`;
                let testBadge = '';
                if (section.hasTest && section.quizId) {
                    const best = (() => { try { const v = localStorage.getItem(`quiz_best_${section.quizId}`); return v !== null ? JSON.parse(v) : null; } catch { return null; } })();
                    const pctLabel = best !== null ? `<span class="sidebar-section-pct ${best >= 70 ? 'pass' : 'fail'}">${best}%</span>` : '';
                    testBadge = `<span class="sidebar-section-test" title="Есть тест">✎</span>${pctLabel}`;
                }
                sa.innerHTML = `
                    <span class="sidebar-section-number">${sNum}</span>
                    <span class="sidebar-section-title">${section.title}</span>
                    ${testBadge}`;

                sli.appendChild(sa);
                ul.appendChild(sli);
            });
        });

        chapterEl.appendChild(ul);
        nav.appendChild(chapterEl);
    });
}

// ------------------------------------------
// PREV/NEXT НАВИГАЦИЯ ДЛЯ СЕКЦИЙ
// Заполняет .paragraph-nav на страницах секций
// ------------------------------------------
function buildSectionNav(structure) {
    const container = document.querySelector('.paragraph-nav');
    if (!container) return;

    const currentPath = normalizePath(window.location.pathname);

    // Строим плоский список всех секций всех параграфов всех глав
    const allSections = [];
    for (const chapter of structure.chapters) {
        let sectionCounter = 0;
        for (const para of chapter.paragraphs) {
            (para.sections || []).forEach((section) => {
                sectionCounter++;
                allSections.push({
                    ...section,
                    sectionNum : `§${chapter.number}.${sectionCounter}`,
                    chapterNum : chapter.number,
                    paraFile   : para.file,
                    paraTitle  : para.title
                });
            });
        }
    }

    const currentIdx = allSections.findIndex(s => s.file && isCurrentPage(currentPath, s.file));
    if (currentIdx === -1) return; // Не секция — выходим, buildParagraphNav обработает

    const prev    = currentIdx > 0                    ? allSections[currentIdx - 1] : null;
    const next    = currentIdx < allSections.length - 1 ? allSections[currentIdx + 1] : null;
    const current = allSections[currentIdx];

    // Для первой секции назад — страница обзора параграфа
    const prevHtml = prev
        ? `<a href="${resolveHref(currentPath, prev.file)}" class="nav-prev">
               <span class="nav-dir">← Назад</span>
               <span class="nav-name">${prev.sectionNum} ${prev.title}</span>
           </a>`
        : current.paraFile
            ? `<a href="${resolveHref(currentPath, current.paraFile)}" class="nav-prev">
                   <span class="nav-dir">← Назад</span>
                   <span class="nav-name">§${current.chapterNum}.${current.paraNum} Обзор параграфа</span>
               </a>`
            : '';

    // Для последней секции вперёд — страница обзора параграфа
    const nextHtml = next
        ? `<a href="${resolveHref(currentPath, next.file)}" class="nav-next">
               <span class="nav-dir">Далее →</span>
               <span class="nav-name">${next.sectionNum} ${next.title}</span>
           </a>`
        : current.paraFile
            ? `<a href="${resolveHref(currentPath, current.paraFile)}" class="nav-next">
                   <span class="nav-dir">↑ К параграфу</span>
                   <span class="nav-name">§${current.chapterNum}.${current.paraNum} ${current.paraTitle}</span>
               </a>`
            : '';

    container.innerHTML = prevHtml + nextHtml;
}

// ------------------------------------------
// PREV/NEXT НАВИГАЦИЯ ДЛЯ ПАРАГРАФОВ
// Заполняет .paragraph-nav на страницах параграфов
// ------------------------------------------
function buildParagraphNav(structure) {
    const container = document.querySelector('.paragraph-nav');
    if (!container) return;

    // Если контейнер уже заполнен buildSectionNav — не трогаем
    if (container.innerHTML.trim() !== '') return;

    const currentPath = normalizePath(window.location.pathname);
    const allParas    = structure.chapters.flatMap(ch => ch.paragraphs);
    const currentIdx  = allParas.findIndex(p => isCurrentPage(currentPath, p.file, p.legacyFile));

    if (currentIdx === -1) return;

    const currentPara = allParas[currentIdx];
    const prev        = currentIdx > 0                  ? allParas[currentIdx - 1] : null;
    const next        = currentIdx < allParas.length - 1 ? allParas[currentIdx + 1] : null;
    const firstSection = (currentPara.sections || [])[0] || null;

    const prevHtml = prev
        ? `<a href="${resolveHref(currentPath, prev.file)}" class="nav-prev">
               <span class="nav-dir">← Назад</span>
               <span class="nav-name">§${prev.number || ''} ${prev.title}</span>
           </a>`
        : `<a href="${resolveHref(currentPath, 'index.html')}" class="nav-prev">
               <span class="nav-dir">← Назад</span>
               <span class="nav-name">Главная</span>
           </a>`;

    const nextHtml = next
        ? `<a href="${resolveHref(currentPath, next.file)}" class="nav-next ${isParagraphUnlocked(allParas, currentIdx + 1) ? '' : 'locked'}">
               <span class="nav-dir">Далее →</span>
               <span class="nav-name">§${next.number || ''} ${next.title}</span>
           </a>`
        : firstSection
            ? `<a href="${resolveHref(currentPath, firstSection.file)}" class="nav-next">
               <span class="nav-dir">Начать →</span>
               <span class="nav-name">${firstSection.number} ${firstSection.title}</span>
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
