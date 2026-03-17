// ============================================
// CppCompiler — inline compiler widget
// Для каждого .code-block[data-example] редактор
// рендерится сразу (не по кнопке).
// Код подгружается с /api/examples/...
// Подсветка через highlight.js (если подключён).
// ============================================

const CW_COMPILERS = [
    { id: 'g1320',  label: 'GCC 13.2',   family: 'gcc'   },
    { id: 'g1220',  label: 'GCC 12.2',   family: 'gcc'   },
    { id: 'clang1600', label: 'Clang 16', family: 'clang' },
    { id: 'clang1500', label: 'Clang 15', family: 'clang' },
];

const CW_STDS = ['c++23', 'c++20', 'c++17', 'c++14', 'c++11'];

class CppCompiler {
    /**
     * @param {string|HTMLElement} target  — ID контейнера или сам элемент
     * @param {string} initialCode
     * @param {object} opts  — { std: 'c++17', compiler: 'g1320' }
     */
    constructor(target, initialCode = '', opts = {}) {
        this.container = typeof target === 'string'
            ? document.getElementById(target)
            : target;
        this.code     = initialCode;
        this.compiler = opts.compiler || CW_COMPILERS[0].id;
        this.std      = opts.std      || 'c++17';
        if (this.container) this._render();
    }

    _render() {
        const compilerOptions = CW_COMPILERS.map(c =>
            `<option value="${c.id}" ${c.id === this.compiler ? 'selected' : ''}>${c.label}</option>`
        ).join('');

        const stdOptions = CW_STDS.map(s =>
            `<option value="${s}" ${s === this.std ? 'selected' : ''}>${s.toUpperCase()}</option>`
        ).join('');

        this.container.innerHTML = `
            <div class="cw">
                <div class="cw-header">
                    <span class="cw-label">💻 Редактор</span>
                    <div class="cw-controls">
                        <select class="cw-select cw-select--compiler" title="Компилятор">
                            ${compilerOptions}
                        </select>
                        <select class="cw-select cw-select--std" title="Стандарт C++">
                            ${stdOptions}
                        </select>
                        <button class="cw-run" title="Запустить (Ctrl+Enter)">▶ Запустить</button>
                    </div>
                </div>
                <textarea class="cw-editor" spellcheck="false">${this._esc(this.code)}</textarea>
                <div class="cw-output cw-output--empty">Нажмите ▶ Запустить для выполнения кода</div>
            </div>`;

        const ta      = this.container.querySelector('.cw-editor');
        const selComp = this.container.querySelector('.cw-select--compiler');
        const selStd  = this.container.querySelector('.cw-select--std');
        const btn     = this.container.querySelector('.cw-run');
        const out     = this.container.querySelector('.cw-output');

        selComp.addEventListener('change', e => { this.compiler = e.target.value; });
        selStd.addEventListener('change',  e => { this.std      = e.target.value; });
        ta.addEventListener('input',       e => { this.code     = e.target.value; });

        ta.addEventListener('keydown', e => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const s = e.target.selectionStart, end = e.target.selectionEnd;
                e.target.value = e.target.value.slice(0, s) + '    ' + e.target.value.slice(end);
                e.target.selectionStart = e.target.selectionEnd = s + 4;
                this.code = e.target.value;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this._compile(btn, out, ta);
            }
        });

        btn.addEventListener('click', () => this._compile(btn, out, ta));
    }

    async _compile(btn, out, ta) {
        this.code = ta.value;
        btn.disabled = true;
        btn.textContent = '⏳ Компиляция…';
        out.className = 'cw-output cw-output--running';
        out.textContent = 'Отправка на сервер…';

        try {
            const res = await fetch(`https://godbolt.org/api/compiler/${this.compiler}/compile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    source: this.code,
                    options: {
                        userArguments: `-std=${this.std} -O2`,
                        compilerOptions: { executorRequest: true },
                        filters: { execute: true },
                        tools: [], libraries: []
                    },
                    lang: 'c++',
                    allowStoreCodeDebug: true
                })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (window.gameSystem) gameSystem.onCodeRun();

            if (data.code !== 0) {
                const errors = (data.stderr || []).map(l => l.text).join('\n')
                    || `Ошибка компиляции (код ${data.code})`;
                out.className = 'cw-output cw-output--error';
                out.textContent = errors;
            } else {
                const output = (data.stdout || []).map(l => l.text).join('\n')
                    || data.execResult?.stdout
                    || '(программа выполнена, вывод отсутствует)';
                out.className = 'cw-output cw-output--ok';
                out.textContent = output;
            }
        } catch (err) {
            out.className = 'cw-output cw-output--error';
            out.textContent = `Ошибка подключения:\n${err.message}`;
        } finally {
            btn.disabled = false;
            btn.textContent = '▶ Запустить';
        }
    }

    _esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

// ── Загрузка кода с сервера ───────────────────────────────────────────────────

async function _loadExampleCode(path) {
    try {
        const res = await fetch(`/api/examples/${path}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.code;
    } catch { return null; }
}

// ── Инициализация всех .code-block[data-example] ─────────────────────────────
// Для каждого такого блока:
//   1. Подгружаем код с сервера → вставляем в <pre><code> + подсвечиваем
//   2. Сразу рендерим редактор CppCompiler под блоком

document.addEventListener('DOMContentLoaded', async () => {
    const blocks = document.querySelectorAll('.code-block[data-example]');

    await Promise.all(Array.from(blocks).map(async (block, i) => {
        const examplePath = block.dataset.example;
        const codeEl      = block.querySelector('pre code');
        const std         = block.dataset.std      || 'c++17';
        const compiler    = block.dataset.compiler || CW_COMPILERS[0].id;

        // 1. Загружаем и подсвечиваем код в статическом блоке
        let code = '';
        if (codeEl) {
            const fetched = await _loadExampleCode(examplePath);
            if (fetched) {
                code = fetched;
                codeEl.textContent = fetched;
                if (window.hljs) hljs.highlightElement(codeEl);
            } else {
                code = codeEl.textContent;
            }
        }

        // 2. Рендерим редактор сразу под блоком
        const wrapper = document.createElement('div');
        wrapper.id = `cw-${i}-${examplePath.replace(/[^a-z0-9]/gi, '-')}`;
        block.insertAdjacentElement('afterend', wrapper);
        new CppCompiler(wrapper, code, { std, compiler });
    }));
});
