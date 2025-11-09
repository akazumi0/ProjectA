/**
 * Storage System Module
 * LocalStorage save/load with Capacitor compatibility
 * @module systems/storage
 */

import { game, loadGameState, resetGameState } from '../core/gameState.js';
import { STORAGE_KEYS, GAME_VERSION, OFFLINE } from '../core/constants.js';
import { calculateOfflineEarnings } from '../utils/calculations.js';

/**
 * Save game state to localStorage
 * @returns {boolean} True if save successful
 */
export function saveGame() {
    try {
        const saveData = {
            version: GAME_VERSION,
            timestamp: Date.now(),
            game: game
        };

        localStorage.setItem(STORAGE_KEYS.GAME_SAVE, JSON.stringify(saveData));
        return true;
    } catch (error) {
        console.error('Failed to save game:', error);
        return false;
    }
}

/**
 * Load game state from localStorage
 * @returns {Object|null} Loaded game state or null if no save exists
 */
export function loadGame() {
    try {
        const saveString = localStorage.getItem(STORAGE_KEYS.GAME_SAVE);
        if (!saveString) return null;

        const saveData = JSON.parse(saveString);

        // Version compatibility check
        if (saveData.version !== GAME_VERSION) {
            console.warn(`Save version mismatch: ${saveData.version} vs ${GAME_VERSION}`);
            // Could add migration logic here
        }

        return saveData;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
}

/**
 * Calculate and apply offline earnings
 * @param {Object} saveData - Loaded save data
 * @returns {Object|null} Offline earnings or null
 */
export function processOfflineEarnings(saveData) {
    if (!saveData || !saveData.timestamp) return null;

    const offlineTime = Date.now() - saveData.timestamp;

    // Only show offline earnings if offline > 1 minute
    if (offlineTime < OFFLINE.NOTIFICATION_THRESHOLD) return null;

    const earnings = calculateOfflineEarnings(offlineTime);

    // Apply earnings
    for (let res in earnings) {
        if (game.resources[res] !== undefined) {
            game.resources[res] += earnings[res];
            game.totalResources[res] += earnings[res];
        }
    }

    return {
        time: offlineTime,
        earnings: earnings
    };
}

/**
 * Delete save data
 */
export function deleteSave() {
    localStorage.removeItem(STORAGE_KEYS.GAME_SAVE);
    resetGameState();
}

/**
 * Export save data as JSON string
 * @returns {string} JSON save data
 */
export function exportSave() {
    const saveData = {
        version: GAME_VERSION,
        timestamp: Date.now(),
        game: game
    };
    return JSON.stringify(saveData);
}

/**
 * Import save data from JSON string
 * @param {string} saveString - JSON save data
 * @returns {boolean} True if import successful
 */
export function importSave(saveString) {
    try {
        const saveData = JSON.parse(saveString);
        if (!saveData.game) {
            console.error('Invalid save data format');
            return false;
        }

        localStorage.setItem(STORAGE_KEYS.GAME_SAVE, saveString);
        loadGameState(saveData.game);
        return true;
    } catch (error) {
        console.error('Failed to import save:', error);
        return false;
    }
}

/**
 * Get save file info without loading
 * @returns {Object|null} Save info (timestamp, version) or null
 */
export function getSaveInfo() {
    try {
        const saveString = localStorage.getItem(STORAGE_KEYS.GAME_SAVE);
        if (!saveString) return null;

        const saveData = JSON.parse(saveString);
        return {
            version: saveData.version,
            timestamp: saveData.timestamp,
            username: saveData.game?.username,
            prestigeLevel: saveData.game?.prestige?.level || 0
        };
    } catch (error) {
        return null;
    }
}

/**
 * Auto-save setup
 * Returns interval ID for clearing
 * @param {number} interval - Auto-save interval in milliseconds
 * @returns {number} Interval ID
 */
export function setupAutoSave(interval) {
    return setInterval(() => {
        saveGame();
    }, interval);
}
