// Online C++ Compiler using Compiler Explorer (Godbolt) API
class CppCompiler {
    constructor(containerId, initialCode = '') {
        this.container = document.getElementById(containerId);
        this.code = initialCode;
        this.compiler = 'g132'; // GCC 13.2
        this.arch = 'x86-64';
        this.standard = 'c++17';
        
        if (this.container) {
            this.render();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="compiler-widget">
                <div class="compiler-header">
                    <div class="compiler-title">
                        <span>💻</span>
                        <span>Онлайн компилятор C++</span>
                    </div>
                    <div class="compiler-controls">
                        <select class="compiler-select" id="compiler-${this.container.id}">
                            <optgroup label="GCC">
                                <option value="g132" selected>GCC 13.2</option>
                                <option value="g122">GCC 12.2</option>
                                <option value="g114">GCC 11.4</option>
                            </optgroup>
                            <optgroup label="Clang">
                                <option value="clang1600">Clang 16.0.0</option>
                                <option value="clang1500">Clang 15.0.0</option>
                                <option value="clang1400">Clang 14.0.0</option>
                            </optgroup>
                        </select>
                        <select class="compiler-select" id="arch-${this.container.id}">
                            <option value="x86-64" selected>x86-64</option>
                            <option value="x86">x86 (32-bit)</option>
                        </select>
                        <select class="compiler-select" id="std-${this.container.id}">
                            <option value="c++23">C++23</option>
                            <option value="c++20">C++20</option>
                            <option value="c++17" selected>C++17</option>
                            <option value="c++14">C++14</option>
                            <option value="c++11">C++11</option>
                        </select>
                        <button class="btn-compile" id="compile-${this.container.id}">
                            ▶ Компилировать и запустить
                        </button>
                    </div>
                </div>
                
                <div class="compiler-editor">
                    <textarea id="code-${this.container.id}" spellcheck="false" class="code-editor">${this.escapeHtml(this.code)}</textarea>
                </div>
                
                <div class="compiler-output">
                    <div class="compiler-output-header">
                        <span class="compiler-output-title">Вывод программы</span>
                        <span class="compiler-output-status" id="status-${this.container.id}"></span>
                    </div>
                    <div class="compiler-output-content empty" id="output-${this.container.id}">
                        Нажмите "Компилировать и запустить" для выполнения кода
                    </div>
                </div>
                
                <div class="compiler-info">
                    <span class="compiler-info-icon">ℹ️</span>
                    <span>Код компилируется на удалённом сервере Compiler Explorer (godbolt.org)</span>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        const compileBtn = document.getElementById(`compile-${this.container.id}`);
        const compilerSelect = document.getElementById(`compiler-${this.container.id}`);
        const archSelect = document.getElementById(`arch-${this.container.id}`);
        const stdSelect = document.getElementById(`std-${this.container.id}`);
        const codeArea = document.getElementById(`code-${this.container.id}`);
        
        compileBtn.addEventListener('click', () => this.compile());
        
        compilerSelect.addEventListener('change', (e) => {
            this.compiler = e.target.value;
        });
        
        archSelect.addEventListener('change', (e) => {
            this.arch = e.target.value;
        });
        
        stdSelect.addEventListener('change', (e) => {
            this.standard = e.target.value;
        });
        
        codeArea.addEventListener('input', (e) => {
            this.code = e.target.value;
        });
        
        // Tab key support
        codeArea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.substring(0, start) + '    ' + e.target.value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }
        });
    }
    
    async compile() {
        const compileBtn = document.getElementById(`compile-${this.container.id}`);
        const statusEl = document.getElementById(`status-${this.container.id}`);
        const outputEl = document.getElementById(`output-${this.container.id}`);
        const codeArea = document.getElementById(`code-${this.container.id}`);
        
        // Update UI
        compileBtn.disabled = true;
        compileBtn.classList.add('compiling');
        compileBtn.innerHTML = '<span class="spinner"></span> Компиляция...';
        statusEl.className = 'compiler-output-status compiling';
        statusEl.textContent = 'Компиляция...';
        outputEl.className = 'compiler-output-content';
        outputEl.textContent = 'Отправка кода на сервер...';
        
        try {
            const code = codeArea.value;
            
            // Compiler Explorer API
            const response = await fetch('https://godbolt.org/api/compiler/' + this.compiler + '/compile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    source: code,
                    options: {
                        userArguments: `-std=${this.standard} -O2`,
                        compilerOptions: {
                            executorRequest: true
                        },
                        filters: {
                            execute: true
                        },
                        tools: [],
                        libraries: []
                    },
                    lang: 'c++',
                    allowStoreCodeDebug: true
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Check for compilation errors
            if (result.code !== 0) {
                statusEl.className = 'compiler-output-status error';
                statusEl.textContent = '❌ Ошибка компиляции';
                outputEl.className = 'compiler-output-content error';
                
                let errorOutput = '';
                
                // Parse stderr for better error display
                if (result.stderr && result.stderr.length > 0) {
                    const errors = result.stderr.map(line => line.text).join('\n');
                    
                    // Try to parse and format errors
                    const errorLines = errors.split('\n');
                    let formattedErrors = [];
                    
                    for (let line of errorLines) {
                        if (line.trim()) {
                            // Highlight error/warning keywords
                            if (line.includes('error:')) {
                                formattedErrors.push('🔴 ' + line);
                            } else if (line.includes('warning:')) {
                                formattedErrors.push('⚠️  ' + line);
                            } else if (line.includes('note:')) {
                                formattedErrors.push('ℹ️  ' + line);
                            } else {
                                formattedErrors.push(line);
                            }
                        }
                    }
                    
                    errorOutput = formattedErrors.join('\n');
                } else if (result.stdout && result.stdout.length > 0) {
                    errorOutput = result.stdout.map(line => line.text).join('\n');
                } else {
                    errorOutput = `Ошибка компиляции (код выхода: ${result.code})\n\nПроверьте синтаксис кода.`;
                }
                
                outputEl.textContent = errorOutput;
            } else {
                // Success - show execution output
                statusEl.className = 'compiler-output-status success';
                statusEl.textContent = '✓ Успешно';
                outputEl.className = 'compiler-output-content';
                
                let output = '';
                
                // Get execution output
                if (result.stdout && result.stdout.length > 0) {
                    output = result.stdout.map(line => line.text).join('\n');
                } else if (result.execResult && result.execResult.stdout) {
                    output = result.execResult.stdout;
                } else {
                    output = '(программа выполнена успешно, вывод отсутствует)';
                }
                
                outputEl.textContent = output;
            }
            
        } catch (error) {
            console.error('Compilation error:', error);
            statusEl.className = 'compiler-output-status error';
            statusEl.textContent = 'Ошибка';
            outputEl.className = 'compiler-output-content error';
            outputEl.textContent = `Ошибка подключения к серверу компиляции:\n${error.message}\n\nПопробуйте позже или проверьте подключение к интернету.`;
        } finally {
            compileBtn.disabled = false;
            compileBtn.classList.remove('compiling');
            compileBtn.innerHTML = '▶ Компилировать и запустить';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Helper function to create compiler from code block
function createCompilerFromCodeBlock(codeBlockId, compilerId) {
    const codeBlock = document.getElementById(codeBlockId);
    if (!codeBlock) return;

    const code = codeBlock.querySelector('code').textContent;

    // Create compiler container after code block
    const compilerContainer = document.createElement('div');
    compilerContainer.id = compilerId;
    codeBlock.parentNode.insertBefore(compilerContainer, codeBlock.nextSibling);

    new CppCompiler(compilerId, code);
}

// ── Авто-кнопки «▶ Запустить» для каждого блока кода C++ ──
function initAutoRunButtons() {
    document.querySelectorAll('.code-block').forEach((block, i) => {
        const codeEl = block.querySelector('pre code');
        if (!codeEl) return;

        // Пропускаем не-C++ блоки (без class вообще или явно не cpp)
        const cls = codeEl.className;
        if (cls && !cls.includes('language-cpp') && !cls.includes('cpp') && !cls.includes('c++')) return;

        // Не добавляем кнопку дважды
        const actions = block.querySelector('.code-actions');
        if (!actions || actions.querySelector('.btn-run')) return;

        const code = codeEl.textContent;
        const compilerId = `auto-compiler-${i}`;

        const btn = document.createElement('button');
        btn.className = 'btn-code btn-run';
        btn.textContent = '▶ Запустить';
        btn.addEventListener('click', () => toggleAutoCompiler(block, code, compilerId, btn));
        actions.appendChild(btn);
    });
}

function toggleAutoCompiler(block, code, compilerId, btn) {
    let container = document.getElementById(compilerId);
    if (container) {
        const hidden = container.style.display === 'none';
        container.style.display = hidden ? '' : 'none';
        btn.textContent = hidden ? '▼ Скрыть' : '▶ Запустить';
        return;
    }
    container = document.createElement('div');
    container.id = compilerId;
    block.insertAdjacentElement('afterend', container);
    btn.textContent = '▼ Скрыть';
    new CppCompiler(compilerId, code);
}

document.addEventListener('DOMContentLoaded', () => initAutoRunButtons());
