/* ============================================
   GAMIFICATION SYSTEM - Game Logic
   ============================================ */

class GameSystem {
    constructor() {
        // this.coins = parseInt(localStorage.getItem('cpp_coins') || '0');
        // this.xp = parseInt(localStorage.getItem('cpp_xp') || '0');
        // this.level = parseInt(localStorage.getItem('cpp_level') || '1');
        // this.achievements = JSON.parse(localStorage.getItem('cpp_achievements') || '[]');
        // this.quests = this.initializeQuests();
        
        // this.init();
    }
    
    init() {
        this.createHUD();
        this.createQuestsPanel();
        this.createAchievementsModal();
        this.updateDisplay();
        this.checkDailyReset();
    }
    
    // ============================================
    // HUD Creation
    // ============================================
    createHUD() {
        const hud = document.createElement('div');
        hud.className = 'game-hud';
        hud.innerHTML = `
            <div class="coin-counter">
                <div class="coin-icon">⭐</div>
                <div class="coin-amount">${this.coins}</div>
            </div>
            <div class="xp-container">
                <div class="xp-header">
                    <div class="xp-level">Уровень ${this.level}</div>
                    <div class="xp-text">${this.xp}/${this.getXPForNextLevel()} XP</div>
                </div>
                <div class="xp-bar">
                    <div class="xp-fill" style="width: ${this.getXPPercentage()}%"></div>
                </div>
            </div>
        `;
        document.body.appendChild(hud);
    }
    
    // ============================================
    // Quests Panel
    // ============================================
    initializeQuests() {
        const savedQuests = localStorage.getItem('cpp_quests');
        if (savedQuests) {
            return JSON.parse(savedQuests);
        }
        
        return [
            {
                id: 'daily_1',
                type: 'daily',
                name: 'Первый код дня',
                description: 'Запустите любой код',
                progress: 0,
                target: 1,
                reward: 50,
                completed: false
            },
            {
                id: 'daily_2',
                type: 'daily',
                name: 'Исследователь',
                description: 'Прочитайте 3 параграфа',
                progress: 0,
                target: 3,
                reward: 100,
                completed: false
            },
            {
                id: 'weekly_1',
                type: 'weekly',
                name: 'Мастер типов',
                description: 'Изучите все фундаментальные типы',
                progress: 0,
                target: 5,
                reward: 500,
                completed: false
            },
            {
                id: 'challenge_1',
                type: 'challenge',
                name: 'Перфекционист',
                description: 'Запустите код без ошибок 10 раз',
                progress: 0,
                target: 10,
                reward: 1000,
                completed: false
            }
        ];
    }
    
    createQuestsPanel() {
        const panel = document.createElement('div');
        panel.className = 'quests-panel';
        panel.innerHTML = `
            <div class="quests-header">
                <div class="quests-icon">🎯</div>
                <div class="quests-title">Квесты</div>
            </div>
            <div class="quests-list" id="questsList"></div>
        `;
        document.body.appendChild(panel);
        this.updateQuestsList();
    }
    
    updateQuestsList() {
        const list = document.getElementById('questsList');
        if (!list) return;
        
        list.innerHTML = this.quests.map(quest => `
            <div class="quest-item ${quest.completed ? 'completed' : ''}" data-quest-id="${quest.id}">
                <div class="quest-header">
                    <span class="quest-type ${quest.type}">${this.getQuestTypeLabel(quest.type)}</span>
                    <span class="quest-name">${quest.name}</span>
                </div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-progress">
                    <div class="quest-bar">
                        <div class="quest-bar-fill" style="width: ${(quest.progress / quest.target) * 100}%"></div>
                    </div>
                    <div class="quest-reward">
                        <span>⭐</span>
                        <span>+${quest.reward}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    getQuestTypeLabel(type) {
        const labels = {
            'daily': 'Ежедневно',
            'weekly': 'Неделя',
            'challenge': 'Вызов'
        };
        return labels[type] || type;
    }
    
    // ============================================
    // Achievements Modal
    // ============================================
    createAchievementsModal() {
        const btn = document.createElement('button');
        btn.className = 'achievements-btn';
        btn.innerHTML = '🏆';
        btn.onclick = () => this.openAchievements();
        document.body.appendChild(btn);
        
        const modal = document.createElement('div');
        modal.className = 'achievements-modal';
        modal.id = 'achievementsModal';
        modal.innerHTML = `
            <div class="achievements-content">
                <button class="close-modal" onclick="gameSystem.closeAchievements()">×</button>
                <div class="achievements-header">
                    <h2>🏆 Достижения 🏆</h2>
                    <div class="achievements-stats">
                        <div class="stat-item">
                            <div class="stat-value">${this.achievements.length}</div>
                            <div class="stat-label">Получено</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.level}</div>
                            <div class="stat-label">Уровень</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.coins}</div>
                            <div class="stat-label">Монет</div>
                        </div>
                    </div>
                </div>
                <div class="achievements-grid" id="achievementsGrid"></div>
            </div>
        `;
        document.body.appendChild(modal);
        this.updateAchievementsGrid();
    }
    
    updateAchievementsGrid() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;
        
        const allAchievements = [
            { id: 'first_code', icon: '🚀', name: 'Первый шаг', description: 'Запустите первый код', reward: 100 },
            { id: 'code_master', icon: '💻', name: 'Мастер кода', description: 'Запустите 50 программ', reward: 500 },
            { id: 'reader', icon: '📚', name: 'Книжный червь', description: 'Прочитайте 10 параграфов', reward: 300 },
            { id: 'speed_learner', icon: '⚡', name: 'Быстрый ученик', description: 'Завершите главу за день', reward: 1000 },
            { id: 'perfectionist', icon: '✨', name: 'Перфекционист', description: 'Код без ошибок 20 раз', reward: 800 },
            { id: 'night_owl', icon: '🦉', name: 'Сова', description: 'Учитесь после полуночи', reward: 200 },
            { id: 'early_bird', icon: '🐦', name: 'Жаворонок', description: 'Учитесь до 6 утра', reward: 200 },
            { id: 'week_streak', icon: '🔥', name: 'Неделя подряд', description: 'Учитесь 7 дней подряд', reward: 1500 },
            { id: 'cpp_expert', icon: '🎓', name: 'Эксперт C++', description: 'Достигните 10 уровня', reward: 2000 },
            { id: 'coin_collector', icon: '💰', name: 'Коллекционер', description: 'Соберите 5000 монет', reward: 500 },
            { id: 'quest_hunter', icon: '🎯', name: 'Охотник за квестами', description: 'Выполните 20 квестов', reward: 1000 },
            { id: 'legend', icon: '👑', name: 'Легенда', description: 'Получите все достижения', reward: 5000 }
        ];
        
        grid.innerHTML = allAchievements.map(achievement => {
            const unlocked = this.achievements.includes(achievement.id);
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-reward">
                        <span>⭐</span>
                        <span>+${achievement.reward}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    openAchievements() {
        document.getElementById('achievementsModal').classList.add('active');
    }
    
    closeAchievements() {
        document.getElementById('achievementsModal').classList.remove('active');
    }
    
    // ============================================
    // Game Actions
    // ============================================
    earnCoins(amount, reason = '') {
        this.coins += amount;
        localStorage.setItem('cpp_coins', this.coins);
        this.updateDisplay();
        this.showNotification('💰 Монеты получены!', `+${amount} монет ${reason}`);
        
        // Coin animation
        const coinCounter = document.querySelector('.coin-counter');
        if (coinCounter) {
            coinCounter.classList.add('coin-earned');
            setTimeout(() => coinCounter.classList.remove('coin-earned'), 600);
        }
    }
    
    earnXP(amount, reason = '') {
        this.xp += amount;
        const xpNeeded = this.getXPForNextLevel();
        
        if (this.xp >= xpNeeded) {
            this.levelUp();
        }
        
        localStorage.setItem('cpp_xp', this.xp);
        this.updateDisplay();
        this.showNotification('⚡ Опыт получен!', `+${amount} XP ${reason}`);
    }
    
    levelUp() {
        this.level++;
        this.xp = 0;
        localStorage.setItem('cpp_level', this.level);
        this.showNotification('🎉 Новый уровень!', `Поздравляем! Вы достигли ${this.level} уровня!`);
        this.earnCoins(this.level * 100, 'за новый уровень');
        
        // Visual effects
        if (window.effects) {
            effects.showLevelUp(this.level);
        }
        
        // Check for level achievements
        if (this.level === 10) {
            this.unlockAchievement('cpp_expert');
        }
    }
    
    getXPForNextLevel() {
        return this.level * 100;
    }
    
    getXPPercentage() {
        return (this.xp / this.getXPForNextLevel()) * 100;
    }
    
    updateDisplay() {
        // Update coin counter
        const coinAmount = document.querySelector('.coin-amount');
        if (coinAmount) coinAmount.textContent = this.coins;
        
        // Update XP bar
        const xpLevel = document.querySelector('.xp-level');
        const xpText = document.querySelector('.xp-text');
        const xpFill = document.querySelector('.xp-fill');
        
        if (xpLevel) xpLevel.textContent = `Уровень ${this.level}`;
        if (xpText) xpText.textContent = `${this.xp}/${this.getXPForNextLevel()} XP`;
        if (xpFill) xpFill.style.width = `${this.getXPPercentage()}%`;
    }
    
    // ============================================
    // Quest System
    // ============================================
    updateQuest(questId, progress = 1) {
        const quest = this.quests.find(q => q.id === questId);
        if (!quest || quest.completed) return;
        
        quest.progress += progress;
        
        if (quest.progress >= quest.target) {
            quest.completed = true;
            this.earnCoins(quest.reward, 'за квест');
            this.earnXP(quest.reward / 2, 'за квест');
            this.showNotification('🎯 Квест выполнен!', quest.name);
        }
        
        localStorage.setItem('cpp_quests', JSON.stringify(this.quests));
        this.updateQuestsList();
    }
    
    checkDailyReset() {
        const lastReset = localStorage.getItem('cpp_last_reset');
        const today = new Date().toDateString();
        
        if (lastReset !== today) {
            // Reset daily quests
            this.quests.forEach(quest => {
                if (quest.type === 'daily') {
                    quest.progress = 0;
                    quest.completed = false;
                }
            });
            localStorage.setItem('cpp_last_reset', today);
            localStorage.setItem('cpp_quests', JSON.stringify(this.quests));
        }
    }
    
    // ============================================
    // Achievement System
    // ============================================
    unlockAchievement(achievementId) {
        if (this.achievements.includes(achievementId)) return;
        
        this.achievements.push(achievementId);
        localStorage.setItem('cpp_achievements', JSON.stringify(this.achievements));
        
        const achievementData = {
            'first_code': { name: 'Первый шаг', reward: 100, icon: '🚀' },
            'code_master': { name: 'Мастер кода', reward: 500, icon: '💻' },
            'reader': { name: 'Книжный червь', reward: 300, icon: '📚' },
            'speed_learner': { name: 'Быстрый ученик', reward: 1000, icon: '⚡' },
            'perfectionist': { name: 'Перфекционист', reward: 800, icon: '✨' },
            'night_owl': { name: 'Сова', reward: 200, icon: '🦉' },
            'early_bird': { name: 'Жаворонок', reward: 200, icon: '🐦' },
            'week_streak': { name: 'Неделя подряд', reward: 1500, icon: '🔥' },
            'cpp_expert': { name: 'Эксперт C++', reward: 2000, icon: '🎓' },
            'coin_collector': { name: 'Коллекционер', reward: 500, icon: '💰' },
            'quest_hunter': { name: 'Охотник за квестами', reward: 1000, icon: '🎯' },
            'legend': { name: 'Легенда', reward: 5000, icon: '👑' }
        };
        
        const achievement = achievementData[achievementId];
        if (achievement) {
            this.earnCoins(achievement.reward, 'за достижение');
            this.showNotification('🏆 Достижение разблокировано!', achievement.name);
            
            // Visual effects
            if (window.effects) {
                effects.showAchievementUnlock(achievement.icon, achievement.name, achievement.reward);
            }
        }
        
        this.updateAchievementsGrid();
    }
    
    // ============================================
    // Notifications
    // ============================================
    showNotification(title, message) {
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.innerHTML = `
            <div class="notification-icon">🎉</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    // ============================================
    // Event Tracking
    // ============================================
    onCodeRun() {
        this.earnXP(10, 'за запуск кода');
        this.earnCoins(5, 'за запуск кода');
        this.updateQuest('daily_1');
        this.updateQuest('challenge_1');
        
        // Check for first code achievement
        const codeRuns = parseInt(localStorage.getItem('cpp_code_runs') || '0') + 1;
        localStorage.setItem('cpp_code_runs', codeRuns);
        
        if (codeRuns === 1) {
            this.unlockAchievement('first_code');
        } else if (codeRuns === 50) {
            this.unlockAchievement('code_master');
        }
    }
    
    onPageRead() {
        this.earnXP(5, 'за чтение');
        this.updateQuest('daily_2');
        
        const pagesRead = parseInt(localStorage.getItem('cpp_pages_read') || '0') + 1;
        localStorage.setItem('cpp_pages_read', pagesRead);
        
        if (pagesRead === 10) {
            this.unlockAchievement('reader');
        }
    }
}

// Initialize game system
let gameSystem;
document.addEventListener('DOMContentLoaded', () => {
    gameSystem = new GameSystem();
    
    // Track page read after 30 seconds
    setTimeout(() => {
        gameSystem.onPageRead();
    }, 30000);
});
