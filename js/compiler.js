// ============================================
// CppCompiler v5 — CodeMirror 6 (UMD via jsDelivr) + Godbolt
// ============================================

// Compute site root from script URL (same approach as navigation.js)
const _compilerSiteRoot = (() => {
    const src = (document.currentScript || {}).src || '';
    const m = src.match(/^(.*\/)js\/compiler\.js/);
    return m ? m[1] : './';
})();

const CW_COMPILERS = [
    { id: 'g152',      label: 'GCC 15.2'   },
    { id: 'clang2210', label: 'Clang 22.1' },
];

// Загружаем CodeMirror через готовый UMD-бандл
let _cmPromise = null;

function _loadCM() {
    if (_cmPromise) return _cmPromise;
    _cmPromise = new Promise((resolve, reject) => {
        if (window.CodeMirror) { resolve(window.CodeMirror); return; }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@uiw/codemirror-extensions-langs/dist/index.umd.js';
        s.onerror = reject;
        // Используем codemirror-editor-in-chief — полный бандл с C++
        document.head.appendChild(s);
        // Вместо этого — используем простой CM5 UMD который точно работает
    });
    return _cmPromise;
}

// Проще и надёжнее — используем CodeMirror 5 (есть нормальный UMD)
let _cm5Promise = null;

function _loadCM5() {
    if (_cm5Promise) return _cm5Promise;
    _cm5Promise = new Promise((resolve, reject) => {
        if (window.CodeMirror) { resolve(); return; }

        // CSS
        const link = document.createElement('link');
        link.rel  = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.min.css';
        document.head.appendChild(link);

        const linkTheme = document.createElement('link');
        linkTheme.rel  = 'stylesheet';
        linkTheme.href = 'https://cdn.jsdelivr.net/npm/codemirror@5/theme/dracula.min.css';
        document.head.appendChild(linkTheme);

        // Core JS
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.min.js';
        s.onload = () => {
            // C++ mode
            const m = document.createElement('script');
            m.src = 'https://cdn.jsdelivr.net/npm/codemirror@5/mode/clike/clike.min.js';
            m.onload  = resolve;
            m.onerror = reject;
            document.head.appendChild(m);
        };
        s.onerror = reject;
        document.head.appendChild(s);
    });
    return _cm5Promise;
}

class CppCompiler {
    constructor(block) {
        this.block    = block;
        this.compiler = CW_COMPILERS[0].id;
        this.std      = 'c++11';
        this.arch     = 'x64';
        this.code     = '';
        this._cm      = null;
    }

    // Вычисляет базовый путь примера из URL страницы.
    // /theory/chapter-2/fundamental-types/integer-types.html → chapter-2/fundamental-types/integer-types
    _pageBasePath() {
        const parts = location.pathname
            .replace(/^\/theory\//, '')
            .replace(/\.html$/, '')
            .split('/')
            .filter(Boolean);
        return parts.join('/');
    }

    // Возвращает список путей для попытки загрузки для конкретного стандарта (от точного к базовому).
    // std="c++17", example="short" →
    //   chapter-2/.../integer-types/short/short_17.cpp  (версионированный)
    //   chapter-2/.../integer-types/short/short.cpp     (базовый в папке)
    //   chapter-2/.../integer-types/short.cpp           (плоский)
    _candidatePathsForStd(example, std) {
        const suffix = std.replace('c++', '');

        // Старый формат: полный путь с .cpp
        if (example.includes('/') || example.endsWith('.cpp')) {
            const base = example.replace(/\.cpp$/i, '');
            return [
                `${base}_${suffix}.cpp`,
                example.endsWith('.cpp') ? example : `${example}.cpp`,
            ];
        }

        // Новый формат: просто имя
        const pageBase = this._pageBasePath();
        return [
            `${pageBase}/${example}/${example}_${suffix}.cpp`,
            `${pageBase}/${example}/${example}.cpp`,
            `${pageBase}/${example}.cpp`,
        ];
    }

    async _fetchCode(example, std) {
        for (const candidate of this._candidatePathsForStd(example, std)) {
            // 1. Try server API first
            try {
                const r = await fetch(`/api/examples/${candidate}`);
                if (r.ok) return (await r.json()).code || '';
            } catch {}
            // 2. Fallback: try client-side static examples folder
            try {
                const r = await fetch(`${_compilerSiteRoot}examples/${candidate}`);
                if (r.ok) return await r.text();
            } catch {}
        }
        return null;
    }

    async init() {
        const codeEl = this.block.querySelector('pre code');
        this._example = this.block.dataset.example;

        if (this._example) {
            const code = await this._fetchCode(this._example, this.std);
            if (code !== null) this.code = code;
        }
        if (!this.code && codeEl) this.code = codeEl.textContent.trim();

        const label = this.block.querySelector('.code-lang')?.textContent || 'C++';

        try {
            await _loadCM5();
            this._render(label, true);
        } catch {
            this._render(label, false);
        }

        // Sync unlocked stds from server (non-blocking)
        this._syncStds();
    }

    // Fetches unlocked stds from server and updates the select.
    // Falls back to cached localStorage value. C++11 is always available.
    async _syncStds() {
        const STD_ORDER = ['c++11', 'c++14', 'c++17', 'c++20', 'c++23'];
        const CACHE_KEY = 'shop_unlocked_stds';
        const CACHE_TTL = 5 * 60 * 1000; // 5 min

        const cached = (() => {
            try {
                const raw = localStorage.getItem(CACHE_KEY);
                if (!raw) return null;
                const { stds, ts } = JSON.parse(raw);
                if (Date.now() - ts < CACHE_TTL) return stds;
                return null;
            } catch { return null; }
        })();

        let stds = cached;

        if (!stds) {
            try {
                const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
                if (user?.isuNumber) {
                    const r = await fetch(`/api/profile/${user.isuNumber}`);
                    if (r.ok) {
                        const profile = await r.json();
                        // unlockedContentStds = "c++11,c++14" or ""
                        const fromServer = (profile.unlockedContentStds || '')
                            .split(',').map(s => s.trim()).filter(Boolean);
                        // Always include c++11
                        stds = ['c++11', ...fromServer.filter(s => s !== 'c++11')];
                        // Sort by STD_ORDER
                        stds = STD_ORDER.filter(s => stds.includes(s));
                        localStorage.setItem(CACHE_KEY, JSON.stringify({ stds, ts: Date.now() }));
                    }
                }
            } catch {}
        }

        if (!stds || !stds.length) stds = ['c++11'];

        // Update the select if it exists
        if (!this._selStd) return;
        const current = this._selStd.value;
        this._selStd.innerHTML = stds.map(s =>
            `<option value="${s}"${s === current ? ' selected' : ''}>${s.toUpperCase()}</option>`
        ).join('');

        // If current std is no longer available, reset to c++11
        if (!stds.includes(current)) {
            this._selStd.value = 'c++11';
            this.std = 'c++11';
        }
    }

    async _onStdChange(std) {
        this.std = std;
        if (!this._example) return;

        const code = await this._fetchCode(this._example, std);
        if (code !== null && code !== this._getCode()) {
            if (this._cm) {
                this._cm.setValue(code);
            } else {
                const ta = this.widget?.querySelector('.cw-ta');
                if (ta) ta.value = code;
            }
        }
    }

    _render(label, withCM) {
        const compilerOpts = CW_COMPILERS.map(c =>
            `<option value="${c.id}">${c.label}</option>`
        ).join('');

        // Читаем разблокированные стандарты из кеша (обновится через _syncStds)
        const unlockedStds = (() => {
            try {
                const raw = localStorage.getItem('shop_unlocked_stds');
                if (!raw) return ['c++11'];
                const parsed = JSON.parse(raw);
                // Поддержка старого формата (массив) и нового ({ stds, ts })
                const stds = Array.isArray(parsed) ? parsed : (parsed.stds || ['c++11']);
                return stds.length ? stds : ['c++11'];
            } catch { return ['c++11']; }
        })();
        const stdOpts = unlockedStds.map(s =>
            `<option value="${s}">${s.toUpperCase()}</option>`
        ).join('');

        const widget = document.createElement('div');
        widget.className = 'cw';
        widget.innerHTML = `
            <div class="cw-header">
                <span class="cw-label">💻 ${label}</span>
                <div class="cw-controls">
                    <select class="cw-select cw-compiler">${compilerOpts}</select>
                    <select class="cw-select cw-std" title="Стандарт C++">${stdOpts}</select>
                    <select class="cw-select cw-arch" title="Архитектура">
                        <option value="x64">x64</option>
                        <option value="x86">x86</option>
                    </select>
                    <button class="cw-opts-toggle" title="Дополнительные опции">⚙</button>
                    <button class="cw-copy">⎘ Копировать</button>
                    <button class="cw-run" title="Ctrl+Enter">▶ Запустить</button>
                </div>
            </div>
            <div class="cw-opts-panel" hidden>
                <label class="cw-opts-label">Compiler options
                    <input class="cw-opts-input cw-compiler-opts" type="text" placeholder="-DDEBUG -Wall" spellcheck="false">
                </label>
                <label class="cw-opts-label">Stdin
                    <textarea class="cw-opts-input cw-stdin" rows="2" placeholder="Данные для std::cin…" spellcheck="false"></textarea>
                </label>
            </div>
            <div class="cw-cm"><textarea class="cw-ta"></textarea></div>
            <div class="cw-output cw-output--empty">Нажмите ▶ Запустить для выполнения кода</div>`;

        this.block.replaceWith(widget);
        this.widget      = widget;
        this._out        = widget.querySelector('.cw-output');
        this._btnRun     = widget.querySelector('.cw-run');
        this._btnCopy    = widget.querySelector('.cw-copy');
        this._selComp    = widget.querySelector('.cw-compiler');
        this._selStd     = widget.querySelector('.cw-std');
        this._selArch    = widget.querySelector('.cw-arch');
        this._optsToggle = widget.querySelector('.cw-opts-toggle');
        this._optsPanel  = widget.querySelector('.cw-opts-panel');
        this._compOpts   = widget.querySelector('.cw-compiler-opts');
        this._stdin      = widget.querySelector('.cw-stdin');
        const ta         = widget.querySelector('.cw-ta');
        ta.value         = this.code;

        if (withCM && window.CodeMirror) {
            this._cm = window.CodeMirror.fromTextArea(ta, {
                mode:        'text/x-c++src',
                theme:       'dracula',
                lineNumbers: true,
                indentUnit:  4,
                tabSize:     4,
                indentWithTabs: false,
                lineWrapping: false,
                autofocus:   false,
                extraKeys: {
                    'Tab': cm => cm.execCommand('indentMore'),
                    'Shift-Tab': cm => cm.execCommand('indentLess'),
                    'Ctrl-Enter': () => this._compile(),
                    'Cmd-Enter':  () => this._compile(),
                },
            });
            this._cm.setValue(this.code);
        } else {
            // fallback — plain textarea
            ta.className = 'cw-ta cw-ta--plain';
            ta.addEventListener('keydown', e => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const s = ta.selectionStart;
                    ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd);
                    ta.selectionStart = ta.selectionEnd = s + 4;
                }
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); this._compile(); }
            });
        }

        this._selComp.addEventListener('change', e => { this.compiler = e.target.value; });
        this._selStd.addEventListener('change',  e => { this._onStdChange(e.target.value); });
        this._selArch.addEventListener('change', e => { this.arch = e.target.value; });
        this._optsToggle.addEventListener('click', () => {
            const hidden = this._optsPanel.hidden;
            this._optsPanel.hidden = !hidden;
            this._optsToggle.classList.toggle('cw-opts-toggle--active', !hidden === false ? false : true);
        });
        this._btnRun.addEventListener('click',   () => this._compile());
        this._btnCopy.addEventListener('click',  () => {
            navigator.clipboard.writeText(this._getCode()).then(() => {
                this._btnCopy.textContent = '✓ Скопировано';
                setTimeout(() => { this._btnCopy.textContent = '⎘ Копировать'; }, 2000);
            });
        });
    }

    _getCode() {
        return this._cm ? this._cm.getValue() : (this.widget?.querySelector('.cw-ta')?.value ?? this.code);
    }

    async _compile() {
        const code        = this._getCode();
        const extraOpts   = this._compOpts?.value.trim() || '';
        const stdinData   = this._stdin?.value || '';
        const archFlag    = this.arch === 'x86' ? '-m32' : '-m64';
        const userArgs    = [`-std=${this.std}`, '-O2', '-fno-diagnostics-color', archFlag, extraOpts]
            .filter(Boolean).join(' ');

        this._btnRun.disabled    = true;
        this._btnRun.textContent = '⏳…';
        this._out.className      = 'cw-output cw-output--running';
        this._out.textContent    = 'Компиляция…';

        try {
            const res = await fetch(`https://godbolt.org/api/compiler/${this.compiler}/compile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    source: code,
                    options: {
                        userArguments: userArgs,
                        compilerOptions: { executorRequest: true },
                        filters: { execute: true },
                        tools: [], libraries: [],
                        executeParameters: { stdin: stdinData }
                    },
                    lang: 'c++',
                    allowStoreCodeDebug: true
                })
            });
            if (!res.ok) throw new Error(`Godbolt HTTP ${res.status}`);
            const data = await res.json();
            if (window.gameSystem) gameSystem.onCodeRun?.();
            this._showResult(data);
        } catch (err) {
            this._out.className   = 'cw-output cw-output--error';
            this._out.textContent = `Ошибка подключения: ${err.message}`;
        } finally {
            this._btnRun.disabled    = false;
            this._btnRun.textContent = '▶ Запустить';
        }
    }

    _stripAnsi(s) {
        return s.replace(/\x1b\[[0-9;]*[mKGHF]/g, '').replace(/\[[\d;]*[mKGHF]/g, '');
    }

    _showResult(data) {
        const strip = arr => (arr || []).map(l => this._stripAnsi(l.text)).filter(Boolean);
        const buildStderr = strip(data.buildResult?.stderr);
        const topStderr   = strip(data.stderr);
        const stderr      = buildStderr.length ? buildStderr : topStderr;
        const buildCode   = data.buildResult?.code ?? data.code;
        const compiled    = data.execResult != null || buildCode === 0;

        if (!compiled) {
            this._out.className   = 'cw-output cw-output--error';
            this._out.textContent = stderr.length ? stderr.join('\n') : `Ошибка компиляции (код ${buildCode})`;
            return;
        }

        const stdout   = strip(data.stdout).join('\n') || data.execResult?.stdout || '(нет вывода)';
        const warnings = stderr.filter(l => /warning:/i.test(l));
        const prefix   = warnings.length ? `⚠️ ${warnings.join('\n')}\n\n` : '';
        this._out.className   = 'cw-output cw-output--ok';
        this._out.textContent = prefix + stdout;
    }
}

// ── Инициализация ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.code-block[data-example]').forEach(block => {
        new CppCompiler(block).init();
    });
});
