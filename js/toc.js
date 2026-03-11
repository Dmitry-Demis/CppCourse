// ============================================
// TABLE OF CONTENTS GENERATOR v2
// Поддержка h2 + h3, иерархическая нумерация
// ============================================

/**
 * Генерирует содержание (TOC) из заголовков h2 и h3 на странице.
 * h2 — разделы первого уровня (нумерация: 1, 2, 3…)
 * h3 — подразделы   (нумерация: 1.1, 1.2, 2.1…)
 */
function generateTOC() {
    const content = document.querySelector('.chapter-content');
    const tocNav  = document.querySelector('.toc-nav');

    if (!content || !tocNav) return;

    const headings = content.querySelectorAll('h2, h3');

    if (headings.length === 0) {
        tocNav.innerHTML = '<div style="color:var(--text-tertiary);font-size:var(--fs-xs);padding:var(--space-2);">Нет разделов</div>';
        return;
    }

    tocNav.innerHTML = '';

    let h2Counter = 0;
    let h3Counter = 0;

    headings.forEach((heading) => {
        // Присваиваем ID, если нет
        if (!heading.id) {
            const slug = heading.textContent
                .trim()
                .toLowerCase()
                .replace(/[^a-zа-яё0-9\s]/gi, '')
                .replace(/\s+/g, '-')
                .substring(0, 60);
            heading.id = slug || `section-${Math.random().toString(36).substring(2, 7)}`;
        }

        let number = '';
        if (heading.tagName === 'H2') {
            h2Counter++;
            h3Counter = 0;
            number = `${h2Counter}.`;
        } else {
            h3Counter++;
            number = `${h2Counter}.${h3Counter}.`;
        }

        // Сохраняем номер в dataset для подсветки
        heading.dataset.tocNumber = number;

        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.className = heading.tagName === 'H2' ? 'toc-item toc-h2' : 'toc-item toc-h3';
        a.dataset.target = heading.id;

        a.innerHTML = `<span class="toc-number">${number}</span><span class="toc-text">${heading.textContent.trim()}</span>`;

        a.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToHeading(heading);
            setActiveLink(a);
        });

        tocNav.appendChild(a);
    });

    // Подсвечиваем первый элемент сразу
    highlightActiveTOC();
}

function scrollToHeading(heading) {
    const headerOffset = 80;
    const top = heading.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
}

function setActiveLink(activeEl) {
    document.querySelectorAll('.toc-item').forEach(el => el.classList.remove('active'));
    activeEl.classList.add('active');
}

/**
 * Подсвечивает активный раздел при скролле.
 */
function highlightActiveTOC() {
    const headings = Array.from(document.querySelectorAll('.chapter-content h2, .chapter-content h3'));
    const tocItems = document.querySelectorAll('.toc-item');

    if (!headings.length || !tocItems.length) return;

    const scrollPosition = window.scrollY + 110;
    let currentId = headings[0].id;

    for (const heading of headings) {
        if (heading.offsetTop <= scrollPosition) {
            currentId = heading.id;
        }
    }

    tocItems.forEach(item => {
        const isActive = item.dataset.target === currentId;
        item.classList.toggle('active', isActive);
    });
}

// ============================================
// Инициализация
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    generateTOC();

    // Дебаунсированный обработчик скролла
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                highlightActiveTOC();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
});
