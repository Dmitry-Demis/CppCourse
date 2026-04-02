// ============================================
// STREAK MODAL + HEADER PROFILE MINI-CARD
// ============================================
(function () {
    'use strict';

    const FREEZE_MILESTONES = [3, 7, 14, 21, 35, 56, 84, 126, 189, 280, 420, 630];

    function nextMilestone(total) {
        return FREEZE_MILESTONES.find(m => m > total) ?? null;
    }

    // ── CSS ──────────────────────────────────────────────────────────────
    const CSS = `
/* ── Streak Modal ── */
.streak-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.65);
    z-index: 1100;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: streak-fade-in .25s ease both;
}
@keyframes streak-fade-in { from { opacity:0 } to { opacity:1 } }

.streak-modal {
    background: linear-gradient(160deg, #1e1e2e 0%, #181825 100%);
    border: 1px solid rgba(250,179,135,.25);
    border-radius: 20px;
    padding: 2rem 2.25rem 1.75rem;
    max-width: 360px; width: 100%;
    box-shadow: 0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(250,179,135,.08);
    text-align: center;
    animation: streak-pop .4s cubic-bezier(.34,1.56,.64,1) both;
    position: relative;
}
@keyframes streak-pop {
    from { opacity:0; transform: scale(.88) translateY(16px); }
    to   { opacity:1; transform: scale(1)   translateY(0); }
}

.streak-modal__fire {
    font-size: 3.5rem;
    display: block;
    margin-bottom: .5rem;
    animation: fire-pulse 1.2s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 12px rgba(250,179,135,.8));
}
@keyframes fire-pulse {
    from { transform: scale(1)   rotate(-4deg); filter: drop-shadow(0 0 8px rgba(250,179,135,.6)); }
    to   { transform: scale(1.1) rotate(4deg);  filter: drop-shadow(0 0 18px rgba(250,179,135,1)); }
}
.streak-modal__fire--frozen {
    animation: none;
    filter: drop-shadow(0 0 12px rgba(137,180,250,.8));
}

.streak-modal__count {
    font-size: 3rem; font-weight: 900;
    color: #fab387;
    font-family: 'JetBrains Mono', monospace;
    line-height: 1;
    margin-bottom: .2rem;
}
.streak-modal__label {
    font-size: .8rem; color: rgba(205,214,244,.5);
    margin-bottom: 1.25rem;
    text-transform: uppercase; letter-spacing: .06em;
}

.streak-modal__rewards {
    display: flex; gap: .75rem; justify-content: center;
    margin-bottom: 1.25rem; flex-wrap: wrap;
}
.streak-reward-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: .8rem; font-weight: 700;
    padding: 5px 12px; border-radius: 8px;
}
.streak-reward-badge--coins {
    background: rgba(249,226,175,.12);
    color: #f9e2af;
    border: 1px solid rgba(249,226,175,.25);
}
.streak-reward-badge--xp {
    background: rgba(166,227,161,.1);
    color: #a6e3a1;
    border: 1px solid rgba(166,227,161,.22);
}
.streak-reward-badge--milestone {
    background: rgba(203,166,247,.12);
    color: #cba6f7;
    border: 1px solid rgba(203,166,247,.25);
    font-size: .72rem;
}

.streak-modal__notice {
    font-size: .78rem; line-height: 1.5;
    padding: 8px 12px; border-radius: 8px;
    margin-bottom: 1.25rem;
}
.streak-modal__notice--freeze {
    background: rgba(137,180,250,.1);
    border: 1px solid rgba(137,180,250,.22);
    color: #89b4fa;
}
.streak-modal__notice--broken {
    background: rgba(243,139,168,.1);
    border: 1px solid rgba(243,139,168,.22);
    color: #f38ba8;
}

.streak-modal__meta {
    font-size: .72rem; color: rgba(205,214,244,.35);
    margin-bottom: 1.25rem;
}
.streak-modal__meta span { color: #f9e2af; font-weight: 700; }

.streak-modal__badges {
    display: flex; gap: 6px; justify-content: center;
    flex-wrap: wrap; margin-bottom: 1.25rem;
}
.streak-sm-badge {
    font-size: .65rem; font-weight: 700;
    padding: 2px 8px; border-radius: 5px;
}
.streak-sm-badge--freeze {
    background: rgba(137,180,250,.15); color: #89b4fa;
    border: 1px solid rgba(137,180,250,.3);
}
.streak-sm-badge--snow {
    background: rgba(148,226,213,.12); color: #94e2d5;
    border: 1px solid rgba(148,226,213,.25);
}

.streak-modal__btn {
    width: 100%;
    padding: .7rem 1.5rem;
    background: linear-gradient(135deg, #fab387 0%, #f9e2af 100%);
    color: #1e1e2e;
    border: none; border-radius: 10px;
    font-size: .95rem; font-weight: 800;
    cursor: pointer;
    transition: opacity .15s, transform .15s;
}
.streak-modal__btn:hover { opacity: .9; transform: translateY(-1px); }
.streak-modal__btn:active { transform: translateY(0); }

/* ── Header Mini Profile ── */
.header-profile-mini {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px;
    padding: 5px 12px 5px 6px;
    text-decoration: none;
    color: var(--text-primary, #cdd6f4);
    transition: background .15s, border-color .15s;
    cursor: pointer;
    flex-shrink: 0;
}
.header-profile-mini:hover {
    background: rgba(255,255,255,.09);
    border-color: rgba(203,166,247,.4);
    text-decoration: none;
    color: var(--text-primary, #cdd6f4);
}
.hpm-avatar {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: linear-gradient(135deg, #cba6f7, #89b4fa);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
}
.hpm-info { display: flex; flex-direction: column; gap: 3px; }
.hpm-name { font-size: .8rem; font-weight: 700; line-height: 1; white-space: nowrap; }
.hpm-level-row {
    display: flex; align-items: center; gap: 8px;
    font-size: .68rem; color: rgba(205,214,244,.55); white-space: nowrap;
}
.hpm-level-badge {
    font-size: .65rem; font-weight: 700;
    background: rgba(203,166,247,.15);
    color: #cba6f7;
    border: 1px solid rgba(203,166,247,.3);
    border-radius: 4px;
    padding: 1px 6px;
    white-space: nowrap;
}
.hpm-xp-bar-wrap { display: flex; align-items: center; gap: 5px; }
.hpm-xp-bar {
    width: 60px; height: 4px;
    background: rgba(255,255,255,.1);
    border-radius: 99px; overflow: hidden;
}
.hpm-xp-fill {
    height: 100%;
    background: linear-gradient(90deg, #cba6f7, #89b4fa);
    border-radius: 99px;
    transition: width .4s;
}
.hpm-xp-val { font-size: .62rem; color: #a78bfa; font-weight: 700; white-space: nowrap; }
.hpm-stats-row {
    display: flex; align-items: center; gap: 7px;
    font-size: .68rem; white-space: nowrap;
}
.hpm-coins  { font-weight: 700; color: #fde68a; }
.hpm-keys   { font-weight: 700; color: rgba(205,214,244,.7); }
.hpm-streak { font-weight: 700; color: #fab387; }

@media (max-width: 768px) {
    .hpm-xp-bar-wrap { display: none; }
    .hpm-stats-row { display: none; }
}
@media (max-width: 480px) {
    .streak-modal { padding: 1.5rem 1.25rem 1.25rem; }
    .streak-modal__count { font-size: 2.4rem; }
    .header-profile-mini { display: none; }
}`;

    function injectStyle() {
        if (document.getElementById('streak-css')) return;
        const s = document.createElement('style');
        s.id = 'streak-css';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    // ── Header mini profile ───────────────────────────────────────────────
    function renderHeaderProfile(profile) {
        // Remove old
        document.querySelectorAll('.header-profile-mini').forEach(el => el.remove());
        document.querySelectorAll('.header-profile-link').forEach(el => el.remove());

        const LEVEL_ICONS  = ['','🌱','📘','⚙️','💻','🔬','👑'];
        const LEVEL_TITLES = ['','Новичок','Ученик','Практикант','Программист','Эксперт','Мастер C++'];
        const level   = profile.level  ?? 1;
        const xp      = profile.xp     ?? 0;
        const coins   = profile.coins  ?? 0;
        const keys    = profile.keys   ?? 0;
        const streak  = profile.currentStreak ?? 0;
        const needed  = 500;
        const inLevel = xp % needed;
        const pct     = Math.min(inLevel / needed * 100, 100).toFixed(1);
        const icon    = LEVEL_ICONS[Math.min(level, LEVEL_ICONS.length - 1)] || '⭐';
        const title   = LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] || '';

        const mini = document.createElement('a');
        mini.href = (typeof _siteRoot !== 'undefined' ? _siteRoot : '') + 'profile.html';
        mini.className = 'header-profile-mini';
        mini.title = `${profile.firstName} ${profile.lastName} · Ур. ${level} · ${inLevel}/${needed} XP`;
        mini.innerHTML = `
            <div class="hpm-avatar">${icon}</div>
            <div class="hpm-info">
                <div class="hpm-name">${profile.firstName} ${profile.lastName}</div>
                <div class="hpm-level-row">
                    <span class="hpm-level-badge">Ур. ${level} · ${title}</span>
                    <div class="hpm-xp-bar-wrap">
                        <div class="hpm-xp-bar"><div class="hpm-xp-fill" style="width:${pct}%"></div></div>
                        <span class="hpm-xp-val">${inLevel}/${needed} XP</span>
                    </div>
                </div>
                <div class="hpm-stats-row">
                    <span class="hpm-coins">🪙 ${coins}</span>
                    <span class="hpm-keys">🗝️ ${keys}</span>
                    ${streak > 0 ? `<span class="hpm-streak">🔥 ${streak}</span>` : ''}
                </div>
            </div>`;

        // Insert before mobile-menu-btn (at the end of header-inner)
        const headerInner = document.querySelector('.header-inner');
        const mobileBtn = headerInner?.querySelector('.mobile-menu-btn');
        if (mobileBtn) {
            headerInner.insertBefore(mini, mobileBtn);
        } else if (headerInner) {
            headerInner.appendChild(mini);
        }
    }
    // Экспортируем глобально чтобы gamification.js мог вызвать после загрузки данных
    window.renderHeaderProfile = renderHeaderProfile;

    // ── Streak Modal ──────────────────────────────────────────────────────
    function renderModal(data, user) {
        injectStyle();

        const { currentStreak, freezeCount, snowflakeCount, usedFreeze, streakBroken,
                coinsReward, xpReward } = data;

        const isMilestone = currentStreak > 0 && currentStreak % 7 === 0;
        const fireEmoji = usedFreeze ? '🧊' : '🔥';
        const fireClass = `streak-modal__fire${usedFreeze ? ' streak-modal__fire--frozen' : ''}`;

        const totalDays = data.totalStreakDays ?? currentStreak;
        const next = nextMilestone(totalDays);
        const daysToNext = next ? next - totalDays : null;

        // Rewards row
        let rewardsHtml = '';
        if (coinsReward > 0 || xpReward > 0) {
            rewardsHtml = `<div class="streak-modal__rewards">`;
            if (coinsReward > 0) rewardsHtml += `<span class="streak-reward-badge streak-reward-badge--coins">🪙 +${coinsReward} монет</span>`;
            if (xpReward > 0)    rewardsHtml += `<span class="streak-reward-badge streak-reward-badge--xp">⭐ +${xpReward} XP</span>`;
            if (isMilestone)     rewardsHtml += `<span class="streak-reward-badge streak-reward-badge--milestone">🎉 ${currentStreak} дней!</span>`;
            rewardsHtml += `</div>`;
        }

        // Notice
        let noticeHtml = '';
        if (streakBroken) {
            noticeHtml = `<div class="streak-modal__notice streak-modal__notice--broken">💔 Стрик прерван — начинаем заново с 1 дня</div>`;
        } else if (usedFreeze) {
            noticeHtml = `<div class="streak-modal__notice streak-modal__notice--freeze">🧊 Заморозка использована — стрик сохранён!</div>`;
        }

        // Badges
        let badgesHtml = '';
        if (freezeCount > 0 || snowflakeCount > 0) {
            badgesHtml = `<div class="streak-modal__badges">`;
            if (freezeCount > 0)   badgesHtml += `<span class="streak-sm-badge streak-sm-badge--freeze">🧊 ×${freezeCount} заморозки</span>`;
            if (snowflakeCount > 0) badgesHtml += `<span class="streak-sm-badge streak-sm-badge--snow">❄️ ×${snowflakeCount} использовано</span>`;
            badgesHtml += `</div>`;
        }

        // Meta
        let metaHtml = '';
        if (daysToNext !== null) {
            metaHtml = `<div class="streak-modal__meta">До следующей заморозки: <span>${daysToNext} дн.</span></div>`;
        }

        const overlay = document.createElement('div');
        overlay.className = 'streak-overlay';
        overlay.id = 'streak-overlay';
        overlay.innerHTML = `
            <div class="streak-modal" role="dialog" aria-modal="true">
                <span class="${fireClass}">${fireEmoji}</span>
                <div class="streak-modal__count">${currentStreak}</div>
                <div class="streak-modal__label">дней подряд</div>
                ${rewardsHtml}
                ${noticeHtml}
                ${badgesHtml}
                ${metaHtml}
                <button class="streak-modal__btn" id="streak-accept-btn">Принять 🎯</button>
            </div>`;

        document.body.appendChild(overlay);

        const close = () => {
            overlay.style.animation = 'streak-fade-in .2s reverse both';
            setTimeout(() => overlay.remove(), 200);
            // Update localStorage coins/xp so player card reflects new values
            if (coinsReward > 0) {
                const prev = (() => { try { return JSON.parse(localStorage.getItem('gs_coins') || '0'); } catch { return 0; } })();
                localStorage.setItem('gs_coins', JSON.stringify(prev + coinsReward));
            }
            if (xpReward > 0) {
                const prev = (() => { try { return JSON.parse(localStorage.getItem('gs_xp') || '0'); } catch { return 0; } })();
                localStorage.setItem('gs_xp', JSON.stringify(prev + xpReward));
            }
            // Refresh header profile
            if (user) renderHeaderProfile(user);
        };

        document.getElementById('streak-accept-btn').addEventListener('click', close);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
        });
    }

    // ── Init ──────────────────────────────────────────────────────────────
    async function init() {
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (!user?.isuNumber) return;

        injectStyle();

        // Validate session against server — no localStorage fallback
        let profile;
        try {
            const profileRes = await fetch(`/api/profile/${user.isuNumber}`, {
                headers: { 'X-Isu-Number': user.isuNumber }
            });
            if (!profileRes.ok) {
                localStorage.removeItem('cpp_user');
                return;
            }
            profile = await profileRes.json();
        } catch {
            return; // offline — show nothing
        }

        renderHeaderProfile(profile);

        // Check streak once per calendar day
        const sessionKey = `streak_checked_${new Date().toDateString()}`;
        if (sessionStorage.getItem(sessionKey)) return;
        sessionStorage.setItem(sessionKey, '1');

        try {
            const res = await fetch(`/api/streak/${profile.isuNumber}`);
            if (!res.ok) return;
            const data = await res.json();

            // Only show modal if there's something to show
            const hasReward = (data.coinsReward ?? 0) > 0 || (data.xpReward ?? 0) > 0;
            const hasEvent  = data.usedFreeze || data.streakBroken;
            if (data.currentStreak > 0 && (hasReward || hasEvent)) {
                renderModal(data, profile);
            }
        } catch { /* offline */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 400);
    }
})();
