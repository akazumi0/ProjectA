/**
 * Calculations Module
 * Game mechanics calculations and formulas
 * @module utils/calculations
 */

import { game } from '../core/gameState.js';
import { buildingData, defenseData } from '../data/buildings.js';
import { techData } from '../data/technologies.js';
import { masteryData } from '../data/shop.js';
import { PRESTIGE } from '../core/constants.js';

/**
 * Calculate cost for next level of an item
 * @param {Object} data - Item data (building, tech, defense)
 * @param {number} level - Current level
 * @param {string} type - Item type for mastery discounts ('building', 'tech', null)
 * @returns {Object} Cost object with resources
 */
export function getCost(data, level, type = null) {
    const cost = {};

    for (let res in data.baseCost) {
        let amount = data.baseCost[res] * Math.pow(data.costMult, level);

        // Apply mastery discounts
        if (type === 'building' && game.masteries.buildMastery > 0) {
            const discount = masteryData.buildMastery.effect(game.masteries.buildMastery);
            amount *= (1 - discount);
        }
        if (type === 'tech' && game.masteries.techMastery > 0) {
            const discount = masteryData.techMastery.effect(game.masteries.techMastery);
            amount *= (1 - discount);
        }

        cost[res] = Math.floor(amount);
    }

    return cost;
}

/**
 * Check if player can afford a cost
 * @param {Object} cost - Cost object
 * @returns {boolean} True if affordable
 */
export function canAfford(cost) {
    for (let res in cost) {
        const available = game.resources[res] || 0;
        if (available < cost[res]) return false;
    }
    return true;
}

/**
 * Check if requirements are met for an item
 * @param {Object} data - Item data with optional 'requires' property
 * @returns {boolean} True if requirements met
 */
export function checkRequires(data) {
    if (!data.requires) return true;

    if (data.requires.tech && !game.technologies[data.requires.tech]) {
        return false;
    }

    if (data.requires.building) {
        const planet = game.planets[game.currentPlanet];
        const buildLevel = planet.buildings[data.requires.building] || 0;
        const reqLevel = data.requires.level || 1;
        if (buildLevel < reqLevel) return false;
    }

    return true;
}

/**
 * Calculate total production for current planet
 * @returns {Object} Production rates by resource
 */
export function calculateProduction() {
    const planet = game.planets[game.currentPlanet];
    const production = { lumen: 0, energy: 0, antimatter: 0 };

    // Calculate building production
    for (let buildKey in planet.buildings) {
        const level = planet.buildings[buildKey];
        if (level > 0) {
            const data = buildingData[buildKey];
            const prod = data.production(level);

            for (let res in prod) {
                production[res] += prod[res];
            }
        }
    }

    // Apply technology multipliers
    if (game.technologies.automationI) {
        const mineLevel = planet.buildings.lumenMine || 0;
        production.lumen += buildingData.lumenMine.production(mineLevel).lumen;
    }

    if (game.technologies.automationII) {
        const collectorLevel = planet.buildings.energyCollector || 0;
        production.lumen += buildingData.energyCollector.production(collectorLevel).lumen;
    }

    if (game.technologies.automationIII) {
        const arrayLevel = planet.buildings.solarArray || 0;
        production.lumen += buildingData.solarArray.production(arrayLevel).lumen;
    }

    // Apply synergy technologies
    let synergyBonus = 1;
    if (game.technologies.synergy) {
        synergyBonus += game.technologies.synergy * 0.01;
    }
    if (game.technologies.quantumSynergy) {
        synergyBonus += game.technologies.quantumSynergy * 0.02;
    }
    if (game.technologies.cosmicSynergy) {
        synergyBonus += game.technologies.cosmicSynergy * 0.05;
    }

    for (let res in production) {
        production[res] *= synergyBonus;
    }

    // Apply planet bonus
    for (let res in production) {
        production[res] *= planet.bonus[res] || 1;
    }

    // Apply prestige bonus
    const prestigeBonus = 1 + (game.prestige.level * PRESTIGE.BONUS_PER_LEVEL / 100);
    for (let res in production) {
        production[res] *= prestigeBonus;
    }

    // Apply active boosts
    for (let boost of game.activeBoosts) {
        if (boost.effect.type === 'production' && boost.endTime > Date.now()) {
            for (let res in production) {
                production[res] *= boost.effect.multiplier;
            }
        }
    }

    // Apply artifact bonuses
    for (let artifactKey of game.artifacts.active) {
        // Artifact bonus logic would go here
        // This requires importing artifact data
    }

    return production;
}

/**
 * Calculate effective click power
 * @returns {number} Total click power
 */
export function calculateClickPower() {
    let power = game.clickPower;

    // Add defense upgrades
    if (game.defense.clickPower) {
        power += defenseData.clickPower.effect(game.defense.clickPower);
    }

    // Apply technology bonuses
    if (game.technologies.clickPowerBoost) {
        power *= Math.pow(2, game.technologies.clickPowerBoost);
    }

    // Apply lucky fragments tech
    if (game.technologies.luckyFragments) {
        power *= 1.5;
    }

    // Apply click mastery
    if (game.masteries.clickMastery > 0) {
        const bonus = masteryData.clickMastery.effect(game.masteries.clickMastery);
        power *= (1 + bonus);
    }

    // Apply combo multiplier
    power *= game.combo.multiplier;

    // Apply active boosts
    for (let boost of game.activeBoosts) {
        if (boost.effect.type === 'clickPower' && boost.endTime > Date.now()) {
            power *= boost.effect.multiplier;
        }
    }

    return Math.floor(power);
}

/**
 * Calculate fragment spawn rate
 * @returns {number} Spawn rate in fragments per second
 */
export function calculateFragmentSpawnRate() {
    let rate = game.fragmentSpawnRate;

    // Apply defense upgrades
    if (game.defense.fragmentRate) {
        rate *= (1 + defenseData.fragmentRate.effect(game.defense.fragmentRate));
    }

    // Apply active events
    for (let event of game.activeEvents) {
        if (event.effect.type === 'spawnRate' && event.endTime > Date.now()) {
            rate *= event.effect.multiplier;
        }
    }

    return rate;
}

/**
 * Calculate prestige requirements
 * @returns {Object} Prestige info {canPrestige, requirement, bonus}
 */
export function calculatePrestigeInfo() {
    const requirement = PRESTIGE.BASE_REQUIREMENT * Math.pow(10, game.prestige.level);
    const canPrestige = game.prestige.totalLumenEarned >= requirement;
    const bonus = (game.prestige.level + 1) * PRESTIGE.BONUS_PER_LEVEL;

    return {
        canPrestige,
        requirement,
        currentTotal: game.prestige.totalLumenEarned,
        nextLevel: game.prestige.level + 1,
        bonus
    };
}

/**
 * Calculate offline earnings
 * @param {number} offlineTime - Time offline in milliseconds
 * @returns {Object} Offline earnings by resource
 */
export function calculateOfflineEarnings(offlineTime) {
    const production = calculateProduction();
    const multiplier = game.permanentBoosts.offlineBonus || 1;
    const earnings = {};

    const offlineSeconds = Math.min(offlineTime, 4 * 60 * 60 * 1000) / 1000; // Max 4 hours

    for (let res in production) {
        earnings[res] = Math.floor(production[res] * offlineSeconds * multiplier);
    }

    return earnings;
}

/**
 * Random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float
 */
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Weighted random selection
 * @param {Array} items - Array of items with 'weight' property
 * @returns {*} Selected item
 */
export function weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (let item of items) {
        random -= item.weight;
        if (random <= 0) return item;
    }

    return items[items.length - 1];
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
