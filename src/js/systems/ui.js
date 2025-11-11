/**
 * UI System Module
 * DOM manipulation and UI updates
 * @module systems/ui
 */

import { game } from '../core/gameState.js';
import { formatNumber, formatRate, formatCost, formatLevel, formatCountdown } from '../utils/formatters.js';
import { calculateProduction } from '../utils/calculations.js';

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

/**
 * Update resource display
 */
export function updateResources() {
    const elements = {
        lumen: document.getElementById('lumenVal'),
        energy: document.getElementById('energyVal'),
        antimatter: document.getElementById('antimatterVal')
    };

    for (let res in elements) {
        if (elements[res]) {
            elements[res].textContent = formatNumber(game.resources[res]);
        }
    }

    // Update production rates
    const production = calculateProduction();
    const lumenRate = document.getElementById('lumenRate');
    const energyRate = document.getElementById('energyRate');

    if (lumenRate) lumenRate.textContent = formatRate(production.lumen);
    if (energyRate) energyRate.textContent = formatRate(production.energy);

    // Check for milestone celebrations
    checkMilestones(game.totalResources.lumen);
}

/**
 * Update combo display
 */
export function updateComboDisplay() {
    const comboDisplay = document.getElementById('comboDisplay');
    const comboCount = document.getElementById('comboCount');
    const comboMultiplier = document.getElementById('comboMultiplier');

    if (!comboDisplay) return;

    if (game.combo.count > 3) {
        comboDisplay.classList.add('show');
        if (comboCount) comboCount.textContent = game.combo.count;
        if (comboMultiplier) {
            const bonusPercent = ((game.combo.multiplier - 1) * 100).toFixed(0);
            comboMultiplier.textContent = `+${bonusPercent}%`;
        }

        // Set combo level for visual styling
        const comboLevel = game.combo.count >= 30 ? 3 : game.combo.count >= 15 ? 2 : game.combo.count >= 8 ? 1 : 0;
        comboDisplay.setAttribute('data-level', comboLevel);
    } else {
        comboDisplay.classList.remove('show');
        comboDisplay.removeAttribute('data-level');
    }
}

/**
 * Update prestige display
 */
export function updatePrestigeDisplay() {
    const prestigeDisplay = document.getElementById('prestigeLevelDisplay');
    if (prestigeDisplay) {
        prestigeDisplay.textContent = game.prestige.level;

        // Add visual indication if prestige level > 0
        if (game.prestige.level > 0) {
            prestigeDisplay.style.color = '#ffd700';
            prestigeDisplay.style.fontWeight = 'bold';
        }
    }
}

/**
 * Switch active tab
 * @param {number} tabIndex - Tab index (0=defense, 1=buildings, 2=tech)
 */
export function switchTab(tabIndex) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab, i) => {
        if (i === tabIndex) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    contents.forEach((content, i) => {
        if (i === tabIndex) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

/**
 * Show/hide modal
 * @param {string} modalId - Modal element ID
 * @param {boolean} show - Show or hide
 */
export function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (show) {
        modal.classList.add('active', 'show');
    } else {
        modal.classList.remove('active', 'show');
    }
}

/**
 * Create floating text animation
 * @param {string} text - Text to display
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Text color (optional, defaults to cyan)
 */
export function createFloatingText(text, x, y, color = '#00d4ff') {
    const element = document.createElement('div');
    element.className = 'floating-text';
    element.textContent = text;
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.color = color;

    document.body.appendChild(element);

    setTimeout(() => {
        element.remove();
    }, 1000);
}

/**
 * Trigger enhanced success animation on element with particles and effects
 * @param {string} elementId - Element ID
 */
export function triggerSuccessAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Add success class for glow effect
    element.classList.add('upgrade-success');

    // Get element position for particle burst
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create expanding rings effect
    createPurchaseRings(centerX, centerY);

    // Create success particles
    createSuccessParticles(centerX, centerY);

    // Play success sound (imported from audio.js)
    if (typeof window.playSound === 'function') {
        window.playSound('build');
    }

    // Remove success class after animation
    setTimeout(() => {
        element.classList.remove('upgrade-success');
    }, 600);
}

/**
 * Create expanding ring effects for purchase feedback
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function createPurchaseRings(x, y) {
    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.className = 'purchase-ring';
            ring.style.position = 'fixed';
            ring.style.left = x + 'px';
            ring.style.top = y + 'px';
            ring.style.pointerEvents = 'none';
            ring.style.zIndex = '9998';

            document.body.appendChild(ring);

            setTimeout(() => ring.remove(), 600);
        }, i * 150);
    }
}

/**
 * Create success particles for purchase feedback
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function createSuccessParticles(x, y) {
    const particleCount = 15;
    const colors = ['#00ff88', '#00d4ff', '#ffd93d'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 80 + Math.random() * 40;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 6 + 4;

        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9998';
        particle.style.boxShadow = `0 0 10px ${color}`;

        document.body.appendChild(particle);

        // Animate particle
        let posX = x;
        let posY = y;
        let currentVx = vx;
        let currentVy = vy;
        let opacity = 1;
        const gravity = 150;
        const friction = 0.98;
        const startTime = Date.now();

        function animateParticle() {
            const elapsed = (Date.now() - startTime) / 1000;

            if (elapsed > 0.8) {
                particle.remove();
                return;
            }

            currentVy += gravity * 0.016;
            currentVx *= friction;
            currentVy *= friction;

            posX += currentVx * 0.016;
            posY += currentVy * 0.016;
            opacity = 1 - (elapsed / 0.8);

            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;

            requestAnimationFrame(animateParticle);
        }

        animateParticle();
    }
}

// Store current dialogue timeout
let astraTimeoutId = null;
let astraClickHandler = null;

// Milestone tracking
const milestonesReached = new Set();

// Milestone definitions
const milestones = [
    { amount: 100, tier: 'bronze', icon: '🥉', title: 'Premier Pas', message: 'Vous avez collecté 100 Lumen!' },
    { amount: 500, tier: 'bronze', icon: '🌟', title: 'En Route', message: '500 Lumen! Vous progressez bien!' },
    { amount: 1000, tier: 'silver', icon: '🥈', title: 'Millier Stellaire', message: '1 000 Lumen collectés!' },
    { amount: 5000, tier: 'silver', icon: '✨', title: 'Collecteur Aguerri', message: '5 000 Lumen! Impressionnant!' },
    { amount: 10000, tier: 'gold', icon: '🥇', title: 'Maître Collecteur', message: '10 000 Lumen! Extraordinaire!' },
    { amount: 50000, tier: 'gold', icon: '💫', title: 'Champion Cosmique', message: '50 000 Lumen! Incroyable!' },
    { amount: 100000, tier: 'platinum', icon: '🏆', title: 'Légende Stellaire', message: '100 000 Lumen! Vous êtes une légende!' },
    { amount: 500000, tier: 'platinum', icon: '👑', title: 'Elite Galactique', message: '500 000 Lumen! L\'élite absolue!' },
    { amount: 1000000, tier: 'diamond', icon: '💎', title: 'Maître de l\'Univers', message: '1 MILLION de Lumen! Suprématie absolue!' }
];

/**
 * Check and trigger milestone celebrations
 * @param {number} totalLumen - Current total Lumen count
 */
export function checkMilestones(totalLumen) {
    milestones.forEach(milestone => {
        if (totalLumen >= milestone.amount && !milestonesReached.has(milestone.amount)) {
            milestonesReached.add(milestone.amount);
            triggerMilestoneCelebration(milestone);
        }
    });
}

/**
 * Trigger milestone celebration with popup, confetti, and sounds
 * @param {Object} milestone - Milestone data
 */
function triggerMilestoneCelebration(milestone) {
    // Create milestone popup
    const popup = document.createElement('div');
    popup.className = 'milestone-popup show';
    popup.innerHTML = `
        <div class="milestone-content ${milestone.tier}">
            <div class="milestone-icon">${milestone.icon}</div>
            <div class="milestone-title">${milestone.title}</div>
            <div class="milestone-amount">${formatMilestoneAmount(milestone.amount)} Lumen</div>
            <div class="milestone-message">${milestone.message}</div>
        </div>
    `;

    document.body.appendChild(popup);

    // Play achievement sound
    if (typeof window.playSound === 'function') {
        window.playSound('achievement');
    }

    // Create confetti burst
    createConfetti(milestone.tier);

    // Screen shake
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        screenShakeEffect(canvas, 8, 500);
    }

    // Remove popup after 4 seconds
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, 4000);

    // Show ASTRA congratulations
    setTimeout(() => {
        const astraMessages = {
            'bronze': `🎉 Bravo, Commandant ! ${milestone.title} atteint !`,
            'silver': `✨ Fantastique ! Vous êtes sur la bonne voie avec ${formatMilestoneAmount(milestone.amount)} Lumen !`,
            'gold': `🌟 Incroyable ! ${milestone.title} ! Vous êtes exceptionnel !`,
            'platinum': `👑 EXTRAORDINAIRE ! ${formatMilestoneAmount(milestone.amount)} Lumen ! Vous êtes parmi l'élite !`,
            'diamond': `💎 LÉGENDAIRE ! Vous avez atteint le sommet absolu avec ${formatMilestoneAmount(milestone.amount)} Lumen !`
        };

        showAstraDialogue(astraMessages[milestone.tier] || milestone.message, 5000);
    }, 1500);
}

/**
 * Create confetti explosion for milestone
 * @param {string} tier - Milestone tier (bronze/silver/gold/platinum/diamond)
 */
function createConfetti(tier) {
    const confettiCount = tier === 'diamond' ? 100 : tier === 'platinum' ? 80 : tier === 'gold' ? 60 : 40;
    const colors = {
        'bronze': ['#cd7f32', '#d4a76a', '#b8860b'],
        'silver': ['#c0c0c0', '#d3d3d3', '#a8a8a8'],
        'gold': ['#ffd700', '#ffed4e', '#ffc107'],
        'platinum': ['#e5e4e2', '#ffffff', '#b9f2ff'],
        'diamond': ['#b9f2ff', '#00d4ff', '#66e6ff', '#ffffff']
    };

    const confettiColors = colors[tier] || colors.gold;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            const startX = window.innerWidth * (0.3 + Math.random() * 0.4);
            const vx = (Math.random() - 0.5) * 400;
            const vy = -400 - Math.random() * 200;
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            const size = 8 + Math.random() * 6;
            const rotation = Math.random() * 360;
            const rotationSpeed = (Math.random() - 0.5) * 720;

            confetti.style.position = 'fixed';
            confetti.style.left = startX + 'px';
            confetti.style.top = window.innerHeight + 'px';
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            confetti.style.backgroundColor = color;
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.transform = `rotate(${rotation}deg)`;

            document.body.appendChild(confetti);

            // Animate confetti
            let posX = startX;
            let posY = window.innerHeight;
            let currentVx = vx;
            let currentVy = vy;
            let currentRotation = rotation;
            const gravity = 500;
            const friction = 0.99;
            const startTime = Date.now();

            function animateConfetti() {
                const elapsed = (Date.now() - startTime) / 1000;

                if (posY > window.innerHeight + 50 || elapsed > 3) {
                    confetti.remove();
                    return;
                }

                currentVy += gravity * 0.016;
                currentVx *= friction;
                currentRotation += rotationSpeed * 0.016;

                posX += currentVx * 0.016;
                posY += currentVy * 0.016;

                confetti.style.left = posX + 'px';
                confetti.style.top = posY + 'px';
                confetti.style.transform = `rotate(${currentRotation}deg)`;

                requestAnimationFrame(animateConfetti);
            }

            animateConfetti();
        }, i * 20); // Stagger confetti creation
    }
}

/**
 * Simple screen shake effect
 * @param {HTMLElement} element - Element to shake
 * @param {number} intensity - Shake intensity
 * @param {number} duration - Shake duration in ms
 */
function screenShakeEffect(element, intensity, duration) {
    const startTime = Date.now();

    function shake() {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            element.style.transform = '';
            return;
        }

        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);
        const x = (Math.random() - 0.5) * currentIntensity * 2;
        const y = (Math.random() - 0.5) * currentIntensity * 2;

        element.style.transform = `translate(${x}px, ${y}px)`;

        requestAnimationFrame(shake);
    }

    shake();
}

/**
 * Format milestone amount with k/M suffixes
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
function formatMilestoneAmount(amount) {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(1).replace('.0', '') + 'K';
    return amount.toString();
}

/**
 * Show ASTRA dialogue
 * @param {string} text - Dialogue text
 * @param {number} duration - Display duration in milliseconds (0 = no auto-hide)
 */
export function showAstraDialogue(text, duration = 0) {
    const dialogue = document.getElementById('astraDialogue');
    const textElement = document.getElementById('astraText');

    if (!dialogue || !textElement) return;

    // Clear any existing timeout and handler
    if (astraTimeoutId) {
        clearTimeout(astraTimeoutId);
    }
    if (astraClickHandler) {
        dialogue.removeEventListener('click', astraClickHandler);
    }

    textElement.textContent = text;

    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
        dialogue.classList.add('show');
    });

    // Simple click handler - use event delegation to avoid multiple listeners
    const handleClick = () => {
        dialogue.classList.remove('show');
    };

    // Remove any existing listeners by cloning
    const newDialogue = dialogue.cloneNode(true);
    dialogue.parentNode.replaceChild(newDialogue, dialogue);

    // Re-get the element after cloning
    const freshDialogue = document.getElementById('astraDialogue');
    const freshText = document.getElementById('astraText');
    freshText.textContent = text;

    // Add show class after clone
    requestAnimationFrame(() => {
        freshDialogue.classList.add('show');
    });

    // Add single click listener
    freshDialogue.addEventListener('click', handleClick, { once: true });

    // Auto-hide after duration if specified
    if (duration > 0) {
        setTimeout(() => {
            freshDialogue.classList.remove('show');
        }, duration);
    }
}

/**
 * Update daily rewards display
 */
export function updateDailyRewardsDisplay() {
    const daysContainer = document.getElementById('dailyDays');
    if (!daysContainer) return;

    daysContainer.innerHTML = '';

    const currentStreak = game.dailyRewards.streak;

    for (let day = 1; day <= 7; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'daily-day';
        dayElement.textContent = day;

        if (day < currentStreak % 7 || (currentStreak >= 7 && currentStreak % 7 === 0 && day <= 7)) {
            dayElement.classList.add('claimed');
        } else if (day === (currentStreak % 7) + 1) {
            dayElement.classList.add('available');
        }

        daysContainer.appendChild(dayElement);
    }
}

/**
 * Update free lootbox floating button visibility
 */
export function updateFreeLootboxButton() {
    const now = Date.now();
    const cooldown = 2 * 60 * 60 * 1000; // 2 hours
    const timeLeft = (game.freeLootbox.lastOpen + cooldown) - now;
    const isAvailable = timeLeft <= 0;

    const floatButton = document.getElementById('freeLootboxFloat');
    if (!floatButton) return;

    // Show/hide button based on availability
    if (isAvailable) {
        // Only trigger animation if button wasn't visible before
        const wasHidden = floatButton.style.display === 'none';
        floatButton.style.display = 'block';

        if (wasHidden) {
            // Show center animation
            showLootboxAppearAnimation();
        }
    } else {
        floatButton.style.display = 'none';
    }
}

/**
 * Show lootbox appear animation in center of screen
 */
function showLootboxAppearAnimation() {
    const anim = document.getElementById('lootboxAppearAnim');
    if (!anim) return;

    anim.style.display = 'flex';

    // Hide after animation completes
    setTimeout(() => {
        anim.style.display = 'none';
    }, 2000);
}

/**
 * Update free lootbox timer
 */
export function updateLootboxTimer() {
    const timerElement = document.getElementById('freeLootboxTimer');
    const buttonElement = document.getElementById('openFreeLootboxBtn');

    if (!timerElement || !buttonElement) return;

    const cooldown = 2 * 60 * 60 * 1000; // 2 hours
    const timeLeft = cooldown - (Date.now() - game.freeLootbox.lastOpen);

    if (timeLeft <= 0) {
        timerElement.textContent = 'DISPONIBLE';
        buttonElement.disabled = false;
    } else {
        timerElement.textContent = formatCountdown(timeLeft);
        buttonElement.disabled = true;
    }

    // Also update floating button
    updateFreeLootboxButton();
}

/**
 * Update all UI elements
 */
export function updateAllUI() {
    updateResources();
    updateComboDisplay();
    updatePrestigeDisplay();
    updateDailyRewardsDisplay();
    updateLootboxTimer();

    // Check and update prestige popup/floating button
    if (typeof window.updatePrestigeUI === 'function') {
        window.updatePrestigeUI();
    }
}
