/**
 * Shop Data Module
 * Defines lootboxes and premium shop items
 * @module data/shop
 */

/**
 * Lootbox definitions
 * Different tiers of random reward boxes
 * @type {Object.<string, LootboxConfig>}
 */
export const lootboxData = {
    bronze: {
        name: 'Coffre Bronze',
        cost: { lumen: 500 },
        icon: '📦',
        rewards: {
            lumen: { min: 200, max: 1000 },
            energy: { min: 50, max: 200 },
            boostChance: 0.05
        }
    },
    silver: {
        name: 'Coffre Argent',
        cost: { lumen: 2000, energy: 500 },
        icon: '🏆',
        rewards: {
            lumen: { min: 1000, max: 5000 },
            energy: { min: 500, max: 2000 },
            boostChance: 0.10
        }
    },
    gold: {
        name: 'Coffre Or',
        cost: { lumen: 10000, energy: 5000 },
        icon: '💎',
        rewards: {
            lumen: { min: 10000, max: 50000 },
            energy: { min: 5000, max: 20000 },
            antimatter: { min: 1, max: 3 },
            boostChance: 0.25,
            multiplierChance: 0.10 // 10% chance for 1h x2 multiplier
        }
    }
};

/**
 * Premium shop configuration (for Capacitor IAP integration)
 * In-app purchase product definitions
 * @type {Object.<string, PremiumProductConfig>}
 */
export const premiumShopData = {
    antimatterSmall: {
        name: 'Pack Antimatière Petit',
        desc: '10 Antimatière',
        icon: '💥',
        amount: 10,
        price: 0.99,
        currency: 'USD',
        productId: 'com.fallingstars.antimatter.small'
    },
    antimatterMedium: {
        name: 'Pack Antimatière Moyen',
        desc: '50 Antimatière',
        icon: '💥💥',
        amount: 50,
        price: 3.99,
        currency: 'USD',
        productId: 'com.fallingstars.antimatter.medium',
        bonus: '+ 5 bonus!'
    },
    antimatterLarge: {
        name: 'Pack Antimatière Large',
        desc: '150 Antimatière',
        icon: '💥💥💥',
        amount: 150,
        price: 9.99,
        currency: 'USD',
        productId: 'com.fallingstars.antimatter.large',
        bonus: '+ 20 bonus!'
    },
    antimatterMega: {
        name: 'Pack Antimatière Méga',
        desc: '500 Antimatière',
        icon: '💥✨',
        amount: 500,
        price: 24.99,
        currency: 'USD',
        productId: 'com.fallingstars.antimatter.mega',
        bonus: '+ 100 bonus!'
    },
    starterPack: {
        name: 'Pack Démarrage',
        desc: '100 Antimatière + Bonus x2 Production (24h)',
        icon: '🎁',
        amount: 100,
        price: 4.99,
        currency: 'USD',
        productId: 'com.fallingstars.starter.pack',
        extras: { boost: 'production2x24h' }
    }
};

/**
 * Mastery system configuration
 * Player progression through repeated actions
 * @type {Object.<string, MasteryConfig>}
 */
export const masteryData = {
    clickMastery: {
        name: 'Maître du Clic',
        desc: 'Augmente le click power',
        icon: '👆',
        maxLevel: 10,
        requirement: (level) => level * 500, // Clics requis
        effect: (level) => level * 0.05, // +5% par niveau
        stat: 'totalClicks'
    },
    buildMastery: {
        name: 'Architecte',
        desc: 'Réduit le coût des bâtiments',
        icon: '🏗️',
        maxLevel: 10,
        requirement: (level) => level * 10,
        effect: (level) => level * 0.03, // -3% par niveau
        stat: 'buildingsBuilt'
    },
    techMastery: {
        name: 'Scientifique',
        desc: 'Réduit le coût des technologies',
        icon: '🔬',
        maxLevel: 5,
        requirement: (level) => level * 2,
        effect: (level) => level * 0.05, // -5% par niveau
        stat: 'techsUnlocked'
    }
};
