/* ============================================
   GAMIFICATION SYSTEM
   Coins, XP, Quests, Daily reward, Reading time
   ============================================ */

// ── Storage helpers ──────────────────────────────────────────────────────────
const GS = {
    get: (k, def) => { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch { return def; } },
    set: (k, v)   => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── Quest definitions ─────────────────────────────────────────────────────────
const QUEST_DEFS = [
    // Daily
    { id: 'daily_code',    type: 'daily',   icon: '💻', name: 'Первый код дня',     desc: 'Запустите любой код',          target: 1,  reward: 30,  xp: 15 },
    { id: 'daily_read',    type: 'daily',   icon: '📖', name: 'Читатель',            desc: 'Прочитайте 5 минут',           target: 5,  reward: 40,  xp: 20 },
    { id: 'daily_quiz',    type: 'daily',   icon: '✎',  name: 'Проверь себя',        desc: 'Пройдите любой тест',          target: 1,  reward: 50,  xp: 25 },
    // Weekly
    { id: 'weekly_tests',  type: 'weekly',  icon: '🎯', name: 'Тестировщик',         desc: 'Пройдите 5 тестов за неделю', target: 5,  reward: 200, xp: 100 },
    { id: 'weekly_code',   type: 'weekly',  icon: '⚙️', name: 'Кодер недели',        desc: 'Запустите код 10 раз',         target: 10, reward: 150, xp: 75 },
    // Permanent challenges
    { id: 'ch_streak3',    type: 'challenge', icon: '🔥', name: '3 дня подряд',      desc: 'Заходите 3 дня подряд',        target: 3,  reward: 100, xp: 50 },
    { id: 'ch_streak7',    type: 'challenge', icon: '🔥', name: 'Неделя подряд',     desc: 'Заходите 7 дней подряд',       target: 7,  reward: 300, xp: 150 },
    { id: 'ch_tests10',    type: 'challenge', icon: '🏅', name: 'Знаток',            desc: 'Пройдите 10 тестов',           target: 10, reward: 250, xp: 125 },
    { id: 'ch_read60',     type: 'challenge', icon: '📚', name: 'Час знаний',        desc: 'Прочитайте 60 минут суммарно', target: 60, reward: 200, xp: 100 },
    { id: 'ch_code50',     type: 'challenge', icon: '💎', name: 'Мастер кода',       desc: 'Запустите код 50 раз',         target: 50, reward: 400, xp: 200 },
];

const ACHIEVEMENT_DEFS = [
    // First steps
    { id: 'first_code',   img: 'img/achievements/ach-first-code.svg',   name: 'Первый шаг',       desc: 'Запустите первый код',              reward: 50,   group: 'activity' },
    { id: 'first_quiz',   img: 'img/achievements/ach-first-quiz.svg',   name: 'Первый тест',      desc: 'Пройдите первый тест',              reward: 50,   group: 'activity' },
    // Streaks
    { id: 'streak3',      img: 'img/achievements/ach-streak3.svg',      name: '3 дня подряд',     desc: 'Streak 3 дня',                      reward: 100,  group: 'activity' },
    { id: 'streak7',      img: 'img/achievements/ach-streak7.svg',      name: 'Неделя',           desc: 'Streak 7 дней',                     reward: 300,  group: 'activity' },
    { id: 'streak14',     img: 'img/achievements/ach-streak14.svg',     name: 'Две недели',       desc: 'Streak 14 дней',                    reward: 500,  group: 'activity' },
    { id: 'streak30',     img: 'img/achievements/ach-streak30.svg',     name: 'Месяц',            desc: 'Streak 30 дней',                    reward: 1000, group: 'activity' },
    // Chapters
    { id: 'chapter1',     img: 'img/achievements/ach-chapter1.svg',     name: 'Основы освоены',   desc: 'Завершите главу 1',                 reward: 200,  group: 'chapters' },
    { id: 'chapter2',     img: 'img/achievements/ach-chapter2.svg',     name: 'Знаток типов',     desc: 'Завершите главу 2',                 reward: 200,  group: 'chapters' },
    { id: 'chapter3',     img: 'img/achievements/ach-chapter3.svg',     name: 'Мастер функций',   desc: 'Завершите главу 3',                 reward: 200,  group: 'chapters' },
    { id: 'chapter4',     img: 'img/achievements/ach-chapter4.svg',     name: 'Архитектор',       desc: 'Завершите главу 4',                 reward: 200,  group: 'chapters' },
    // Levels
    { id: 'level5',       img: 'img/achievements/ach-level5.svg',       name: 'Уровень 5',        desc: 'Достигните 5 уровня',               reward: 500,  group: 'progress' },
    { id: 'level10',      img: 'img/achievements/ach-level10.svg',      name: 'Уровень 10',       desc: 'Достигните 10 уровня',              reward: 1000, group: 'progress' },
    // Reading
    { id: 'read60',       img: 'img/achievements/ach-read60.svg',       name: 'Час знаний',       desc: '60 минут чтения',                   reward: 200,  group: 'activity' },
    { id: 'read300',      img: 'img/achievements/ach-read300.svg',      name: 'Книгочей',         desc: '5 часов чтения',                    reward: 600,  group: 'activity' },
    // Code
    { id: 'code50',       img: 'img/achievements/ach-code50.svg',       name: 'Мастер кода',      desc: '50 запусков кода',                  reward: 400,  group: 'code' },
    { id: 'code100',      img: 'img/achievements/ach-code100.svg',      name: 'Кодер',            desc: '100 запусков кода',                 reward: 800,  group: 'code' },
    // Tests
    { id: 'tests10',      img: 'img/achievements/ach-tests10.svg',      name: 'Знаток',           desc: '10 тестов пройдено',                reward: 250,  group: 'code' },
    { id: 'tests25',      img: 'img/achievements/ach-tests25.svg',      name: 'Испытатель',       desc: '25 тестов пройдено',                reward: 500,  group: 'code' },
    { id: 'perfect_quiz', img: 'img/achievements/ach-perfect.svg',      name: 'Перфекционист',    desc: 'Тест на 100%',                      reward: 150,  group: 'code' },
    // Special
    { id: 'night_owl',    img: 'img/achievements/ach-night-owl.svg',    name: 'Сова',             desc: 'Учитесь после полуночи',            reward: 100,  group: 'special' },
    { id: 'early_bird',   img: 'img/achievements/ach-early-bird.svg',   name: 'Жаворонок',        desc: 'Учитесь до 7 утра',                 reward: 100,  group: 'special' },
    { id: 'debugger',     img: 'img/achievements/ach-debugger.svg',     name: 'Отладчик',         desc: 'Исправьте ошибку компиляции',       reward: 150,  group: 'special' },
    { id: 'explorer',     img: 'img/achievements/ach-explorer.svg',     name: 'Исследователь',    desc: 'Откройте все разделы главы',        reward: 200,  group: 'special' },
    { id: 'comeback',     img: 'img/achievements/ach-comeback.svg',     name: 'Возвращение',      desc: 'Вернитесь после 7 дней отсутствия', reward: 100,  group: 'special' },
    { id: 'legend',       img: 'img/achievements/ach-legend.svg',       name: 'Легенда',          desc: 'Получите все достижения',           reward: 2000, group: 'special' },
];

// ── Main class ────────────────────────────────────────────────────────────────
class GameSystem {
    constructor() {
        // Coins/XP/level/keys загружаются с сервера в initFromServer()
        this.coins        = 0;
        this.keys         = 0;
        this.xp           = 0;
        this.level        = 1;
        this.achievements = []; // загружается с сервера
        this.quests       = this._initQuests();
        this._checkDailyReset();
        this._checkDailyReward();
        this.init();
    }

    init() {
        this._buildHUD();
        this._checkTimeAchievements();
        // Загружаем актуальные данные с сервера
        this._loadFromServer();
    }

    async _loadFromServer() {
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (!user?.isuNumber) return;
        try {
            const res = await fetch(`/api/profile/${user.isuNumber}`, {
                headers: { 'X-Isu-Number': user.isuNumber }
            });
            if (!res.ok) return;
            const profile = await res.json();
            this.coins = profile.coins ?? 0;
            this.keys  = profile.keys  ?? 0;
            this.xp    = profile.xp    ?? 0;
            this.level = profile.level ?? 1;
            this._updateHUD();
            // Обновляем плашку в хедере актуальными данными с сервера
            if (typeof window.renderHeaderProfile === 'function') {
                window.renderHeaderProfile(profile);
            }
        } catch {}

        // Загружаем достижения
        try {
            const res = await fetch(`/api/achievements/${user.isuNumber}`);
            if (res.ok) {
                const data = await res.json();
                this.achievements = data.map(a => a.achievementId);
            }
        } catch {}
    }

    // ── HUD ──────────────────────────────────────────────────────────────────
    _buildHUD() {
        if (document.getElementById('gs-hud')) return;
        if (document.body.classList.contains('landing-page')) return;
        // HUD скрыт — данные хранятся в DOM, отображение идёт через .header-profile-mini
        const hud = document.createElement('div');
        hud.id = 'gs-hud';
        hud.style.display = 'none';
        hud.innerHTML = `
            <div class="gs-hud-inner">
                <div class="gs-coins" title="Монеты">🪙 <span id="gs-coins-val">${this.coins}</span></div>
                <div class="gs-coins gs-keys" title="Ключи">🗝️ <span id="gs-keys-val">${this.keys}</span></div>
                <div class="gs-xp-wrap" title="Опыт">
                    <span class="gs-xp-label">Ур.${this.level}</span>
                    <div class="gs-xp-bar"><div class="gs-xp-fill" id="gs-xp-fill"></div></div>
                    <span class="gs-xp-val" id="gs-xp-val"></span>
                </div>
            </div>`;
        document.body.appendChild(hud);
        this._updateHUD();
    }

    _updateHUD() {
        const coinsEl = document.getElementById('gs-coins-val');
        const keysEl  = document.getElementById('gs-keys-val');
        const fillEl  = document.getElementById('gs-xp-fill');
        const valEl   = document.getElementById('gs-xp-val');
        const lblEl   = document.querySelector('.gs-xp-label');
        if (coinsEl) coinsEl.textContent = this.coins;
        if (keysEl)  keysEl.textContent  = this.keys;
        const inLevel = this._xpInLevel();
        const needed  = 500;
        if (fillEl)  fillEl.style.width = Math.min(inLevel / needed * 100, 100) + '%';
        if (valEl)   valEl.textContent  = `${inLevel}/${needed}`;
        if (lblEl)   lblEl.textContent  = `Ур.${this.level}`;

        // Синхронизируем .header-profile-mini
        const mini = document.querySelector('.header-profile-mini');
        if (mini) {
            const hpmCoins = mini.querySelector('.hpm-coins');
            const hpmKeys  = mini.querySelector('.hpm-keys');
            const hpmXpVal = mini.querySelector('.hpm-xp-val');
            const hpmXpFill = mini.querySelector('.hpm-xp-fill');
            const hpmLvl   = mini.querySelector('.hpm-level-badge');
            const LEVEL_TITLES = ['','Новичок','Ученик','Практикант','Программист','Эксперт','Мастер C++'];
            const title = LEVEL_TITLES[Math.min(this.level, LEVEL_TITLES.length - 1)] || '';
            if (hpmCoins)   hpmCoins.textContent  = `🪙 ${this.coins}`;
            if (hpmKeys)    hpmKeys.textContent   = `🗝️ ${this.keys}`;
            if (hpmXpVal)   hpmXpVal.textContent  = `${inLevel}/${needed} XP`;
            if (hpmXpFill)  hpmXpFill.style.width = Math.min(inLevel / needed * 100, 100) + '%';
            if (hpmLvl)     hpmLvl.textContent    = `Ур. ${this.level} · ${title}`;
        }
    }

    _xpNeeded() { return this.level * 500; }

    _xpInLevel() { return this.xp % 500; }

    // ── Quests panel ─────────────────────────────────────────────────────────
    _buildQuestsPanel() {
        if (document.getElementById('gs-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'gs-panel';
        panel.innerHTML = `
            <div class="gs-panel-header">
                <span>🎯 Квесты</span>
                <button class="gs-panel-close" id="gs-panel-close">✕</button>
            </div>
            <div id="gs-daily-reward"></div>
            <div id="gs-quests-list"></div>`;
        document.body.appendChild(panel);
        document.getElementById('gs-panel-close').addEventListener('click', () => this._toggleQuestsPanel(false));
        this._renderQuests();
        this._renderDailyReward();
    }

    _toggleQuestsPanel(force) {
        const panel = document.getElementById('gs-panel');
        if (!panel) return;
        const open = force !== undefined ? force : !panel.classList.contains('open');
        panel.classList.toggle('open', open);
    }

    _renderDailyReward() {
        const el = document.getElementById('gs-daily-reward');
        if (!el) return;
        const claimed = GS.get('gs_daily_claimed', '');
        const today   = new Date().toDateString();
        if (claimed === today) {
            el.innerHTML = `<div class="gs-daily claimed">✅ Ежедневная награда получена</div>`;
        } else {
            el.innerHTML = `<div class="gs-daily">
                <span>🎁 Ежедневная награда</span>
                <button class="gs-claim-btn" id="gs-claim-btn">Забрать +50🪙</button>
            </div>`;
            document.getElementById('gs-claim-btn')?.addEventListener('click', () => this._claimDaily());
        }
    }

    _claimDaily() {
        const today = new Date().toDateString();
        GS.set('gs_daily_claimed', today);
        this.earnCoins(50, 'ежедневная награда');
        this.earnKeys(1, 'ежедневная награда');
        this._renderDailyReward();
    }

    _renderQuests() {
        const el = document.getElementById('gs-quests-list');
        if (!el) return;
        const progress = GS.get('gs_quest_progress', {});
        const done     = GS.get('gs_quest_done', []);

        const groups = { daily: [], weekly: [], challenge: [] };
        QUEST_DEFS.forEach(q => {
            if (q.type in groups) groups[q.type].push(q);
        });

        const labels = { daily: '📅 Ежедневные', weekly: '📆 Еженедельные', challenge: '🏆 Испытания' };
        let html = '';
        for (const [type, quests] of Object.entries(groups)) {
            html += `<div class="gs-quest-group-title">${labels[type]}</div>`;
            quests.forEach(q => {
                const cur  = progress[q.id] || 0;
                const isDone = done.includes(q.id);
                const pct  = Math.min(cur / q.target * 100, 100);
                html += `<div class="gs-quest-item ${isDone ? 'done' : ''}">
                    <div class="gs-qi-top">
                        <span class="gs-qi-icon">${q.icon}</span>
                        <span class="gs-qi-name">${q.name}</span>
                        <span class="gs-qi-reward">+${q.reward}🪙</span>
                    </div>
                    <div class="gs-qi-desc">${q.desc}</div>
                    <div class="gs-qi-bar-wrap">
                        <div class="gs-qi-bar"><div class="gs-qi-fill" style="width:${pct}%"></div></div>
                        <span class="gs-qi-count">${isDone ? '✓' : `${cur}/${q.target}`}</span>
                    </div>
                </div>`;
            });
        }
        el.innerHTML = html;
    }

    // ── Economy ───────────────────────────────────────────────────────────────
    earnCoins(amount, reason = '') {
        this.coins += amount;
        this._updateHUD();
        this._toast(`+${amount} 🪙`, reason);
    }

    earnKeys(amount, reason = '') {
        this.keys += amount;
        this._updateHUD();
        this._toast(`+${amount} 🗝️`, reason);
    }

    earnXP(amount) {
        this.xp += amount;
        const needed = this._xpNeeded();
        if (this.xp >= needed) {
            this.xp -= needed;
            this.level++;
            this._toast(`🎉 Уровень ${this.level}!`, 'Новый уровень');
            this.earnCoins(this.level * 50, 'за уровень');
            if (this.level >= 5)  this._checkAchievement('level5', true);
            if (this.level >= 10) this._checkAchievement('level10', true);
        }
        this._updateHUD();
    }

    // ── Quest progress ────────────────────────────────────────────────────────
    trackEvent(eventId, amount = 1) {
        const progress = GS.get('gs_quest_progress', {});
        const done     = GS.get('gs_quest_done', []);

        QUEST_DEFS.forEach(q => {
            if (done.includes(q.id)) return;
            // Map event → quest
            const matches = (
                (eventId === 'code_run'   && (q.id === 'daily_code' || q.id === 'weekly_code' || q.id === 'ch_code50')) ||
                (eventId === 'read_min'   && (q.id === 'daily_read' || q.id === 'ch_read60')) ||
                (eventId === 'quiz_done'  && (q.id === 'daily_quiz' || q.id === 'weekly_tests' || q.id === 'ch_tests10')) ||
                (eventId === 'streak'     && (q.id === 'ch_streak3' || q.id === 'ch_streak7'))
            );
            if (!matches) return;

            progress[q.id] = (progress[q.id] || 0) + amount;
            if (progress[q.id] >= q.target) {
                progress[q.id] = q.target;
                done.push(q.id);
                GS.set('gs_quest_done', done);
                this.earnCoins(q.reward, `квест: ${q.name}`);
                this.earnXP(q.xp);
                this._toast(`🎯 Квест выполнен!`, q.name);
            }
        });

        GS.set('gs_quest_progress', progress);
        this._renderQuests();
    }

    // ── Achievements ──────────────────────────────────────────────────────────
    _checkAchievement(id, condition) {
        if (!condition || this.achievements.includes(id)) return;
        this.achievements.push(id);

        // Сохраняем на сервер
        const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
        if (user?.isuNumber) {
            fetch(`/api/achievements/${user.isuNumber}/unlock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievementId: id })
            }).catch(() => {});
        }

        const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
        if (def) {
            this.earnCoins(def.reward, `достижение: ${def.name}`);
            this._toast(`🏆 ${def.name}`, def.desc);
        }
        // Check legend
        if (ACHIEVEMENT_DEFS.every(a => this.achievements.includes(a.id)))
            this._checkAchievement('legend', true);
    }

    _checkTimeAchievements() {
        const h = new Date().getHours();
        if (h >= 0 && h < 4)  this._checkAchievement('night_owl', true);
        if (h >= 5 && h < 7)  this._checkAchievement('early_bird', true);
    }

    // ── Public event hooks ────────────────────────────────────────────────────
    onCodeRun() {
        const runs = GS.get('gs_code_runs', 0) + 1;
        GS.set('gs_code_runs', runs);
        this.earnXP(10);
        this.earnCoins(5, 'запуск кода');
        this.trackEvent('code_run');
        if (runs === 1)   this._checkAchievement('first_code', true);
        if (runs >= 50)   this._checkAchievement('code50', true);
        if (runs >= 100)  this._checkAchievement('code100', true);
    }

    onQuizComplete(pct) {
        const total = GS.get('gs_quizzes_done', 0) + 1;
        GS.set('gs_quizzes_done', total);
        const coins = Math.round(pct * 0.5);
        const xp    = Math.round(pct * 0.3);
        this.earnCoins(coins, 'тест');
        this.earnXP(xp);
        this.trackEvent('quiz_done');
        if (total === 1)   this._checkAchievement('first_quiz', true);
        if (total >= 10)   this._checkAchievement('tests10', true);
        if (total >= 25)   this._checkAchievement('tests25', true);
        if (pct === 100)   this._checkAchievement('perfect_quiz', true);
    }

    onReadMinute() {
        this.trackEvent('read_min');
        const total = GS.get('gs_read_mins', 0) + 1;
        GS.set('gs_read_mins', total);
        if (total >= 60) this._checkAchievement('read60', true);
    }

    onStreakUpdate(streak) {
        if (streak >= 3)  this._checkAchievement('streak3', true);
        if (streak >= 7)  this._checkAchievement('streak7', true);
        if (streak >= 14) this._checkAchievement('streak14', true);
        if (streak >= 30) this._checkAchievement('streak30', true);
        const progress = GS.get('gs_quest_progress', {});
        progress['ch_streak3'] = Math.min(streak, 3);
        progress['ch_streak7'] = Math.min(streak, 7);
        GS.set('gs_quest_progress', progress);
        this._renderQuests();
    }

    // ── Daily reset ───────────────────────────────────────────────────────────
    _checkDailyReset() {
        const last  = GS.get('gs_last_reset', '');
        const today = new Date().toDateString();
        if (last === today) return;
        GS.set('gs_last_reset', today);
        // Reset daily quest progress
        const progress = GS.get('gs_quest_progress', {});
        const done     = GS.get('gs_quest_done', []);
        QUEST_DEFS.filter(q => q.type === 'daily').forEach(q => {
            delete progress[q.id];
            const i = done.indexOf(q.id);
            if (i !== -1) done.splice(i, 1);
        });
        GS.set('gs_quest_progress', progress);
        GS.set('gs_quest_done', done);
    }

    _checkWeeklyReset() {
        const last  = GS.get('gs_last_week_reset', 0);
        const now   = Date.now();
        if (now - last < 7 * 86400000) return;
        GS.set('gs_last_week_reset', now);
        const progress = GS.get('gs_quest_progress', {});
        const done     = GS.get('gs_quest_done', []);
        QUEST_DEFS.filter(q => q.type === 'weekly').forEach(q => {
            delete progress[q.id];
            const i = done.indexOf(q.id);
            if (i !== -1) done.splice(i, 1);
        });
        GS.set('gs_quest_progress', progress);
        GS.set('gs_quest_done', done);
    }

    _checkDailyReward() {
        // Auto-show panel hint if not claimed today
        const claimed = GS.get('gs_daily_claimed', '');
        const today   = new Date().toDateString();
        if (claimed !== today) {
            setTimeout(() => {
                const btn = document.getElementById('gs-quests-btn');
                if (btn) btn.classList.add('gs-pulse');
            }, 1500);
        }
    }

    // ── Toast ─────────────────────────────────────────────────────────────────
    _toast(title, msg) {
        const t = document.createElement('div');
        t.className = 'gs-toast';
        t.innerHTML = `<strong>${title}</strong>${msg ? `<br><span>${msg}</span>` : ''}`;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2800);
    }

    // ── Quest init ────────────────────────────────────────────────────────────
    _initQuests() { return QUEST_DEFS; }
}

// ── Reading time tracker ──────────────────────────────────────────────────────
class ReadingTracker {
    constructor(gs) {
        this.gs        = gs;
        this.active    = false;
        this.lastTick  = 0;
        this.pageKey   = 'gs_read_page_' + location.pathname.replace(/\W/g, '_');
        this._bind();
        this._tick();
    }

    _bind() {
        const activate   = () => { this.active = true;  this.lastTick = Date.now(); };
        const deactivate = () => { this.active = false; };
        document.addEventListener('mousemove',   activate,   { passive: true });
        document.addEventListener('keydown',     activate,   { passive: true });
        document.addEventListener('scroll',      activate,   { passive: true });
        document.addEventListener('visibilitychange', () => {
            document.hidden ? deactivate() : activate();
        });
        // Deactivate after 30s of no movement
        setInterval(() => {
            if (this.active && Date.now() - this.lastTick > 30000) deactivate();
        }, 5000);
    }

    _tick() {
        this._sessionSecs  = 0;
        this._codeWasRun   = false;
        this._paused       = false;
        this._scrollPixels = 0;
        this._lastScrollY  = window.scrollY;

        // Track scroll pixels
        document.addEventListener('scroll', () => {
            const current = window.scrollY;
            const delta = Math.abs(current - this._lastScrollY);
            this._scrollPixels += delta;
            this._lastScrollY = current;
        }, { passive: true });

        // Track code runs during this session
        const origOnCodeRun = this.gs.onCodeRun.bind(this.gs);
        this.gs.onCodeRun = () => { this._codeWasRun = true; origOnCodeRun(); };

        setInterval(() => {
            if (!this.active || this._paused || document.hidden || window._quizActive) return;
            // Session timer
            this._sessionSecs++;

            // Track per-page time
            const pageMins = GS.get(this.pageKey, 0) + (1/60);
            GS.set(this.pageKey, pageMins);
            // Fire every full minute
            const totalSecs = GS.get('gs_read_secs', 0) + 1;
            GS.set('gs_read_secs', totalSecs);
            if (totalSecs % 60 === 0) this.gs.onReadMinute();
        }, 1000);

        // Пауза при потере фокуса мыши (курсор ушёл с вкладки)
        document.addEventListener('mouseleave', () => { this._paused = true; });
        document.addEventListener('mouseenter', () => { this._paused = false; });

        // Завершить сессию при скрытии вкладки (переключение / закрытие)
        const sendSession = () => {
            if (this._sessionSecs < 15) return; // ignore < 15 sec visits
            const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
            if (!user?.isuNumber) return;

            // paragraphId = filename without extension
            // e.g. /theory/chapter-1/basics/program-structure.html → "program-structure"
            const parts = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
            const lastPart = parts[parts.length - 1] || '';
            const paragraphId = lastPart.replace(/\.html$/, '') || 'unknown';

            const payload = JSON.stringify({
                paragraphId,
                timeSpent: this._sessionSecs,
                codeWasRun: this._codeWasRun,
                scrollPixels: this._scrollPixels
            });

            this._sessionSecs  = 0;
            this._scrollPixels = 0;

            const url = '/api/reading/complete';
            const headers = { 'Content-Type': 'application/json', 'X-Isu-Number': user.isuNumber };
            fetch(url, {
                method: 'POST',
                headers,
                body: payload,
                keepalive: true
            }).catch(() => {});
        };

        // Переключение вкладки — сразу завершаем сессию
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                sendSession();
                this._paused = true;
            } else {
                this._paused = false;
            }
        });

        window.addEventListener('pagehide',      sendSession);
        window.addEventListener('beforeunload',  sendSession);
    }
}

// ── Init ──────────────────────────────────────────────────────────────────────
let gameSystem;
document.addEventListener('DOMContentLoaded', () => {
    gameSystem = new GameSystem();
    new ReadingTracker(gameSystem);

    // Streak sync is handled by streak.js via server data — no localStorage needed here
});

// После завершения теста — перезагружаем данные с сервера (coins/xp обновились)
window.addEventListener('quizCompleted', () => {
    if (gameSystem) gameSystem._loadFromServer();
});

// Global helper for external callers (e.g. index.html player card)
window.openQuestsPanel = () => {
    if (gameSystem) gameSystem._toggleQuestsPanel(true);
};
