/**
 * Formatters Module
 * Number and text formatting utilities
 * @module utils/formatters
 */

/**
 * Format large numbers with K, M, B, T suffixes
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 1) {
    if (num === undefined || num === null || isNaN(num)) return '0';

    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absNum < 1000) {
        return sign + Math.floor(absNum).toString();
    } else if (absNum < 1000000) {
        return sign + (absNum / 1000).toFixed(decimals) + 'K';
    } else if (absNum < 1000000000) {
        return sign + (absNum / 1000000).toFixed(decimals) + 'M';
    } else if (absNum < 1000000000000) {
        return sign + (absNum / 1000000000).toFixed(decimals) + 'B';
    } else if (absNum < 1000000000000000) {
        return sign + (absNum / 1000000000000).toFixed(decimals) + 'T';
    } else if (absNum < 1000000000000000000) {
        return sign + (absNum / 1000000000000000).toFixed(decimals) + 'Q';
    } else {
        return sign + (absNum / 1000000000000000000).toFixed(decimals) + 'Qt';
    }
}

/**
 * Format resource cost display
 * @param {Object} cost - Resource cost object
 * @returns {string} Formatted cost string
 */
export function formatCost(cost) {
    if (!cost || Object.keys(cost).length === 0) return 'Gratuit';

    const parts = [];
    if (cost.lumen) parts.push(`⭐${formatNumber(cost.lumen)}`);
    if (cost.energy) parts.push(`⚡${formatNumber(cost.energy)}`);
    if (cost.antimatter) parts.push(`💥${formatNumber(cost.antimatter)}`);

    return parts.join(' ');
}

/**
 * Format resource cost with color coding based on availability
 * @param {Object} cost - Resource cost object
 * @param {Object} available - Available resources
 * @returns {string} Formatted cost HTML string with color coding
 */
export function formatCostColored(cost, available) {
    if (!cost || Object.keys(cost).length === 0) return '<span style="color: #4ade80">Gratuit</span>';

    const parts = [];
    if (cost.lumen) {
        const canAfford = (available.lumen || 0) >= cost.lumen;
        const color = canAfford ? '#4ade80' : '#f87171';
        parts.push(`<span style="color: ${color}">⭐${formatNumber(cost.lumen)}</span>`);
    }
    if (cost.energy) {
        const canAfford = (available.energy || 0) >= cost.energy;
        const color = canAfford ? '#4ade80' : '#f87171';
        parts.push(`<span style="color: ${color}">⚡${formatNumber(cost.energy)}</span>`);
    }
    if (cost.antimatter) {
        const canAfford = (available.antimatter || 0) >= cost.antimatter;
        const color = canAfford ? '#4ade80' : '#f87171';
        parts.push(`<span style="color: ${color}">💥${formatNumber(cost.antimatter)}</span>`);
    }

    return parts.join(' ');
}

/**
 * Format production rate per second
 * @param {number} rate - Production rate
 * @returns {string} Formatted rate string
 */
export function formatRate(rate) {
    if (rate === 0) return '0/s';
    if (rate < 0.1) return `+${rate.toFixed(3)}/s`;
    if (rate < 1) return `+${rate.toFixed(2)}/s`;
    return `+${formatNumber(rate)}/s`;
}

/**
 * Format time duration
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted time string (HH:MM:SS)
 */
export function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const s = seconds % 60;
    const m = minutes % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format countdown timer
 * @param {number} remainingMs - Remaining time in milliseconds
 * @returns {string} Formatted countdown string
 */
export function formatCountdown(remainingMs) {
    if (remainingMs <= 0) return '00:00';

    const seconds = Math.floor((remainingMs / 1000) % 60);
    const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format percentage
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format multiplier (e.g., 2x, 3.5x)
 * @param {number} multiplier - Multiplier value
 * @returns {string} Formatted multiplier string
 */
export function formatMultiplier(multiplier) {
    if (multiplier === Math.floor(multiplier)) {
        return `x${multiplier}`;
    }
    return `x${multiplier.toFixed(1)}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number
 * @returns {string} Number with ordinal suffix
 */
export function getOrdinal(num) {
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) return num + 'st';
    if (j === 2 && k !== 12) return num + 'nd';
    if (j === 3 && k !== 13) return num + 'rd';
    return num + 'th';
}

/**
 * Format level display
 * @param {number} level - Level number
 * @param {number} max - Maximum level
 * @returns {string} Formatted level string
 */
export function formatLevel(level, max) {
    if (level >= max) return `MAX (Niv.${level})`;
    return `Niv.${level}`;
}
