/**
 * Constants Module
 * Game-wide constant values and configuration
 * @module core/constants
 */

/**
 * Game timing constants (milliseconds)
 * @constant
 */
export const TIMING = {
    TICK_RATE: 100, // Game loop tick rate (100ms = 10 ticks/sec)
    SAVE_INTERVAL: 30000, // Auto-save every 30 seconds
    FRAGMENT_SPAWN_BASE: 2000, // Base fragment spawn rate (2 seconds)
    DAILY_RESET_HOURS: 24, // Daily quest reset period
    FREE_LOOTBOX_COOLDOWN: 15 * 60 * 1000, // 15 minutes
    COMBO_TIMEOUT: 3000, // 3 seconds to maintain combo
    ASTRA_DIALOGUE_MIN_INTERVAL: 60000, // 1 minute minimum between dialogues
    STORY_EVENT_MIN_INTERVAL: 5 * 60 * 1000, // 5 minutes between story events
    FLASH_MISSION_INTERVAL: 15 * 60 * 1000, // 15 minutes between flash missions
    DAILY_QUEST_RESET: 15 * 60 * 1000 // 15 minutes between daily quest resets
};

/**
 * Capacitor/iOS specific constants
 * @constant
 */
export const CAPACITOR = {
    APP_ID: 'com.fallingstars.app',
    APP_VERSION: '1.0.0',
    HAPTIC_ENABLED: true, // Enable haptic feedback on iOS
    STATUS_BAR_STYLE: 'dark', // iOS status bar style
    SPLASH_DURATION: 2000 // Splash screen duration (ms)
};

/**
 * Resource type identifiers
 * @constant
 */
export const RESOURCES = {
    LUMEN: 'lumen',
    ENERGY: 'energy',
    ANTIMATTER: 'antimatter'
};

/**
 * Fragment types and properties
 * @constant
 */
export const FRAGMENTS = {
    NORMAL: {
        type: 'normal',
        color: '#00d4ff',
        valueMin: 1,
        valueMax: 10,
        weight: 0.85
    },
    GOLDEN: {
        type: 'golden',
        color: '#ffd700',
        valueMin: 50,
        valueMax: 100,
        weight: 0.10
    },
    RARE: {
        type: 'rare',
        color: '#ff00ff',
        valueMin: 100,
        valueMax: 500,
        weight: 0.04
    },
    LEGENDARY: {
        type: 'legendary',
        color: '#ff8800',
        valueMin: 1000,
        valueMax: 5000,
        weight: 0.01
    }
};

/**
 * Canvas rendering configuration
 * @constant
 */
export const CANVAS = {
    FRAGMENT_SIZE: 20,
    FRAGMENT_GLOW: 10,
    PARTICLE_COUNT: 150, // Increased from 50
    STAR_COUNT: 300, // Increased from 100
    STAR_LAYERS: 3, // Parallax layers
    PLAYABLE_MARGIN_TOP: 90, // Header height
    PLAYABLE_MARGIN_BOTTOM: 200, // Bottom UI height
    PLAYABLE_MARGIN_LEFT: 60, // Left icon bar margin
    PLAYABLE_MARGIN_RIGHT: 60 // Right margin
};

/**
 * Prestige system configuration
 * @constant
 */
export const PRESTIGE = {
    BASE_REQUIREMENT: 500000, // 500K lumen to prestige (reduced from 1M)
    BONUS_PER_LEVEL: 10, // +10% production per prestige level
    MAX_LEVEL: 100
};

/**
 * Artifact rarity configuration
 * @constant
 */
export const ARTIFACT_RARITY = {
    COMMON: { weight: 0.50, color: '#888' },
    RARE: { weight: 0.30, color: '#00d4ff' },
    EPIC: { weight: 0.15, color: '#ff00ff' },
    LEGENDARY: { weight: 0.05, color: '#ffd700' }
};

/**
 * Daily rewards configuration (Escalation system)
 * @constant
 */
export const DAILY_REWARDS = [
    { day: 1, lumen: 100, energy: 50 },
    { day: 2, lumen: 200, energy: 100 },
    { day: 3, lumen: 500, energy: 250 },
    { day: 4, lumen: 1000, energy: 500 },
    { day: 5, lumen: 2000, energy: 1000 },
    { day: 6, lumen: 5000, energy: 2500 },
    { day: 7, lumen: 50000, energy: 10000, antimatter: 1 },
    { day: 14, lumen: 100000, energy: 25000, antimatter: 5 },
    { day: 30, lumen: 500000, energy: 100000, antimatter: 10 },
    { day: 60, lumen: 2000000, energy: 500000, antimatter: 50 },
    { day: 100, lumen: 10000000, energy: 2000000, antimatter: 200 }
];

/**
 * Fragment spawn configuration
 * @constant
 */
export const FRAGMENT_SPAWN = {
    BASE_CHANCE: 0.6, // 60% chance per check (increased from 30%)
    CHECK_INTERVAL: 2000, // Check every 2 seconds
    MAX_ON_SCREEN: 10 // Maximum fragments at once
};

/**
 * Achievement categories
 * @constant
 */
export const ACHIEVEMENT_CATEGORIES = {
    CLICKS: 'clicks',
    COLLECTION: 'collection',
    BUILDINGS: 'buildings',
    TECH: 'tech',
    PLANETS: 'planets',
    PRESTIGE: 'prestige',
    SPECIAL: 'special'
};

/**
 * UI animation durations (milliseconds)
 * @constant
 */
export const ANIMATION = {
    NOTIFICATION_DURATION: 3000,
    SUCCESS_PULSE: 500,
    MODAL_FADE: 300,
    TAB_SWITCH: 200,
    ASTRA_DIALOGUE: 5000,
    COMBO_DISPLAY: 3000
};

/**
 * Audio frequency configuration
 * @constant
 */
export const AUDIO = {
    CATCH_FREQUENCY: 600,
    CATCH_DURATION: 0.15,
    BUILD_FREQUENCY: 400,
    BUILD_DURATION: 0.2,
    VOLUME: 0.2
};

/**
 * Offline earnings configuration
 * @constant
 */
export const OFFLINE = {
    MAX_DURATION: 4 * 60 * 60 * 1000, // Max 4 hours of offline earnings
    BASE_MULTIPLIER: 0.5, // 50% of online production
    NOTIFICATION_THRESHOLD: 60000 // Show notification if offline > 1 minute
};

/**
 * Local storage keys
 * @constant
 */
export const STORAGE_KEYS = {
    GAME_SAVE: 'fallingStars_save',
    SETTINGS: 'fallingStars_settings',
    STATS: 'fallingStars_stats'
};

/**
 * Game version for save compatibility
 * @constant
 */
export const GAME_VERSION = '1.0.0';

/**
 * Player tier system (Ethical monetization)
 * @constant
 */
export const PLAYER_TIERS = {
    FREE: {
        id: 'FREE',
        name: 'Free Player',
        badge: '🆓',
        features: ['Full game access', 'Cloud save', 'F2P Leaderboard']
    },
    SUPPORTER: {
        id: 'SUPPORTER',
        name: 'Supporter',
        badge: '⭐',
        price: 2.99,
        features: [
            'All FREE features',
            '5 UI Themes',
            '10 Particle effects',
            'Stats graphs',
            'Export data',
            '3 Save slots',
            'Supporter Leaderboard'
        ]
    },
    FAST_PASS: {
        id: 'FAST_PASS',
        name: 'Time Traveler',
        badge: '⏱️',
        price: 4.99,
        features: [
            'All SUPPORTER features',
            'Auto-clicker (1/s)',
            'Offline earnings ×2',
            'Instant actions',
            'Fast Lane Leaderboard'
        ]
    }
};

/**
 * Badge types and acquisition
 * @constant
 */
export const BADGES = {
    // Tier badges
    FREE_PLAYER: { id: 'free', icon: '🆓', name: 'Free Player' },
    SUPPORTER: { id: 'supporter', icon: '⭐', name: 'Supporter' },
    TIME_TRAVELER: { id: 'time_traveler', icon: '⏱️', name: 'Time Traveler' },

    // Achievement badges
    FIRST_PRESTIGE: { id: 'first_prestige', icon: '🌠', name: 'Renaissance' },
    SCIENCE_MASTER: { id: 'science_master', icon: '🔬', name: 'Scientifique' },
    SPEEDRUNNER: { id: 'speedrunner', icon: '⚡', name: 'Speedrunner' },
    VETERAN_S1: { id: 'veteran_s1', icon: '🏆', name: 'Vétéran S1' },

    // Story badges
    EXPLORER: { id: 'explorer', icon: '🌍', name: 'Explorateur' },
    LEGEND: { id: 'legend', icon: '👑', name: 'Légende' }
};

/**
 * Debug mode flag
 * Set to true for development, false for production
 * @constant
 */
export const DEBUG = false;
