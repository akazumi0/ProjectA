/**
 * Artifact Data Module
 * Defines collectible artifacts and their bonuses
 * @module data/artifacts
 */

/**
 * Artifact system configuration
 * Artifacts provide permanent passive bonuses when collected
 * @type {Object.<string, ArtifactConfig>}
 */
export const artifactData = {
    timeCrystal: {
        name: 'Cristal du Temps',
        desc: '+5% vitesse de jeu',
        icon: '⏰',
        rarity: 'rare',
        effect: { type: 'gameSpeed', value: 1.05 },
        bonus: '+5% vitesse'
    },
    ancientStar: {
        name: 'Étoile Ancienne',
        desc: '+10% production Lumen',
        icon: '⭐',
        rarity: 'epic',
        effect: { type: 'lumenBonus', value: 1.1 },
        bonus: '+10% Lumen'
    },
    energyCore: {
        name: 'Coeur Énergétique',
        desc: '+15% production Énergie',
        icon: '⚡',
        rarity: 'epic',
        effect: { type: 'energyBonus', value: 1.15 },
        bonus: '+15% Énergie'
    },
    antimatterCore: {
        name: 'Noyau d\'Antimatière',
        desc: '+1 antimatière par heure de jeu',
        icon: '💥',
        rarity: 'legendary',
        effect: { type: 'antimatterGen', value: 1 },
        bonus: '+1 antimatière/h'
    },
    luckyCharm: {
        name: 'Charme de Chance',
        desc: '+5% chance artefacts',
        icon: '🍀',
        rarity: 'rare',
        effect: { type: 'artifactChance', value: 0.05 },
        bonus: '+5% chance'
    },
    clickGem: {
        name: 'Gemme du Clicker',
        desc: '+25% puissance de clic',
        icon: '💎',
        rarity: 'epic',
        effect: { type: 'clickPower', value: 1.25 },
        bonus: '+25% clics'
    },
    infinityStone: {
        name: 'Pierre d\'Infinité',
        desc: '+50% toutes ressources',
        icon: '♾️',
        rarity: 'legendary',
        effect: { type: 'allResources', value: 1.5 },
        bonus: '+50% TOUT'
    },
    cosmicEye: {
        name: 'Oeil Cosmique',
        desc: 'Révèle les fragments dorés',
        icon: '👁️',
        rarity: 'epic',
        effect: { type: 'goldenFragments', value: true },
        bonus: 'Fragments dorés'
    }
};
