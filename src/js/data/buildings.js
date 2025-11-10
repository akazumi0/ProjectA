/**
 * Building Data Module
 * Defines all building types and their properties
 * @module data/buildings
 */

/**
 * Building data configuration
 * Each building has production values, costs, and upgrade paths
 * @type {Object.<string, BuildingConfig>}
 */
export const buildingData = {
    lumenMine: {
        name: 'Mine de Lumen',
        desc: 'Extrait du Lumen',
        icon: '⛏️',
        baseCost: { lumen: 15 },
        costMult: 1.15,
        production: level => ({ lumen: level * 0.1 }),
        max: 100
    },
    energyCollector: {
        name: 'Collecteur d\'Énergie',
        desc: 'Capte l\'énergie stellaire',
        icon: '🔌',
        baseCost: { lumen: 100 },
        costMult: 1.15,
        production: level => ({ lumen: level * 1, energy: level * 0.05 }),
        max: 100
    },
    solarArray: {
        name: 'Réseau Solaire',
        desc: 'Panneaux solaires avancés',
        icon: '☀️',
        baseCost: { lumen: 1100 },
        costMult: 1.15,
        production: level => ({ lumen: level * 10, energy: level * 0.5 }),
        max: 100
    },
    fusionReactor: {
        name: 'Réacteur à Fusion',
        desc: 'Énergie nucléaire stellaire',
        icon: '⚛️',
        baseCost: { lumen: 12000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 100, energy: level * 5 }),
        max: 100
    },
    antimatterPlant: {
        name: 'Centrale Antimatière',
        desc: 'Génère de l\'antimatière',
        icon: '💥',
        baseCost: { lumen: 130000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 1000, energy: level * 50, antimatter: level * 0.001 }),
        requires: { tech: 'quantumResonance' },
        max: 100
    },
    stellarForge: {
        name: 'Forge Stellaire',
        desc: 'Forge alimentée par une étoile',
        icon: '🔥',
        baseCost: { lumen: 1400000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 10000, energy: level * 500 }),
        requires: { tech: 'quantumResonance' },
        max: 100
    },
    blackHoleGenerator: {
        name: 'Générateur à Trou Noir',
        desc: 'Exploite l\'énergie des trous noirs',
        icon: '🕳️',
        baseCost: { lumen: 20000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 100000, energy: level * 5000 }),
        requires: { tech: 'singularityControl' },
        max: 100
    },
    quantumComputer: {
        name: 'Ordinateur Quantique',
        desc: 'Calcule des possibilités infinies',
        icon: '💻',
        baseCost: { lumen: 330000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 1000000, energy: level * 50000 }),
        requires: { tech: 'quantumComputing' },
        max: 100
    },
    dimensionalRift: {
        name: 'Fissure Dimensionnelle',
        desc: 'Extrait l\'énergie d\'autres dimensions',
        icon: '🌌',
        baseCost: { lumen: 5100000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 10000000, energy: level * 500000 }),
        requires: { tech: 'dimensionalPhysics' },
        max: 100
    },
    timeCrystal: {
        name: 'Cristal Temporel',
        desc: 'Manipule le flux du temps',
        icon: '⏰',
        baseCost: { lumen: 75000000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 100000000, energy: level * 5000000 }),
        requires: { tech: 'temporalManipulation' },
        max: 100
    },
    cosmicPortal: {
        name: 'Portail Cosmique',
        desc: 'Connecte à l\'univers entier',
        icon: '🌀',
        baseCost: { lumen: 1000000000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 1000000000, energy: level * 50000000 }),
        requires: { tech: 'cosmicTravel' },
        max: 100
    },
    universalEngine: {
        name: 'Moteur Universel',
        desc: 'Alimente des galaxies entières',
        icon: '🎆',
        baseCost: { lumen: 14000000000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 10000000000, energy: level * 500000000 }),
        requires: { tech: 'universalPower' },
        max: 100
    },
    realityWeaver: {
        name: 'Tisseur de Réalité',
        desc: 'Modifie la réalité elle-même',
        icon: '✨',
        baseCost: { lumen: 170000000000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 100000000000, energy: level * 5000000000 }),
        requires: { tech: 'realityControl' },
        max: 100
    },
    infinityMatrix: {
        name: 'Matrice Infinie',
        desc: 'Production sans limite',
        icon: '♾️',
        baseCost: { lumen: 2100000000000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 1000000000000, energy: level * 50000000000 }),
        requires: { tech: 'infinityTech' },
        max: 100
    },
    transcendentCore: {
        name: 'Coeur Transcendant',
        desc: 'Au-delà de la compréhension',
        icon: '🌟',
        baseCost: { lumen: 26000000000000000 },
        costMult: 1.15,
        production: level => ({ lumen: level * 10000000000000, energy: level * 500000000000 }),
        requires: { tech: 'transcendence' },
        max: 100
    }
};

/**
 * Defense/Attack Items (clicking upgrades)
 * @type {Object.<string, DefenseConfig>}
 */
export const defenseData = {
    clickPower: {
        name: 'Gants Gravitationnels',
        desc: 'Augmente la puissance de capture',
        baseCost: { lumen: 50 },
        costMult: 1.5,
        effect: level => level * 5,
        display: level => `+${level * 5} par clic`,
        max: 30
    },
    fragmentRate: {
        name: 'Attracteur de Fragments',
        desc: 'Augmente le nombre de fragments',
        baseCost: { lumen: 200, energy: 50 },
        costMult: 1.8,
        effect: level => level * 0.1,
        display: level => `+${level * 10}% fragments`,
        max: 20
    },
    fragmentGlow: {
        name: 'Illuminateur Stellaire',
        desc: 'Rend les fragments plus visibles',
        baseCost: { lumen: 500, energy: 100 },
        costMult: 2,
        effect: level => level,
        display: level => `Niveau ${level}`,
        max: 5
    },
    autoCapture: {
        name: 'Capture Automatique',
        desc: 'Simule des clics automatiques',
        baseCost: { lumen: 1000, energy: 500 },
        costMult: 2.2,
        effect: level => level * 0.5,
        display: level => `${(level * 0.5).toFixed(1)} clics/s`,
        max: 10
    }
};
