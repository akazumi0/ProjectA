/**
 * Technology Data Module
 * Defines all technology research options
 * @module data/technologies
 */

/**
 * Technology tree configuration
 * Technologies unlock new buildings and provide bonuses
 * @type {Object.<string, TechnologyConfig>}
 */
export const techData = {
    clickPowerBoost: {
        name: 'Amplificateur de Clics',
        desc: 'Double la puissance de clic',
        icon: '👆',
        baseCost: { lumen: 100 },
        costMult: 10,
        max: 10
    },
    automationI: {
        name: 'Automation I',
        desc: 'Les mines produisent 2x plus',
        icon: '🤖',
        baseCost: { lumen: 1000 },
        costMult: 1,
        max: 1
    },
    automationII: {
        name: 'Automation II',
        desc: 'Les collecteurs produisent 2x plus',
        icon: '🤖',
        baseCost: { lumen: 5000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'automationI' }
    },
    automationIII: {
        name: 'Automation III',
        desc: 'Les réseaux solaires produisent 2x plus',
        icon: '🤖',
        baseCost: { lumen: 50000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'automationII' }
    },
    quantumResonance: {
        name: 'Résonance Quantique',
        desc: 'Débloque technologies quantiques',
        icon: '⚛️',
        baseCost: { lumen: 75000 },
        costMult: 1,
        max: 1
    },
    stellarPropulsion: {
        name: 'Propulsion Stellaire',
        desc: 'Permet colonisation planètes',
        icon: '🚀',
        baseCost: { lumen: 100000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'quantumResonance' }
    },
    singularityControl: {
        name: 'Contrôle de Singularité',
        desc: 'Maîtrise des trous noirs',
        icon: '🕳️',
        baseCost: { lumen: 10000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'quantumResonance' }
    },
    quantumComputing: {
        name: 'Calcul Quantique',
        desc: 'Débloque ordinateurs quantiques',
        icon: '💻',
        baseCost: { lumen: 150000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'singularityControl' }
    },
    dimensionalPhysics: {
        name: 'Physique Dimensionnelle',
        desc: 'Accès aux autres dimensions',
        icon: '🌌',
        baseCost: { lumen: 2500000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'quantumComputing' }
    },
    temporalManipulation: {
        name: 'Manipulation Temporelle',
        desc: 'Contrôle du temps',
        icon: '⏰',
        baseCost: { lumen: 35000000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'dimensionalPhysics' }
    },
    cosmicTravel: {
        name: 'Voyage Cosmique',
        desc: 'Voyage à travers l\'univers',
        icon: '🌀',
        baseCost: { lumen: 500000000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'temporalManipulation' }
    },
    universalPower: {
        name: 'Puissance Universelle',
        desc: 'Énergie à l\'échelle galactique',
        icon: '🎆',
        baseCost: { lumen: 7000000000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'cosmicTravel' }
    },
    realityControl: {
        name: 'Contrôle de la Réalité',
        desc: 'Modification de la réalité',
        icon: '✨',
        baseCost: { lumen: 85000000000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'universalPower' }
    },
    infinityTech: {
        name: 'Technologie Infinie',
        desc: 'Au-delà des limites',
        icon: '♾️',
        baseCost: { lumen: 1000000000000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'realityControl' }
    },
    transcendence: {
        name: 'Transcendance',
        desc: 'Ascension ultime',
        icon: '🌟',
        baseCost: { lumen: 13000000000000000 },
        costMult: 1,
        max: 1,
        requires: { tech: 'infinityTech' }
    },
    synergy: {
        name: 'Synergie Globale',
        desc: '+1% production globale/niveau',
        icon: '🔗',
        baseCost: { lumen: 10000 },
        costMult: 5,
        max: 20
    },
    quantumSynergy: {
        name: 'Synergie Quantique',
        desc: '+2% production globale/niveau',
        icon: '⚡',
        baseCost: { lumen: 1000000 },
        costMult: 10,
        max: 15,
        requires: { tech: 'quantumResonance' }
    },
    cosmicSynergy: {
        name: 'Synergie Cosmique',
        desc: '+5% production globale/niveau',
        icon: '💫',
        baseCost: { lumen: 100000000000 },
        costMult: 15,
        max: 10,
        requires: { tech: 'cosmicTravel' }
    },
    astraAI: {
        name: 'IA ASTRA',
        desc: '+10% efficacité ASTRA/niveau',
        icon: '🤖',
        baseCost: { lumen: 500000 },
        costMult: 3,
        max: 10,
        requires: { tech: 'quantumResonance' }
    },
    luckyFragments: {
        name: 'Fragments Chanceux',
        desc: '+50% valeur des fragments',
        icon: '🍀',
        baseCost: { lumen: 777777 },
        costMult: 1,
        max: 1
    }
};
