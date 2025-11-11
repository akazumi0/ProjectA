/**
 * Haptics Module
 * iOS-style haptic feedback using Web Vibration API
 * @module utils/haptics
 */

import { game } from '../core/gameState.js';

/**
 * Check if haptics are supported and enabled
 * @returns {boolean}
 */
function canVibrate() {
    return 'vibrate' in navigator && game.settings && game.settings.hapticsEnabled;
}

/**
 * Light haptic feedback
 * Usage: UI interactions, fragment capture
 */
export function lightHaptic() {
    if (canVibrate()) {
        navigator.vibrate(10);
    }
}

/**
 * Medium haptic feedback
 * Usage: Building purchase, button press
 */
export function mediumHaptic() {
    if (canVibrate()) {
        navigator.vibrate(20);
    }
}

/**
 * Heavy haptic feedback
 * Usage: Achievement unlocked, level up
 */
export function heavyHaptic() {
    if (canVibrate()) {
        navigator.vibrate(50);
    }
}

/**
 * Success pattern haptic
 * Usage: Prestige, rare event, major milestone
 */
export function successHaptic() {
    if (canVibrate()) {
        navigator.vibrate([10, 50, 10, 50, 10]);
    }
}

/**
 * Error pattern haptic
 * Usage: Cannot afford, action blocked
 */
export function errorHaptic() {
    if (canVibrate()) {
        navigator.vibrate([30, 100, 30]);
    }
}

/**
 * Notification pattern haptic
 * Usage: Daily reward ready, lootbox available
 */
export function notificationHaptic() {
    if (canVibrate()) {
        navigator.vibrate([20, 50, 20]);
    }
}

/**
 * Custom haptic pattern
 * @param {Array<number>} pattern - Vibration pattern [duration, pause, duration, ...]
 */
export function customHaptic(pattern) {
    if (canVibrate() && Array.isArray(pattern)) {
        navigator.vibrate(pattern);
    }
}
