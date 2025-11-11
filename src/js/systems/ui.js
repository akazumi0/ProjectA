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
    } else {
        comboDisplay.classList.remove('show');
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
 * Trigger success animation on element
 * @param {string} elementId - Element ID
 */
export function triggerSuccessAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.add('upgrade-success');

    setTimeout(() => {
        element.classList.remove('upgrade-success');
    }, 500);
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
