// ============================================
// NAVIGATION SYSTEM v2 — C++ Course
// • Мобильное меню
// • Динамическая боковая панель из course-structure.json
// • Индикаторы прогресса и блокировки параграфов
// • Кнопки «Предыдущий / Следующий параграф»
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initCourseNav();
    initParagraphNav();
    initReadingProgress();
    initCopyCode();
});

// ------------------------------------------
// МОБИЛЬНОЕ МЕНЮ
// ------------------------------------------
function initMobileMenu() {
    const btn     = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    if (!btn || !sidebar) return;

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
// ДИНАМИЧЕСКАЯ НАВИГАЦИЯ ИЗ course-structure.json
// ------------------------------------------
async function initCourseNav() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    // Определяем текущий файл относительно корня
    const currentPath = normalizePath(window.location.pathname);

    let structure;
    try {
        // Вычисляем путь к JSON относительно текущего файла
        const depth = (currentPath.match(/\//g) || []).length;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        const res = await fetch(`${prefix}course-structure.json`);
        structure  = await res.json();
    } catch {
        return; // Не можем загрузить — оставляем статический HTML
    }

    const { chapters } = structure;
    nav.innerHTML = '';

    chapters.forEach(chapter => {
        const chapterEl = document.createElement('li');
        chapterEl.className = 'sidebar-chapter';
        chapterEl.innerHTML = `<span class="sidebar-chapter-title">Глава ${chapter.number}. ${chapter.title}</span>`;

        const ul = document.createElement('ul');
        ul.className = 'sidebar-paragraphs';

        chapter.paragraphs.forEach((para, idx) => {
            const isUnlocked = isParagraphUnlocked(chapter.paragraphs, idx);
            const isParaActive = isCurrentPage(currentPath, para.file, para.legacyFile);

            // Проверяем, активна ли одна из секций этого параграфа
            const sections = para.sections || [];
            const activeSectionIdx = sections.findIndex(s => s.file && isCurrentPage(currentPath, s.file));
            const isExpanded = isParaActive || activeSectionIdx !== -1;

            const isDone = isParagraphDone(para.id);

            const li = document.createElement('li');
            li.className = 'sidebar-para-item' + (isExpanded ? ' expanded' : '');

            // Ссылка на параграф
            const a = document.createElement('a');
            a.className = 'sidebar-para-link' +
                (isParaActive   ? ' active'   : '') +
                (isDone         ? ' done'     : '') +
                (!isUnlocked    ? ' locked'   : '');

            if (isUnlocked) {
                a.href = resolveHref(currentPath, para.file);
            } else {
                a.href = '#';
                a.title = 'Пройдите итоговый тест предыдущего параграфа';
            }

            const progress = getQuizProgress(para.id);
            const chapterNum = chapter.number;

            a.innerHTML = `
                <span class="sidebar-para-number">§${chapterNum}.${para.number}</span>
                <span class="sidebar-para-title">${para.title}</span>
                <span class="sidebar-para-status">
                    ${isDone      ? '<span class="status-done">✓</span>'   : ''}
                    ${!isUnlocked ? '<span class="status-lock">🔒</span>'  : ''}
                    ${progress && !isDone ? `<span class="para-pct">${progress}%</span>` : ''}
                    ${sections.length > 0 ? `<span class="sidebar-para-arrow">${isExpanded ? '▾' : '▸'}</span>` : ''}
                </span>`;

            if (!isUnlocked) {
                a.addEventListener('click', e => { e.preventDefault(); showLockedNotice(); });
            }

            li.appendChild(a);

            // ── Подменю секций (показываем всегда, если параграф раскрыт) ──
            if (sections.length > 0) {
                const subUl = document.createElement('ul');
                subUl.className = 'sidebar-sections' + (isExpanded ? ' open' : '');

                sections.forEach((section, sIdx) => {
                    const isSectionActive = sIdx === activeSectionIdx;
                    const sli = document.createElement('li');
                    sli.className = 'sidebar-section-item';

                    const sa = document.createElement('a');
                    sa.className = 'sidebar-section-link' + (isSectionActive ? ' active' : '');
                    sa.href = section.file ? resolveHref(currentPath, section.file) : '#';

                    const sNum = section.number || `${chapterNum}.${para.number}.${sIdx + 1}`;
                    sa.innerHTML = `
                        <span class="sidebar-section-number">${sNum}</span>
                        <span class="sidebar-section-title">${section.title}</span>
                        ${section.hasTest ? '<span class="sidebar-section-test" title="Есть тест">✎</span>' : ''}`;

                    sli.appendChild(sa);
                    subUl.appendChild(sli);
                });

                li.appendChild(subUl);
            }

            ul.appendChild(li);
        });

        chapterEl.appendChild(ul);
        nav.appendChild(chapterEl);
    });
}

function isParagraphUnlocked(paragraphs, idx) {
    if (idx === 0) return true; // Первый параграф всегда открыт
    const prev = paragraphs[idx - 1];
    // Разблокирован, если у предыдущего нет finalTest ИЛИ finalTest пройден
    if (!prev.finalTest) return true;
    return !!localStorage.getItem(`final_passed_${prev.id}`);
}

function isParagraphDone(paraId) {
    return !!localStorage.getItem(`final_passed_${paraId}`);
}

function getQuizProgress(paraId) {
    // Ищем любой сохранённый результат финального теста
    const key = `quiz_final_${paraId}`;
    const data = localStorage.getItem(key);
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

// ------------------------------------------
// КНОПКИ «ПРЕДЫДУЩИЙ / СЛЕДУЮЩИЙ ПАРАГРАФ»
// ------------------------------------------
async function initParagraphNav() {
    const container = document.querySelector('.paragraph-nav');
    if (!container) return;

    const currentPath = normalizePath(window.location.pathname);

    let structure;
    try {
        const depth = (currentPath.match(/\//g) || []).length;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        const res = await fetch(`${prefix}course-structure.json`);
        structure  = await res.json();
    } catch { return; }

    // Плоский список всех параграфов
    const allParas = structure.chapters.flatMap(ch => ch.paragraphs);
    const currentIdx = allParas.findIndex(p =>
        isCurrentPage(currentPath, p.file, p.legacyFile)
    );

    if (currentIdx === -1) return;

    const prev = currentIdx > 0               ? allParas[currentIdx - 1] : null;
    const next = currentIdx < allParas.length - 1 ? allParas[currentIdx + 1] : null;

    const depth  = (currentPath.match(/\//g) || []).length;
    const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';

    container.innerHTML = `
        <div class="para-nav-inner">
            ${prev ? `<a class="para-nav-btn para-nav-prev" href="${prefix}${prev.file}">
                ← <span>${prev.title}</span>
            </a>` : '<span></span>'}
            ${next ? `<a class="para-nav-btn para-nav-next ${isParagraphUnlocked(allParas, currentIdx + 1) ? '' : 'locked'}"
                         href="${isParagraphUnlocked(allParas, currentIdx + 1) ? prefix + next.file : '#'}">
                <span>${next.title}</span> →
            </a>` : '<span></span>'}
        </div>`;
}

// ------------------------------------------
// ПРОГРЕСС-БАР ЧТЕНИЯ (верхняя полоса)
// ------------------------------------------
function initReadingProgress() {
    const bar = document.querySelector('.reading-progress-bar');
    if (!bar) return;

    const update = () => {
        const docH   = document.documentElement.scrollHeight - window.innerHeight;
        const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
        bar.style.width = `${Math.min(pct, 100)}%`;
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
}

// ------------------------------------------
// КНОПКИ «КОПИРОВАТЬ КОД»
// ------------------------------------------
function initCopyCode() {
    document.querySelectorAll('.btn-code[data-action="copy"], .btn-code').forEach(btn => {
        btn.addEventListener('click', () => {
            const block = btn.closest('.code-block');
            if (!block) return;
            const code = block.querySelector('code')?.textContent || '';
            navigator.clipboard.writeText(code).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Скопировано ✓';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = orig;
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });
}

// ------------------------------------------
// ВСПОМОГАТЕЛЬНЫЕ
// ------------------------------------------
function normalizePath(path) {
    // Приводим к виду без начального /
    return path.replace(/^\//, '').replace(/\\/g, '/');
}

function isCurrentPage(currentPath, ...files) {
    return files.some(f => f && currentPath.endsWith(f));
}

function resolveHref(currentPath, targetFile) {
    // Для простоты: вычисляем глубину текущей страницы и строим относительный путь
    const currentParts = currentPath.split('/');
    const targetParts  = targetFile.split('/');
    const depth        = currentParts.length - 1;
    const prefix       = depth > 0 ? '../'.repeat(depth) : '';
    return prefix + targetFile;
}

// Экспортируем copyCode для inline onclick
window.copyCode = function(btn) {
    const block = btn.closest('.code-block');
    if (!block) return;
    const code = block.querySelector('code')?.textContent || '';
    navigator.clipboard.writeText(code).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Скопировано ✓';
        setTimeout(() => btn.textContent = orig, 2000);
    });
};
