// Загрузчик HTML-шаблонов

const _base = (() => {
    const url = import.meta?.url || '';
    // поднимаемся из ui/ до components/quiz/
    return url.replace(/ui\/[^/]+$/, '');
})();

const _files = [
    'templates/question-inline.html',
    'templates/question-modal.html',
    'templates/feedback-inline.html',
    'templates/feedback-modal.html',
    'templates/results-inline.html',
    'templates/results-modal.html',
    'templates/modal.html',
    'templates/types/single.html',
    'templates/types/multiple.html',
    'templates/types/fill.html',
    'templates/types/matching.html',
    'templates/types/fill-code.html',
    'templates/types/fill-code-drag.html',
];

let _loaded = false;
let _promise = null;

export function load() {
    if (_loaded) return Promise.resolve();
    if (_promise) return _promise;
    _promise = Promise.all(
        _files.map(f => fetch(_base + f).then(r => r.text()).catch(() => ''))
    ).then(htmls => {
        const div = document.createElement('div');
        div.style.display = 'none';
        div.innerHTML = htmls.join('\n');
        document.body.appendChild(div);
        _loaded = true;
    });
    return _promise;
}

export function get(id) {
    return document.getElementById(id);
}
