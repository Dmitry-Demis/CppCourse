/* ============================================
   VISUAL EFFECTS - Particles & Animations
   ============================================ */

class EffectsSystem {
    constructor() {
        this.particles = [];
    }
    
    // Create coin particle effect
    createCoinParticles(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = '⭐';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.animationDelay = (i * 0.05) + 's';
            
            // Random direction
            const angle = (Math.PI * 2 * i) / count;
            const distance = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    // Create confetti effect
    createConfetti(count = 50) {
        const colors = ['#FFD700', '#FF6B35', '#FF006E', '#8338EC', '#3A86FF', '#06FFA5'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }
    }
    
    // Create sparkle effect
    createSparkles(element, count = 5) {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
            sparkle.style.animationDelay = (i * 0.1) + 's';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }
    }
    
    // Show level up badge
    showLevelUp(level) {
        const badge = document.createElement('div');
        badge.className = 'level-up-badge';
        badge.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">🎉 НОВЫЙ УРОВЕНЬ! 🎉</div>
                <div style="font-size: 64px; font-weight: 900;">УРОВЕНЬ ${level}</div>
            </div>
        `;
        
        document.body.appendChild(badge);
        
        // Confetti
        this.createConfetti(100);
        
        setTimeout(() => {
            badge.style.opacity = '0';
            badge.style.transform = 'translate(-50%, -50%) scale(0.8)';
            badge.style.transition = 'all 0.5s ease';
            setTimeout(() => badge.remove(), 500);
        }, 3000);
    }
    
    // Ripple effect on click
    addRippleEffect(element) {
        element.addEventListener('click', (e) => {
            element.classList.add('active');
            setTimeout(() => element.classList.remove('active'), 600);
        });
    }
    
    // Shake element
    shake(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }
    
    // Success pulse
    successPulse(element) {
        element.classList.add('success-pulse');
        setTimeout(() => element.classList.remove('success-pulse'), 600);
    }
    
    // Pop animation
    pop(element) {
        element.classList.add('pop');
        setTimeout(() => element.classList.remove('pop'), 400);
    }
    
    // Floating text notification
    showFloatingText(text, x, y, color = '#FFD700') {
        const floatingText = document.createElement('div');
        floatingText.style.position = 'fixed';
        floatingText.style.left = x + 'px';
        floatingText.style.top = y + 'px';
        floatingText.style.fontSize = '24px';
        floatingText.style.fontWeight = '900';
        floatingText.style.color = color;
        floatingText.style.pointerEvents = 'none';
        floatingText.style.zIndex = '9999';
        floatingText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        floatingText.textContent = text;
        
        document.body.appendChild(floatingText);
        
        // Animate
        let opacity = 1;
        let posY = y;
        const interval = setInterval(() => {
            opacity -= 0.02;
            posY -= 2;
            floatingText.style.opacity = opacity;
            floatingText.style.top = posY + 'px';
            
            if (opacity <= 0) {
                clearInterval(interval);
                floatingText.remove();
            }
        }, 20);
    }
    
    // Screen flash effect
    screenFlash(color = 'rgba(255, 215, 0, 0.3)') {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = color;
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '9998';
        flash.style.opacity = '1';
        flash.style.transition = 'opacity 0.5s ease';
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 500);
        }, 50);
    }
    
    // Coin collection animation
    animateCoinToCounter(startX, startY) {
        const coin = document.createElement('div');
        coin.textContent = '⭐';
        coin.style.position = 'fixed';
        coin.style.left = startX + 'px';
        coin.style.top = startY + 'px';
        coin.style.fontSize = '32px';
        coin.style.pointerEvents = 'none';
        coin.style.zIndex = '9999';
        coin.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        document.body.appendChild(coin);
        
        // Get coin counter position
        const counter = document.querySelector('.coin-counter');
        if (counter) {
            const rect = counter.getBoundingClientRect();
            
            setTimeout(() => {
                coin.style.left = rect.left + 'px';
                coin.style.top = rect.top + 'px';
                coin.style.transform = 'scale(0)';
                coin.style.opacity = '0';
            }, 50);
            
            setTimeout(() => {
                coin.remove();
                // Pulse coin counter
                counter.classList.add('coin-earned');
                setTimeout(() => counter.classList.remove('coin-earned'), 600);
            }, 850);
        } else {
            setTimeout(() => coin.remove(), 1000);
        }
    }
    
    // Achievement unlock animation
    showAchievementUnlock(icon, name, reward) {
        const achievement = document.createElement('div');
        achievement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #8338EC, #3A86FF);
            padding: 40px 60px;
            border-radius: 24px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(131, 56, 236, 0.6);
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;
        
        achievement.innerHTML = `
            <div style="font-size: 80px; margin-bottom: 20px;">${icon}</div>
            <div style="font-size: 32px; font-weight: 900; color: #fff; margin-bottom: 10px;">
                🏆 ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО! 🏆
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #FFD700; margin-bottom: 15px;">
                ${name}
            </div>
            <div style="font-size: 20px; color: #fff;">
                <span style="font-size: 28px;">⭐</span> +${reward}
            </div>
        `;
        
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            achievement.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 50);
        
        this.createConfetti(80);
        this.screenFlash('rgba(131, 56, 236, 0.3)');
        
        setTimeout(() => {
            achievement.style.transform = 'translate(-50%, -50%) scale(0)';
            setTimeout(() => achievement.remove(), 500);
        }, 4000);
    }
}

// Initialize effects system
const effects = new EffectsSystem();

// Add ripple effects to buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.action-btn, .code-btn, .btn').forEach(btn => {
        effects.addRippleEffect(btn);
    });
});
