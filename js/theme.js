// ============================================
// THEME SWITCHER — 5 predefined themes
// ============================================

const THEMES = [
    { id: 'dark',    label: 'Тёмная',   icon: '🌑', desc: 'Индиго / Фиолет' },
    { id: 'blue',    label: 'Синяя',    icon: '💙', desc: 'Ярко-синяя' },
    { id: 'light',   label: 'Светлая',  icon: '☀️', desc: 'Белая / Синие акценты' },
    { id: 'emerald', label: 'Изумруд',  icon: '💚', desc: 'Тёмно-зелёная' },
    { id: 'sunset',  label: 'Закат',    icon: '🌅', desc: 'Тёплая / Янтарь' },
];

const STORAGE_KEY = 'cpp_theme';

function applyTheme(id) {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem(STORAGE_KEY, id);
    document.querySelectorAll('.theme-option').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === id);
    });
}

function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
}

// Apply immediately to avoid flash
applyTheme(getSavedTheme());

function buildThemePicker() {
    if (document.getElementById('theme-picker-root')) return;

    const root = document.createElement('div');
    root.id = 'theme-picker-root';

    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.id = 'theme-toggle-btn';
    btn.setAttribute('aria-label', 'Сменить тему');
    btn.title = 'Сменить тему';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;

    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.id = 'theme-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Выбор темы');

    const title = document.createElement('div');
    title.className = 'theme-panel-title';
    title.textContent = 'Тема оформления';

    const opts = document.createElement('div');
    opts.className = 'theme-options';

    THEMES.forEach(t => {
        const optBtn = document.createElement('button');
        optBtn.className = 'theme-option';
        optBtn.dataset.theme = t.id;
        optBtn.title = t.desc;
        optBtn.innerHTML = `<span class="theme-option-icon">${t.icon}</span><span class="theme-option-label">${t.label}</span><span class="theme-option-desc">${t.desc}</span>`;

        // Direct click handler on each button
        optBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            applyTheme(this.dataset.theme);
            panel.classList.remove('open');
        });

        opts.appendChild(optBtn);
    });

    panel.appendChild(title);
    panel.appendChild(opts);
    root.appendChild(panel);
    root.appendChild(btn);

    document.body.appendChild(root);

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        panel.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
        if (!root.contains(e.target)) {
            panel.classList.remove('open');
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') panel.classList.remove('open');
    });

    // Mark current active
    document.querySelectorAll('.theme-option').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === getSavedTheme());
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildThemePicker);
} else {
    buildThemePicker();
}

// ── Scroll tracker (all pages) ───────────────────────────────────────────────
(function () {
    'use strict';
    let _px   = 0;
    let _last = window.scrollY;
    let _sent = false;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        _px += Math.abs(y - _last);
        _last = y;
    }, { passive: true });

    function flush() {
        if (_sent || _px < 10) return;
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (!user?.isuNumber) return;
        const px = Math.round(_px);
        _px = 0;   // сбрасываем накопленное
        _sent = true;
        fetch('/api/scroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Isu-Number': user.isuNumber },
            body: JSON.stringify({ pixels: px }),
            keepalive: true
        }).catch(() => {});
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            flush();
        } else {
            // Вернулись на вкладку — разрешаем следующую отправку
            _sent = false;
        }
    });
    window.addEventListener('pagehide',     flush);
    window.addEventListener('beforeunload', flush);
})();
