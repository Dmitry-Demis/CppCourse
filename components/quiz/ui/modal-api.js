// window.openQuizModal / closeQuizModal

import { load, get } from './templates.js';
import { ModalQuiz } from './quiz-modal.js';
import { shuffle } from './helpers.js';

function fallbackPick(data) {
    const pick = Math.min(data.pick || data.questions.length, data.questions.length);
    return shuffle(data.questions.map(q => q.id)).slice(0, pick);
}

window.openQuizModal = async function(quizId) {
    let data;
    try {
        const res = await fetch(`/api/quiz/${quizId}`);
        if (!res.ok) throw new Error('not found');
        data = await res.json();
    } catch {
        const btn = document.querySelector(`[onclick*="openQuizModal('${quizId}'"]`);
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = '❌ Тест недоступен';
            btn.disabled = true;
            setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
        }
        return;
    }

    let pickedIds;
    try {
        const user    = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        const headers = user?.isuNumber ? { 'X-Isu-Number': user.isuNumber } : {};
        const res     = await fetch(`/api/quiz/${quizId}/pick-questions`, { headers });
        pickedIds = res.ok ? await res.json() : fallbackPick(data);
    } catch { pickedIds = fallbackPick(data); }

    await load();

    let overlay = document.getElementById('quiz-modal-overlay');
    if (!overlay) {
        const tpl = get('tpl-quiz-modal');
        if (tpl) {
            document.body.appendChild(tpl.content.cloneNode(true));
            overlay = document.getElementById('quiz-modal-overlay');
            overlay.querySelector('.js-modal-close')?.addEventListener('click', () => window.closeQuizModal(null));
        } else {
            overlay = document.createElement('div');
            overlay.id = 'quiz-modal-overlay';
            overlay.className = 'quiz-modal-overlay';
            const box = document.createElement('div');
            box.id = 'quiz-modal-box';
            box.className = 'quiz-modal-box';
            const closeBtn = document.createElement('button');
            closeBtn.className = 'quiz-modal-close js-modal-close';
            closeBtn.setAttribute('aria-label', 'Закрыть');
            closeBtn.textContent = '✕';
            closeBtn.addEventListener('click', () => window.closeQuizModal(null));
            const content = document.createElement('div');
            content.id = 'quiz-modal-content';
            box.append(closeBtn, content);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
        }
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    window._activeModalQuiz = new ModalQuiz(document.getElementById('quiz-modal-content'), data, pickedIds);
};

window.closeQuizModal = function(e) {
    if (e !== null && e !== undefined) return;
    // Сохраняем попытку если тест был прерван (не дошёл до экрана результатов)
    window._activeModalQuiz?._saveAbandoned();
    document.getElementById('quiz-modal-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    window._activeModalQuiz = null;
};

document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closeQuizModal(null); });
