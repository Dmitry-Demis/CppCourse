/* ============================================
   C++ SYNTAX HIGHLIGHTER
   ============================================ */

class CppHighlighter {
    constructor() {
        this.keywords = [
            'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor',
            'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t', 'char32_t',
            'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit',
            'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype',
            'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit',
            'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline',
            'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq',
            'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public',
            'register', 'reinterpret_cast', 'requires', 'return', 'short', 'signed',
            'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch',
            'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef',
            'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
            'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
        ];
        
        this.types = [
            'std::string', 'std::vector', 'std::map', 'std::set', 'std::array',
            'std::cout', 'std::cin', 'std::endl', 'std::setprecision', 'std::numeric_limits',
            'size_t', 'int8_t', 'int16_t', 'int32_t', 'int64_t',
            'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t'
        ];
        
        this.preprocessor = ['#include', '#define', '#ifdef', '#ifndef', '#endif', '#pragma'];
    }
    
    highlight(code) {
        let highlighted = code;
        
        // Escape HTML
        highlighted = highlighted
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Comments
        highlighted = highlighted.replace(
            /(\/\/.*$)/gm,
            '<span class="token comment">$1</span>'
        );
        
        highlighted = highlighted.replace(
            /(\/\*[\s\S]*?\*\/)/g,
            '<span class="token comment">$1</span>'
        );
        
        // Preprocessor directives
        this.preprocessor.forEach(prep => {
            const regex = new RegExp(`(${prep.replace('#', '\\#')}\\s*&lt;[^&]*&gt;)`, 'g');
            highlighted = highlighted.replace(regex, '<span class="token preprocessor">$1</span>');
        });
        
        // Strings
        highlighted = highlighted.replace(
            /("(?:[^"\\]|\\.)*")/g,
            '<span class="token string">$1</span>'
        );
        
        // Numbers
        highlighted = highlighted.replace(
            /\b(\d+\.?\d*[fFLl]?)\b/g,
            '<span class="token number">$1</span>'
        );
        
        // Types
        this.types.forEach(type => {
            const regex = new RegExp(`\\b(${type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'g');
            highlighted = highlighted.replace(regex, '<span class="token type">$1</span>');
        });
        
        // Keywords
        this.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            highlighted = highlighted.replace(regex, '<span class="token keyword">$1</span>');
        });
        
        // Functions
        highlighted = highlighted.replace(
            /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
            '<span class="token function">$1</span>('
        );
        
        // Operators
        highlighted = highlighted.replace(
            /([+\-*\/%=&lt;&gt;!&|^~])/g,
            '<span class="token operator">$1</span>'
        );
        
        return highlighted;
    }
    
    highlightAll() {
        document.querySelectorAll('pre code').forEach(block => {
            if (!block.classList.contains('highlighted')) {
                const code = block.textContent;
                block.innerHTML = this.highlight(code);
                block.classList.add('highlighted');
                
                // Add line numbers
                this.addLineNumbers(block);
                
                // Add copy button
                this.addCopyButton(block);
            }
        });
    }
    
    addLineNumbers(codeBlock) {
        const lines = codeBlock.innerHTML.split('\n');
        const numbersDiv = document.createElement('div');
        numbersDiv.className = 'line-numbers-rows';
        
        lines.forEach(() => {
            const span = document.createElement('span');
            numbersDiv.appendChild(span);
        });
        
        const wrapper = document.createElement('div');
        wrapper.className = 'line-numbers';
        wrapper.appendChild(numbersDiv);
        wrapper.appendChild(codeBlock.cloneNode(true));
        
        codeBlock.parentNode.replaceChild(wrapper, codeBlock);
    }
    
    addCopyButton(codeBlock) {
        const pre = codeBlock.closest('pre');
        if (!pre || pre.querySelector('.code-btn')) return;
        
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `
            <span class="code-language">C++</span>
            <div class="code-actions">
                <button class="code-btn copy" onclick="copyCode(this)">
                    📋 Копировать
                </button>
            </div>
        `;
        
        pre.insertBefore(header, pre.firstChild);
    }
}

// Copy code function
function copyCode(button) {
    const pre = button.closest('pre');
    const code = pre.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        button.classList.add('copied');
        button.innerHTML = '✅ Скопировано!';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '📋 Копировать';
        }, 2000);
    });
}

// Initialize highlighter
const highlighter = new CppHighlighter();
document.addEventListener('DOMContentLoaded', () => {
    highlighter.highlightAll();
});
