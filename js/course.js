// ============================================
// COURSE LOADER
// Reads course-meta.json, normalizes paragraphs,
// fetches titles from HTML <title> tags if missing.
// ============================================

let _courseCache = null;

/**
 * @param {string} [base=''] - path prefix to site root, e.g. '../../../'
 * @returns {Promise<{chapters: Array}>}
 */
async function loadCourseStructure(base = '') {
    if (_courseCache) return _courseCache;

    const res = await fetch(base + 'course-meta.json?v=' + Date.now());
    if (!res.ok) throw new Error('course-meta.json not found');
    const meta = await res.json();

    // Normalize paragraphs and fetch missing titles in parallel
    await Promise.all(meta.chapters.map(async ch => {
        const paras = (ch.paragraphs || []).map(p =>
            typeof p === 'string' ? { id: p, title: null, tests: [] } : { tests: [], ...p }
        );

        await Promise.all(paras.map(async p => {
            if (p.title) return;
            try {
                const r = await fetch(`${base}theory/${ch.id}/${ch.groupId}/${p.id}.html`);
                if (!r.ok) { p.title = p.id; return; }
                const text = await r.text();
                const m = text.match(/<title>(.*?)<\/title>/i);
                p.title = m ? m[1].replace(/\s*[—–-].*$/, '').trim() : p.id;
            } catch {
                p.title = p.id;
            }
        }));

        ch.paragraphs = paras;
    }));

    _courseCache = meta;
    return meta;
}
