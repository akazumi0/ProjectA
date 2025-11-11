/**
 * Companions System Module
 * Manages pet companions that auto-collect fragments
 * @module systems/companions
 */

import { game } from '../core/gameState.js';
import { COMPANIONS } from '../core/constants.js';
import { formatNumber, formatCost } from '../utils/formatters.js';
import { canAfford } from '../utils/calculations.js';

/**
 * Check if a companion can be unlocked
 * @param {string} companionId - Companion identifier
 * @returns {boolean} True if companion can be unlocked
 */
export function canUnlockCompanion(companionId) {
    const companion = COMPANIONS[companionId.toUpperCase()];
    if (!companion) return false;

    // Check prestige level requirement
    if (game.prestige.level < companion.unlockLevel) return false;

    // Check if already unlocked
    if (game.companions.unlocked.includes(companionId)) return false;

    // Check resource cost
    return canAfford(companion.cost);
}

/**
 * Unlock a companion
 * @param {string} companionId - Companion identifier
 * @returns {boolean} True if successfully unlocked
 */
export function unlockCompanion(companionId) {
    const companion = COMPANIONS[companionId.toUpperCase()];
    if (!companion) return false;

    if (!canUnlockCompanion(companionId)) return false;

    // Deduct cost
    for (const [resource, amount] of Object.entries(companion.cost)) {
        game.resources[resource] -= amount;
    }

    // Unlock companion
    game.companions.unlocked.push(companionId);

    // Auto-activate if no companion is active
    if (!game.companions.active) {
        activateCompanion(companionId);
    }

    return true;
}

/**
 * Activate a companion
 * @param {string} companionId - Companion identifier
 * @returns {boolean} True if successfully activated
 */
export function activateCompanion(companionId) {
    if (!game.companions.unlocked.includes(companionId)) return false;

    game.companions.active = companionId;

    // Initialize last collect time
    if (!game.companions.lastCollect[companionId]) {
        game.companions.lastCollect[companionId] = Date.now();
    }

    return true;
}

/**
 * Process companion auto-collection
 * @param {Array} fragments - Array of fragments on screen
 * @returns {Object} Collection results
 */
export function processCompanionCollection(fragments) {
    if (!game.companions.active || fragments.length === 0) {
        return { collected: 0, lumen: 0 };
    }

    const companionId = game.companions.active;
    const companion = COMPANIONS[companionId.toUpperCase()];
    if (!companion) return { collected: 0, lumen: 0 };

    const now = Date.now();
    const lastCollect = game.companions.lastCollect[companionId] || 0;
    const timeSinceLastCollect = now - lastCollect;

    // Check if enough time has passed
    if (timeSinceLastCollect < companion.collectInterval) {
        return { collected: 0, lumen: 0 };
    }

    // Collect fragments
    const collectAmount = companion.collectAmount || 1;
    const toCollect = Math.min(collectAmount, fragments.length);

    if (toCollect === 0) {
        return { collected: 0, lumen: 0 };
    }

    // Update last collect time
    game.companions.lastCollect[companionId] = now;

    return {
        collected: toCollect,
        companionId: companionId,
        companion: companion
    };
}

/**
 * Get companion production bonus multiplier
 * @returns {number} Total multiplier from active companion
 */
export function getCompanionBonus() {
    if (!game.companions.active) return 1.0;

    const companion = COMPANIONS[game.companions.active.toUpperCase()];
    if (!companion || !companion.bonusMultiplier) return 1.0;

    return companion.bonusMultiplier;
}

/**
 * Get companion visual position on screen
 * @param {HTMLCanvasElement} canvas - Game canvas
 * @returns {Object} Position {x, y} and animation state
 */
export function getCompanionPosition(canvas) {
    if (!game.companions.active) return null;

    const companion = COMPANIONS[game.companions.active.toUpperCase()];
    if (!companion) return null;

    // Position companion floating near bottom-right
    const baseX = canvas.width - 120;
    const baseY = canvas.height - 150;

    // Add floating animation
    const time = Date.now() * 0.001;
    const floatX = Math.sin(time * 0.5) * 20;
    const floatY = Math.sin(time * 0.8) * 15;

    return {
        x: baseX + floatX,
        y: baseY + floatY,
        icon: companion.icon,
        name: companion.name,
        scale: 1 + Math.sin(time * 2) * 0.1 // Gentle pulse
    };
}

/**
 * Render companion list UI
 * @returns {string} HTML for companions list
 */
export function renderCompanionsUI() {
    let html = '<div class="companions-list">';

    for (const [key, companion] of Object.entries(COMPANIONS)) {
        const companionId = key.toLowerCase();
        const isUnlocked = game.companions.unlocked.includes(companionId);
        const isActive = game.companions.active === companionId;
        const canUnlock = canUnlockCompanion(companionId);
        const meetsLevel = game.prestige.level >= companion.unlockLevel;

        html += `
            <div class="companion-card ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}">
                <div class="companion-icon">${companion.icon}</div>
                <div class="companion-info">
                    <div class="companion-name">${companion.name}</div>
                    <div class="companion-desc">${companion.description}</div>
                    ${!meetsLevel ? `<div class="companion-requirement">🔒 Prestige Niveau ${companion.unlockLevel}</div>` : ''}
                    ${!isUnlocked && meetsLevel ? `<div class="companion-cost">${formatCost(companion.cost)}</div>` : ''}
                </div>
                ${!isUnlocked && meetsLevel ?
                    `<button class="companion-btn ${canUnlock ? '' : 'disabled'}"
                             onclick="buyCompanion('${companionId}')"
                             ${!canUnlock ? 'disabled' : ''}>
                        DÉBLOQUER
                    </button>`
                    : ''}
                ${isUnlocked && !isActive ?
                    `<button class="companion-btn" onclick="activateCompanion('${companionId}')">
                        ACTIVER
                    </button>`
                    : ''}
                ${isActive ? '<div class="companion-active-badge">✓ ACTIF</div>' : ''}
            </div>
        `;
    }

    html += '</div>';
    return html;
}

/**
 * Get companion collection cooldown info
 * @returns {Object|null} Cooldown info or null if no active companion
 */
export function getCompanionCooldown() {
    if (!game.companions.active) return null;

    const companion = COMPANIONS[game.companions.active.toUpperCase()];
    if (!companion) return null;

    const now = Date.now();
    const lastCollect = game.companions.lastCollect[game.companions.active] || 0;
    const timeSinceLastCollect = now - lastCollect;
    const timeUntilNext = Math.max(0, companion.collectInterval - timeSinceLastCollect);

    return {
        ready: timeUntilNext === 0,
        timeLeft: timeUntilNext,
        progress: Math.min(1, timeSinceLastCollect / companion.collectInterval)
    };
}
