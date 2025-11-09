/**
 * Achievement Data Module
 * Defines all achievements and rewards
 * @module data/achievements
 */

/**
 * Achievement definitions
 * Players unlock achievements by meeting specific criteria
 * @type {Object.<string, AchievementConfig>}
 */
export const achievementData = {
    // Click Achievements
    firstClick: {
        name: 'Premier Clic',
        desc: 'Cliquer sur un fragment',
        category: 'clicks',
        requirement: 1,
        reward: { lumen: 10 },
        icon: '👆'
    },
    click100: {
        name: 'Clicker Novice',
        desc: 'Cliquer 100 fois',
        category: 'clicks',
        requirement: 100,
        reward: { lumen: 100 },
        icon: '👍'
    },
    click1000: {
        name: 'Clicker Expérimenté',
        desc: 'Cliquer 1000 fois',
        category: 'clicks',
        requirement: 1000,
        reward: { lumen: 1000, energy: 100 },
        icon: '💪'
    },
    click10000: {
        name: 'Maître du Clic',
        desc: 'Cliquer 10000 fois',
        category: 'clicks',
        requirement: 10000,
        reward: { lumen: 10000, energy: 1000 },
        icon: '⚡'
    },
    // Collection Achievements
    lumen1k: {
        name: 'Premier Millier',
        desc: 'Collecter 1K Lumen total',
        category: 'collection',
        requirement: 1000,
        resource: 'lumen',
        reward: { energy: 50 },
        icon: '⭐'
    },
    lumen100k: {
        name: 'Collectionneur',
        desc: 'Collecter 100K Lumen total',
        category: 'collection',
        requirement: 100000,
        resource: 'lumen',
        reward: { energy: 1500 },
        icon: '💎'
    },
    lumen1m: {
        name: 'Magnat Stellaire',
        desc: 'Collecter 1M Lumen total',
        category: 'collection',
        requirement: 1000000,
        resource: 'lumen',
        reward: { energy: 10000, antimatter: 1 },
        icon: '👑'
    },
    energy10k: {
        name: 'Chargé d\'Énergie',
        desc: 'Collecter 10K Énergie total',
        category: 'collection',
        requirement: 10000,
        resource: 'energy',
        reward: { lumen: 7500 },
        icon: '🔋'
    },
    antimatter10: {
        name: 'Découvreur d\'Antimatière',
        desc: 'Collecter 10 Antimatière total',
        category: 'collection',
        requirement: 10,
        resource: 'antimatter',
        reward: { lumen: 50000, energy: 10000 },
        icon: '💥'
    },
    // Building Achievements
    firstBuilding: {
        name: 'Premier Bâtiment',
        desc: 'Construire un bâtiment',
        category: 'buildings',
        requirement: 1,
        reward: { lumen: 50 },
        icon: '🏗️'
    },
    buildings10: {
        name: 'Architecte',
        desc: 'Construire 10 bâtiments',
        category: 'buildings',
        requirement: 10,
        reward: { lumen: 500, energy: 100 },
        icon: '🏛️'
    },
    buildings50: {
        name: 'Urbaniste',
        desc: 'Construire 50 bâtiments',
        category: 'buildings',
        requirement: 50,
        reward: { lumen: 5000, energy: 1500 },
        icon: '🌆'
    },
    buildings100: {
        name: 'Constructeur Galactique',
        desc: 'Construire 100 bâtiments',
        category: 'buildings',
        requirement: 100,
        reward: { lumen: 20000, energy: 7500, antimatter: 1 },
        icon: '🌃'
    },
    // Technology Achievements
    firstTech: {
        name: 'Premier Pas',
        desc: 'Débloquer une technologie',
        category: 'tech',
        requirement: 1,
        reward: { lumen: 100, energy: 50 },
        icon: '🔬'
    },
    allTechs: {
        name: 'Génie Scientifique',
        desc: 'Débloquer toutes les technologies',
        category: 'tech',
        requirement: 4,
        reward: { lumen: 50000, energy: 15000, antimatter: 2 },
        icon: '🧠'
    },
    // Planet Achievements
    colonizeMars: {
        name: 'Colon Mars',
        desc: 'Coloniser Mars',
        category: 'planets',
        requirement: 'mars',
        reward: { lumen: 10000, energy: 2000 },
        icon: '🔴'
    },
    colonizeTitan: {
        name: 'Explorateur de Titan',
        desc: 'Coloniser Titan',
        category: 'planets',
        requirement: 'titan',
        reward: { lumen: 50000, energy: 15000, antimatter: 2 },
        icon: '🪐'
    },
    allPlanets: {
        name: 'Maître des Mondes',
        desc: 'Coloniser toutes les planètes',
        category: 'planets',
        requirement: 3,
        reward: { lumen: 100000, energy: 30000, antimatter: 3 },
        icon: '🌌'
    },
    // Prestige Achievements
    firstPrestige: {
        name: 'Renaissance',
        desc: 'Faire un premier Prestige',
        category: 'prestige',
        requirement: 1,
        reward: { lumen: 10000 },
        icon: '🌠'
    },
    prestige5: {
        name: 'Vétéran',
        desc: 'Atteindre Prestige niveau 5',
        category: 'prestige',
        requirement: 5,
        reward: { lumen: 100000, energy: 30000, antimatter: 3 },
        icon: '⭐'
    },
    prestige10: {
        name: 'Légende',
        desc: 'Atteindre Prestige niveau 10',
        category: 'prestige',
        requirement: 10,
        reward: { lumen: 500000, energy: 150000, antimatter: 10 },
        icon: '👑'
    }
};
