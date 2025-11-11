/**
 * Game Logic System Module
 * Core game mechanics and update loops
 * @module systems/gameLogic
 */

import { game, updateGameState } from '../core/gameState.js';
import { buildingData, defenseData } from '../data/buildings.js';
import { techData } from '../data/technologies.js';
import { questData } from '../data/quests.js';
import { achievementData } from '../data/achievements.js';
import { boostData, eventData } from '../data/events.js';
import { getCost, canAfford, checkRequires, calculateProduction, calculateClickPower } from '../utils/calculations.js';
import { playSound } from './audio.js';
import { saveGame } from './storage.js';
import { lightHaptic, mediumHaptic, heavyHaptic, successHaptic, errorHaptic } from '../utils/haptics.js';

/**
 * Spend resources from game state
 * @param {Object} cost - Resources to spend
 */
export function spendResources(cost) {
    for (let res in cost) {
        game.resources[res] -= cost[res];
    }
}

/**
 * Add resources to game state
 * @param {Object} resources - Resources to add
 */
export function addResources(resources) {
    for (let res in resources) {
        if (game.resources[res] !== undefined) {
            game.resources[res] += resources[res];
            game.totalResources[res] += resources[res];
            game.prestige.totalLumenEarned += (res === 'lumen' ? resources[res] : 0);
        }
    }
}

/**
 * Buy a defense/click upgrade
 * @param {string} key - Defense upgrade key
 * @returns {boolean} True if purchase successful
 */
export function buyDefense(key) {
    const level = game.defense[key] || 0;
    const data = defenseData[key];

    if (level >= data.max) {
        errorHaptic();
        return false;
    }

    const cost = getCost(data, level);
    if (!canAfford(cost)) {
        errorHaptic();
        return false;
    }

    spendResources(cost);
    game.defense[key] = level + 1;
    game.stats.buildingsBuilt++;
    updateQuestProgress('builds');
    playSound('build');
    mediumHaptic();

    return true;
}

/**
 * Buy a building
 * @param {string} key - Building key
 * @returns {boolean} True if purchase successful
 */
export function buyBuilding(key) {
    const planet = game.planets[game.currentPlanet];
    const level = planet.buildings[key] || 0;
    const data = buildingData[key];

    if (level >= data.max) {
        errorHaptic();
        return false;
    }
    if (!checkRequires(data)) {
        errorHaptic();
        return false;
    }

    const cost = getCost(data, level, 'building');
    if (!canAfford(cost)) {
        errorHaptic();
        return false;
    }

    spendResources(cost);
    planet.buildings[key] = level + 1;
    game.stats.buildingsBuilt++;
    updateQuestProgress('builds');
    playSound('build');
    mediumHaptic();

    return true;
}

/**
 * Research a technology
 * @param {string} key - Technology key
 * @returns {boolean} True if research successful
 */
export function buyTechnology(key) {
    const level = game.technologies[key] || 0;
    const data = techData[key];

    if (level >= data.max) {
        errorHaptic();
        return false;
    }
    if (!checkRequires(data)) {
        errorHaptic();
        return false;
    }

    const cost = getCost(data, level, 'tech');
    if (!canAfford(cost)) {
        errorHaptic();
        return false;
    }

    spendResources(cost);
    game.technologies[key] = level + 1;
    game.stats.techsUnlocked++;
    playSound('success');
    heavyHaptic(); // Technologies are important!

    return true;
}

/**
 * Handle fragment click/capture
 * @param {Object} fragment - Fragment object
 * @returns {Object} Rewards from capturing fragment
 */
export function captureFragment(fragment) {
    const clickPower = calculateClickPower();
    const value = fragment.value * clickPower;

    // Update combo
    const now = Date.now();
    if (now - game.combo.lastClick < 3000) {
        game.combo.count++;
        game.combo.multiplier = 1 + (game.combo.count * 0.1); // +10% per combo
    } else {
        game.combo.count = 1;
        game.combo.multiplier = 1;
    }
    game.combo.lastClick = now;

    // Reset missed fragments counter on successful catch
    game.combo.missedFragments = 0;

    // Add resources
    addResources({ lumen: value });

    // Update stats
    game.stats.totalClicks++;
    game.stats.fragmentsCaught++;

    // Update quests
    updateQuestProgress('clicks');
    updateQuestProgress('fragmentsCaught');
    updateQuestProgress('lumenCollected', value);

    playSound('capture');
    lightHaptic(); // Light feedback for each click

    return { lumen: value, combo: game.combo.count };
}

/**
 * Switch to a different planet
 * @param {string} planetKey - Planet identifier
 * @returns {boolean} True if switch successful
 */
export function switchPlanet(planetKey) {
    const planet = game.planets[planetKey];

    if (!planet) return false;
    if (!planet.unlocked) return false;

    game.currentPlanet = planetKey;
    return true;
}

/**
 * Unlock a new planet
 * @param {string} planetKey - Planet identifier
 * @returns {boolean} True if unlock successful
 */
export function unlockPlanet(planetKey) {
    const planet = game.planets[planetKey];

    if (!planet || planet.unlocked) return false;
    if (!planet.unlockCost) return false;

    if (!canAfford(planet.unlockCost)) return false;

    spendResources(planet.unlockCost);
    planet.unlocked = true;
    playSound('success');

    return true;
}

/**
 * Perform prestige reset
 * @returns {Object} Prestige result
 */
export function performPrestige() {
    const requirement = 1000000 * Math.pow(10, game.prestige.level);

    if (game.prestige.totalLumenEarned < requirement) {
        return { success: false, message: 'Pas assez de Lumen total' };
    }

    // Reset most progress
    game.resources = { lumen: 0, energy: 0, antimatter: 0 };
    game.clickPower = 10;

    // Reset buildings for all planets
    for (let planetKey in game.planets) {
        const planet = game.planets[planetKey];
        for (let buildKey in planet.buildings) {
            planet.buildings[buildKey] = 0;
        }
    }

    // Reset defense
    for (let defKey in game.defense) {
        game.defense[defKey] = 0;
    }

    // Keep technologies (prestige benefit)
    // Keep artifacts
    // Keep achievements

    // Increment prestige level
    game.prestige.level++;

    saveGame();
    playSound('success');
    successHaptic(); // Big celebration for prestige!

    return {
        success: true,
        newLevel: game.prestige.level,
        bonus: game.prestige.level * 10
    };
}

/**
 * Update game loop
 * Called every tick to update resources and timers
 * @param {number} deltaTime - Time since last update in seconds
 */
export function updateGame(deltaTime) {
    // Update production
    const production = calculateProduction();

    for (let res in production) {
        addResources({ [res]: production[res] * deltaTime });
    }

    // Update auto-clicker
    if (game.defense.autoCapture) {
        const autoClicks = defenseData.autoCapture.effect(game.defense.autoCapture);
        const clickPower = calculateClickPower();
        addResources({ lumen: autoClicks * clickPower * deltaTime });
    }

    // Update timers
    game.stats.timePlayed += deltaTime * 1000;

    // Decay combo if no recent clicks
    if (Date.now() - game.combo.lastClick > 3000) {
        game.combo.count = 0;
        game.combo.multiplier = 1;
    }

    // Update active boosts/events
    game.activeBoosts = game.activeBoosts.filter(boost => boost.endTime > Date.now());
    game.activeEvents = game.activeEvents.filter(event => event.endTime > Date.now());

    // Update flash mission
    if (game.flashMission.active) {
        const timeLeft = (game.flashMission.startTime + game.flashMission.duration) - Date.now();
        if (timeLeft <= 0) {
            game.flashMission.active = false;
        }
    }
}

/**
 * Claim daily reward
 * @param {number} day - Day number (1-7)
 * @returns {Object} Reward or null if can't claim
 */
export function claimDailyReward(day) {
    const now = Date.now();
    const lastClaim = game.dailyRewards.lastClaim;
    const timeSinceLastClaim = now - lastClaim;

    // Check if 24 hours have passed
    if (lastClaim > 0 && timeSinceLastClaim < 24 * 60 * 60 * 1000) {
        return null;
    }

    // Check streak
    if (timeSinceLastClaim > 48 * 60 * 60 * 1000) {
        // Streak broken, reset to day 1
        game.dailyRewards.streak = 0;
    }

    game.dailyRewards.streak++;
    game.dailyRewards.lastClaim = now;

    // Get reward for current streak day
    const rewardDay = ((game.dailyRewards.streak - 1) % 7) + 1;
    const reward = {
        lumen: [100, 200, 500, 1000, 2000, 5000, 10000][rewardDay - 1] || 100,
        energy: [50, 100, 250, 500, 1000, 2500, 5000][rewardDay - 1] || 50
    };

    if (rewardDay === 7) {
        reward.antimatter = 1;
    }

    addResources(reward);
    playSound('success');

    return { day: rewardDay, reward };
}

/**
 * Open free lootbox
 * @returns {Object} Lootbox rewards or null if on cooldown
 */
export function openFreeLootbox() {
    const now = Date.now();
    const cooldown = 15 * 60 * 1000; // 15 minutes

    if (now - game.freeLootbox.lastOpen < cooldown) {
        return null;
    }

    game.freeLootbox.lastOpen = now;

    // Generate random rewards
    const lumenReward = Math.floor(Math.random() * 800) + 200;
    const energyReward = Math.floor(Math.random() * 150) + 50;

    const rewards = { lumen: lumenReward, energy: energyReward };
    addResources(rewards);
    playSound('success');

    return rewards;
}

/**
 * Initialize/regenerate 3 random quests
 */
export function generateDailyQuests() {
    const allQuests = Object.keys(questData.daily);

    // Shuffle and pick 3 quests
    const shuffled = allQuests.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    game.quests.active = selected.map(key => ({
        key,
        progress: 0,
        completed: false,
        claimed: false
    }));

    game.quests.lastReset = Date.now();
    game.quests.sessionProgress = {
        clicks: 0,
        builds: 0,
        lumenCollected: 0,
        fragmentsCaught: 0
    };
}

/**
 * Update quest progress based on player actions
 * @param {string} stat - The stat to update (clicks, builds, lumenCollected, fragmentsCaught)
 * @param {number} amount - Amount to add
 */
export function updateQuestProgress(stat, amount = 1) {
    if (!game.quests.sessionProgress[stat]) return;

    game.quests.sessionProgress[stat] += amount;

    // Update active quests
    game.quests.active.forEach(quest => {
        if (quest.completed || quest.claimed) return;

        const data = questData.daily[quest.key];
        if (data.stat === stat) {
            quest.progress = game.quests.sessionProgress[stat];
            if (quest.progress >= data.requirement) {
                quest.completed = true;
            }
        }
    });
}

/**
 * Claim quest reward
 * @param {number} questIndex - Index of quest in active array (0-2)
 * @returns {Object|null} Rewards or null if can't claim
 */
export function claimQuestReward(questIndex) {
    const quest = game.quests.active[questIndex];
    if (!quest || !quest.completed || quest.claimed) return null;

    const data = questData.daily[quest.key];

    addResources(data.reward);
    quest.claimed = true;
    playSound('success');

    return data.reward;
}

/**
 * Check if quests should be reset (every 15 mins)
 * Called in game loop
 */
export function checkQuestReset() {
    const now = Date.now();
    const timeSinceReset = now - game.quests.lastReset;
    const RESET_INTERVAL = 15 * 60 * 1000; // 15 minutes

    if (timeSinceReset >= RESET_INTERVAL) {
        // Check if all quests are completed
        const allCompleted = game.quests.active.every(q => q.completed);

        if (allCompleted) {
            generateDailyQuests();
            return true;
        }
    }

    return false;
}

/**
 * Check and unlock achievements
 * @returns {Array} Array of newly unlocked achievements
 */
export function checkAchievements() {
    const unlocked = [];

    for (const [key, data] of Object.entries(achievementData)) {
        // Skip if already unlocked
        if (game.achievements[key]) continue;

        let requirementMet = false;

        switch (data.category) {
            case 'clicks':
                requirementMet = game.stats.totalClicks >= data.requirement;
                break;

            case 'collection':
                requirementMet = game.totalResources[data.resource] >= data.requirement;
                break;

            case 'buildings':
                requirementMet = game.stats.buildingsBuilt >= data.requirement;
                break;

            case 'tech':
                const techCount = Object.values(game.technologies).filter(t => t > 0).length;
                requirementMet = techCount >= data.requirement;
                break;

            case 'planets':
                if (typeof data.requirement === 'string') {
                    // Specific planet check
                    requirementMet = game.planets[data.requirement]?.unlocked || false;
                } else {
                    // Count unlocked planets
                    const planetsUnlocked = Object.values(game.planets).filter(p => p.unlocked).length;
                    requirementMet = planetsUnlocked >= data.requirement;
                }
                break;

            case 'prestige':
                requirementMet = game.prestige.level >= data.requirement;
                break;
        }

        if (requirementMet) {
            game.achievements[key] = true;
            addResources(data.reward);
            unlocked.push({ key, data });
            playSound('success');
        }
    }

    return unlocked;
}

/**
 * Activate a boost
 * @param {string} boostKey - Boost key from boostData
 * @returns {boolean} True if boost was activated
 */
export function activateBoost(boostKey) {
    const data = boostData[boostKey];
    if (!data) return false;

    if (!canAfford(data.cost)) return false;

    spendResources(data.cost);

    const endTime = data.duration === -1 ? -1 : Date.now() + data.duration;

    game.activeBoosts.push({
        key: boostKey,
        endTime,
        effect: data.effect
    });

    playSound('success');
    return true;
}

/**
 * Activate an event
 * @param {string} eventKey - Event key from eventData
 * @returns {boolean} True if event was activated
 */
export function activateEvent(eventKey) {
    const data = eventData[eventKey];
    if (!data) return false;

    if (!canAfford(data.cost)) return false;

    spendResources(data.cost);

    const endTime = Date.now() + data.duration;

    game.activeEvents.push({
        key: eventKey,
        endTime,
        effect: data.effect
    });

    playSound('success');
    return true;
}
