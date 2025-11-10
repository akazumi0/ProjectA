/**
 * Game State Module
 * Central game state management
 * @module core/gameState
 */

import { buildingData } from '../data/buildings.js';
import { techData } from '../data/technologies.js';

/**
 * Initialize default game state
 * @returns {Object} Default game state structure
 */
export function createDefaultGameState() {
    return {
        // Player Profile
        username: 'Commandant',
        playerTier: 'FREE', // FREE, SUPPORTER, FAST_PASS
        badges: [],
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            hapticsEnabled: true,
            language: 'fr',
            volumeSFX: 0.5,
            volumeMusic: 0.3,
            uiAutoHide: true
        },

        // Gameplay
        currentPlanet: 'earth',
        planets: {
            earth: {
                name: 'Terre',
                unlocked: true,
                bonus: { lumen: 1, energy: 1 },
                buildings: {
                    lumenMine: 1  // Start with 1 free mine for better early game
                }
            },
            mars: {
                name: 'Mars',
                unlocked: false,
                bonus: { lumen: 1.2, energy: 1 },
                unlockCost: { energy: 5000 }
            },
            titan: {
                name: 'Titan',
                unlocked: false,
                bonus: { lumen: 1, energy: 1.5 },
                unlockCost: { lumen: 50000, energy: 20000 }
            }
        },
        resources: {
            lumen: 0,
            energy: 0,
            antimatter: 0
        },
        totalResources: {
            lumen: 0,
            energy: 0,
            antimatter: 0
        },
        technologies: {},
        defense: {},
        clickPower: 10,
        fragmentSpawnRate: 1,
        lastTick: Date.now(),
        // Systems
        dailyRewards: {
            lastClaim: 0,
            streak: 0
        },
        freeLootbox: {
            lastOpen: 0
        },
        prestige: {
            level: 0,
            totalLumenEarned: 0,
            paths: {
                builder: 0,    // Number of times chosen
                clicker: 0,
                researcher: 0
            },
            artifacts: []      // Unlocked artifacts from prestige
        },
        activeBoosts: [],
        activeEvents: [],
        achievements: {},
        stats: {
            totalClicks: 0,
            buildingsBuilt: 0,
            fragmentsCaught: 0,
            timePlayed: 0,
            techsUnlocked: 0
        },
        quests: {
            daily: {},
            lastReset: 0
        },
        masteries: {
            clickMastery: 0,
            buildMastery: 0,
            techMastery: 0
        },
        randomEvents: {
            lastEvent: 0,
            currentEvent: null
        },
        permanentBoosts: {
            offlineBonus: 1
        },
        // Gameplay Systems
        astraDialogue: {
            lastDialogue: 0,
            storyProgress: 0,
            dialoguesSeen: []
        },
        combo: {
            count: 0,
            lastClick: 0,
            multiplier: 1
        },
        flashMission: {
            active: false,
            type: null,
            startTime: 0,
            duration: 0,
            progress: 0,
            goal: 0,
            reward: null
        },
        artifacts: {
            discovered: [],
            active: []
        },
        storyEvents: {
            lastEvent: 0,
            activeEvent: null
        },
        // Tutorial & First Time
        firstTime: true,
        tutorialCompleted: false,
        manifestoSeen: false,
        // Leaderboard data (will sync with Firebase)
        leaderboard: {
            totalScore: 0,
            seasonScore: 0,
            lastSubmit: 0
        }
    };
}

/**
 * Global game state
 * Singleton pattern for state management
 */
export let game = createDefaultGameState();

/**
 * Initialize planet buildings structure
 * Sets up building counts for all planets
 */
export function initializePlanetBuildings() {
    for (let planetKey in game.planets) {
        if (!game.planets[planetKey].buildings) {
            game.planets[planetKey].buildings = {};
        }
        for (let buildKey in buildingData) {
            if (!game.planets[planetKey].buildings[buildKey]) {
                game.planets[planetKey].buildings[buildKey] = 0;
            }
        }
    }
}

/**
 * Initialize technologies
 * Sets all technologies to level 0
 */
export function initializeTechnologies() {
    for (let techKey in techData) {
        if (!(techKey in game.technologies)) {
            game.technologies[techKey] = 0;
        }
    }
}

/**
 * Reset game state to defaults
 * @param {Object} newState - Optional new state to set
 */
export function resetGameState(newState = null) {
    game = newState || createDefaultGameState();
    initializePlanetBuildings();
    initializeTechnologies();
}

/**
 * Load game state from save data
 * @param {Object} savedState - Saved game state
 */
export function loadGameState(savedState) {
    // Merge saved state with default state (handles new properties)
    const defaultState = createDefaultGameState();
    game = Object.assign({}, defaultState, savedState);

    // Ensure new properties exist
    if (!game.artifacts) game.artifacts = defaultState.artifacts;
    if (!game.flashMission) game.flashMission = defaultState.flashMission;
    if (!game.storyEvents) game.storyEvents = defaultState.storyEvents;
    if (!game.combo) game.combo = defaultState.combo;
    if (!game.astraDialogue) game.astraDialogue = defaultState.astraDialogue;
    if (!game.playerTier) game.playerTier = defaultState.playerTier;
    if (!game.badges) game.badges = defaultState.badges;
    if (!game.settings) game.settings = defaultState.settings;
    if (!game.prestige.paths) game.prestige.paths = defaultState.prestige.paths;
    if (!game.prestige.artifacts) game.prestige.artifacts = defaultState.prestige.artifacts;
    if (game.firstTime === undefined) game.firstTime = false; // Existing players
    if (!game.tutorialCompleted) game.tutorialCompleted = false;
    if (!game.manifestoSeen) game.manifestoSeen = false;
    if (!game.leaderboard) game.leaderboard = defaultState.leaderboard;

    initializePlanetBuildings();
    initializeTechnologies();
}

/**
 * Get current game state
 * @returns {Object} Current game state
 */
export function getGameState() {
    return game;
}

/**
 * Update a specific property in game state
 * @param {string} path - Dot notation path to property
 * @param {*} value - New value
 */
export function updateGameState(path, value) {
    const keys = path.split('.');
    let obj = game;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
}

/**
 * Get a value from game state
 * @param {string} path - Dot notation path to property
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Value from game state
 */
export function getFromGameState(path, defaultValue = null) {
    const keys = path.split('.');
    let obj = game;

    for (let key of keys) {
        if (obj[key] === undefined) return defaultValue;
        obj = obj[key];
    }

    return obj;
}
