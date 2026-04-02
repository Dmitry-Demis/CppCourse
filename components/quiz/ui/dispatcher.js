// Диспетчер типов вопросов

import * as TypeSingle       from '../types/single.js';
import * as TypeMultiple     from '../types/multiple.js';
import * as TypeFill         from '../types/fill.js';
import * as TypeMatching     from '../types/matching.js';
import * as TypeFillCode     from '../types/fill-code.js';
import * as TypeFillCodeDrag from '../types/fill-code-drag.js';
import { escape, quizMd, shuffle } from './helpers.js';
import { get } from './templates.js';

const g = id => get(id);

export function buildNodes(q, quizId) {
    switch (q.type) {
        case 'single':
        case 'code':           return TypeSingle.buildNodes(q, quizId, g, escape, quizMd);
        case 'multiple':       return TypeMultiple.buildNodes(q, quizId, g, escape, quizMd);
        case 'fill':           return TypeFill.buildNodes(q, quizId, g);
        case 'matching':       return TypeMatching.buildNodes(q, quizId, g, escape, quizMd, shuffle);
        case 'fill-code':      return TypeFillCode.buildNodes(q, quizId, g);
        case 'fill-code-drag': return TypeFillCodeDrag.buildNodes(q, quizId, g, escape, quizMd, shuffle);
        default:               return [];
    }
}

export function attachListeners(q, container, checkBtn, quizId, onCorrect) {
    switch (q.type) {
        case 'single':
        case 'code':           return TypeSingle.attachListeners(q, container, checkBtn, onCorrect);
        case 'multiple':       return TypeMultiple.attachListeners(q, container, checkBtn, onCorrect);
        case 'fill':           return TypeFill.attachListeners(q, container, checkBtn, onCorrect);
        case 'matching':       return TypeMatching.attachListeners(q, container, checkBtn, quizId, onCorrect);
        case 'fill-code':      return TypeFillCode.attachListeners(q, container, checkBtn, onCorrect);
        case 'fill-code-drag': return TypeFillCodeDrag.attachListeners(q, container, checkBtn, quizId, onCorrect);
    }
}

export function submit(q, value, container, quizId) {
    switch (q.type) {
        case 'single':
        case 'code':           return TypeSingle.submit(q, value, container);
        case 'multiple':       return TypeMultiple.submit(q, value, container);
        case 'fill':           return TypeFill.submit(q, value, container);
        case 'matching':       return TypeMatching.submit(q, value, container, quizId, g);
        case 'fill-code':      return TypeFillCode.submit(q, value, container);
        case 'fill-code-drag': return TypeFillCodeDrag.submit(q, value, container, quizId, g);
        default:               return { isRight: false, earned: 0, extra: null };
    }
}
