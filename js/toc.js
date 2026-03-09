// ============================================
// TABLE OF CONTENTS GENERATOR
// Автоматическая генерация содержания из заголовков
// ============================================

/**
 * Генерирует содержание (TOC) из заголовков h2 на странице
 */
function generateTOC() {
    const content = document.querySelector('.chapter-content');
    const tocNav = document.querySelector('.toc-nav');
    
    if (!content || !tocNav) return;
    
    // Находим все заголовки h2
    const headings = content.querySelectorAll('h2');
    
    if (headings.length === 0) {
        tocNav.innerHTML = '<div style="color: var(--text-tertiary); font-size: var(--fs-xs); padding: var(--space-2);">Нет разделов</div>';
        return;
    }
    
    tocNav.innerHTML = '';
    
    headings.forEach((heading, index) => {
        // Добавляем ID к заголовку, если его нет
        if (!heading.id) {
            heading.id = `section-${index + 1}`;
        }
        
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.className = 'toc-item';
        a.textContent = heading.textContent;
        
        a.onclick = (e) => {
            e.preventDefault();
            
            // Плавная прокрутка к заголовку
            const headerOffset = 80; // Высота header + отступ
            const elementPosition = heading.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Highlight активного элемента
            document.querySelectorAll('.toc-item').forEach(link => {
                link.classList.remove('active');
            });
            a.classList.add('active');
        };
        
        tocNav.appendChild(a);
    });
}

/**
 * Подсвечивает активный раздел в TOC при скролле
 */
function highlightActiveTOC() {
    const headings = document.querySelectorAll('.chapter-content h2');
    const tocItems = document.querySelectorAll('.toc-item');
    
    if (headings.length === 0 || tocItems.length === 0) return;
    
    let currentActive = null;
    const scrollPosition = window.scrollY + 100; // Offset для активации
    
    headings.forEach((heading) => {
        const headingTop = heading.offsetTop;
        
        if (scrollPosition >= headingTop) {
            currentActive = heading.id;
        }
    });
    
    // Обновляем активный элемент в TOC
    if (currentActive) {
        tocItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentActive}`) {
                item.classList.add('active');
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    generateTOC();
    
    // Отслеживаем скролл для подсветки активного раздела
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                highlightActiveTOC();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Подсвечиваем первый элемент при загрузке
    highlightActiveTOC();
});
