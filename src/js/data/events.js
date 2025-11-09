/**
 * Events Data Module
 * Defines temporary events, boosts, and story events
 * @module data/events
 */

/**
 * Temporary event definitions
 * Events can be activated for limited time bonuses
 * @type {Object.<string, EventConfig>}
 */
export const eventData = {
    starRain: {
        name: 'Pluie d\'Étoiles',
        desc: 'x2 Lumen pendant 1h',
        icon: '🌟',
        cost: { energy: 1000 },
        duration: 60 * 60 * 1000, // 1h
        effect: { resource: 'lumen', multiplier: 2 }
    },
    solarStorm: {
        name: 'Tempête Solaire',
        desc: 'x2 Énergie pendant 1h',
        icon: '☀️',
        cost: { lumen: 5000 },
        duration: 60 * 60 * 1000,
        effect: { resource: 'energy', multiplier: 2 }
    },
    superSpawn: {
        name: 'Super Spawn',
        desc: '+100% taux apparition pendant 5min',
        icon: '⚡',
        cost: { energy: 500 },
        duration: 5 * 60 * 1000,
        effect: { type: 'spawnRate', multiplier: 2 }
    }
};

/**
 * Boost shop definitions
 * Purchasable temporary and permanent boosts
 * @type {Object.<string, BoostConfig>}
 */
export const boostData = {
    production2x: {
        name: 'Production x2',
        desc: 'Double la production pendant 30min',
        icon: '⚡',
        cost: { energy: 2000 },
        duration: 30 * 60 * 1000,
        effect: { type: 'production', multiplier: 2 }
    },
    clickPower3x: {
        name: 'Click Power x3',
        desc: 'Triple la puissance de clic pendant 10min',
        icon: '👆',
        cost: { energy: 1000 },
        duration: 10 * 60 * 1000,
        effect: { type: 'clickPower', multiplier: 3 }
    },
    autoClicker: {
        name: 'Auto-Clicker',
        desc: 'Simule 1 clic/seconde pendant 1h',
        icon: '🤖',
        cost: { energy: 5000 },
        duration: 60 * 60 * 1000,
        effect: { type: 'autoClick', value: 1 }
    },
    offlineBonus: {
        name: 'Bonus Hors Ligne',
        desc: '+50% gains hors ligne (permanent)',
        icon: '💤',
        cost: { antimatter: 5 },
        duration: -1, // Permanent
        effect: { type: 'offlineBonus', multiplier: 1.5 }
    }
};

/**
 * Story event definitions with choices
 * Interactive narrative events with multiple outcomes
 * @type {Object.<string, StoryEventConfig>}
 */
export const storyEventData = {
    meteorite: {
        name: 'Météorite Géante',
        icon: '☄️',
        desc: 'Une météorite massive approche ! Utiliser les boucliers pourrait la détruire, mais consomme de l\'énergie.',
        choices: [
            {
                text: 'Activer les boucliers',
                cost: { energy: 500 },
                success: { chance: 0.7, reward: { lumen: 3000, energy: 500 }, message: '💥 Météorite détruite ! Fragments récupérés !' },
                failure: { penalty: { lumen: -500 }, message: '⚠️ Boucliers surchargés ! Pertes matérielles...' }
            },
            {
                text: 'Esquiver',
                cost: {},
                success: { chance: 1, reward: {}, message: '✓ Esquive réussie. Aucun dégât.' }
            },
            {
                text: 'Ne rien faire',
                cost: {},
                success: { chance: 0.3, reward: { lumen: 500 }, message: '🍀 Chanceux ! Des fragments sont tombés !' },
                failure: { penalty: { lumen: -1000, energy: -200 }, message: '💥 Impact ! Dégâts aux installations !' }
            }
        ]
    },
    signal: {
        name: 'Signal Mystérieux',
        icon: '📡',
        desc: 'Un signal étrange provient d\'une zone inexploré. Il pourrait s\'agir d\'une technologie alien.',
        choices: [
            {
                text: 'Envoyer une sonde',
                cost: { energy: 500 },
                success: { chance: 0.6, reward: { artifact: true }, message: '🎁 Artefact alien découvert !' },
                failure: { penalty: { energy: -500 }, message: '📡 Signal perdu. Sonde détruite.' }
            },
            {
                text: 'Y aller personnellement',
                cost: { energy: 1000 },
                success: { chance: 0.4, reward: { lumen: 5000, energy: 2000, artifact: true }, message: '🌟 Incroyable découverte ! Technologie avancée !' },
                failure: { penalty: { lumen: -2000, energy: -1000 }, message: '⚠️ Piège ! Systèmes endommagés !' }
            },
            {
                text: 'Ignorer',
                cost: {},
                success: { chance: 1, reward: {}, message: 'Signal ignoré. Prudence est mère de sûreté.' }
            }
        ]
    },
    vortex: {
        name: 'Vortex Temporel',
        icon: '🌀',
        desc: 'Un vortex temporel s\'ouvre ! Voyager dans le futur pourrait accélérer la production, mais c\'est risqué.',
        choices: [
            {
                text: 'Voyager 10 min dans le futur',
                cost: { energy: 1000 },
                success: { chance: 0.8, reward: { timeSkip: 600 }, message: '⏰ Saut temporel réussi ! 10 minutes de production gagnées !' },
                failure: { penalty: { lumen: -1000, energy: -500 }, message: '⚠️ Paradoxe temporel ! Ressources perdues dans le temps !' }
            },
            {
                text: 'Étudier le vortex',
                cost: { energy: 500 },
                success: { chance: 1, reward: { lumen: 2000, energy: 500 }, message: '🔬 Données temporelles collectées !' }
            },
            {
                text: 'S\'éloigner',
                cost: {},
                success: { chance: 1, reward: {}, message: 'Vous évitez prudemment le vortex.' }
            }
        ]
    },
    trader: {
        name: 'Commerçant Alien',
        icon: '👽',
        desc: 'Un vaisseau alien propose d\'échanger des ressources. Leur technologie semble avancée mais étrange.',
        choices: [
            {
                text: 'Échanger (2000L contre Énergie)',
                cost: { lumen: 2000 },
                success: { chance: 0.9, reward: { energy: 1500 }, message: '🤝 Échange réussi ! Énergie acquise !' },
                failure: { penalty: { lumen: -2000 }, message: '👽 Escroquerie ! Ils sont partis avec vos ressources !' }
            },
            {
                text: 'Essayer de voler leur tech',
                cost: {},
                success: { chance: 0.2, reward: { artifact: true, antimatter: 1 }, message: '🎯 Vol réussi ! Technologie alien volée !' },
                failure: { penalty: { lumen: -3000, energy: -1000 }, message: '⚔️ Combat ! Vous perdez !' }
            },
            {
                text: 'Refuser poliment',
                cost: {},
                success: { chance: 1, reward: { lumen: 500 }, message: '🙏 Ils apprécient votre honnêteté et laissent un cadeau.' }
            }
        ]
    },
    anomaly: {
        name: 'Anomalie Quantique',
        icon: '⚛️',
        desc: 'Une anomalie quantique amplifie l\'énergie. Exploiter cela est dangereux.',
        choices: [
            {
                text: 'Dupliquer les ressources',
                cost: { energy: 2000 },
                success: { chance: 0.5, reward: { lumen: 10000, energy: 5000 }, message: '✨ Duplication réussie ! Ressources doublées !' },
                failure: { penalty: { lumen: -5000, energy: -2000 }, message: '💥 Effondrement quantique ! Tout est perdu !' }
            },
            {
                text: 'Stabiliser l\'anomalie',
                cost: { energy: 1000 },
                success: { chance: 0.9, reward: { energy: 1500, boost: 'production2x' }, message: '⚡ Anomalie stabilisée ! Boost de production activé !' }
            },
            {
                text: 'Observer de loin',
                cost: {},
                success: { chance: 1, reward: { lumen: 1000 }, message: '🔭 Observations scientifiques enregistrées.' }
            }
        ]
    }
};

/**
 * Flash mission type definitions
 * Time-limited challenges with special rewards
 * @type {Object.<string, FlashMissionConfig>}
 */
export const flashMissionTypes = {
    speedClicks: {
        name: 'DÉFI RAPIDE',
        icon: '⚡',
        desc: 'Capturer {goal} fragments en {duration}s',
        goalRange: [10, 30],
        durationRange: [30, 60],
        type: 'fragments',
        rewards: [
            { lumen: 1000, energy: 500 },
            { energy: 1000 },
            { boost: 'production2x' }
        ]
    },
    comboMaster: {
        name: 'MAÎTRE DU COMBO',
        icon: '🔥',
        desc: 'Atteindre un combo x{goal}',
        goalRange: [10, 25],
        durationRange: [45, 90],
        type: 'combo',
        rewards: [
            { lumen: 2000 },
            { artifact: true },
            { boost: 'clickPower3x' }
        ]
    },
    buildRush: {
        name: 'CONSTRUCTION RAPIDE',
        icon: '🏗️',
        desc: 'Construire {goal} bâtiments en {duration}s',
        goalRange: [2, 5],
        durationRange: [60, 120],
        type: 'buildings',
        rewards: [
            { lumen: 5000, energy: 2000 },
            { energy: 3000 },
            { discount: 0.5, duration: 300 } // 50% off for 5min
        ]
    },
    collector: {
        name: 'COLLECTE INTENSIVE',
        icon: '💰',
        desc: 'Collecter {goal} Lumen en {duration}s',
        goalRange: [5000, 15000],
        durationRange: [60, 120],
        type: 'lumen',
        rewards: [
            { energy: 4000 },
            { lumen: 5000 },
            { boost: 'production2x' }
        ]
    }
};
