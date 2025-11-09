/**
 * Quest Data Module
 * Defines daily and special quests
 * @module data/quests
 */

/**
 * Quest definitions
 * Daily quests reset every 24 hours
 * @type {Object.<string, Object.<string, QuestConfig>>}
 */
export const questData = {
    daily: {
        click100: {
            name: 'Clicker Actif',
            desc: 'Cliquer 100 fois',
            requirement: 100,
            reward: { lumen: 200 },
            stat: 'clicks',
            icon: '👆'
        },
        build3: {
            name: 'Constructeur',
            desc: 'Construire 3 bâtiments',
            requirement: 3,
            reward: { lumen: 500, energy: 100 },
            stat: 'builds',
            icon: '🏗️'
        },
        collect5k: {
            name: 'Collectionneur',
            desc: 'Collecter 5K Lumen',
            requirement: 5000,
            reward: { energy: 1000 },
            stat: 'lumenCollected',
            icon: '⭐'
        },
        fragments50: {
            name: 'Chasseur d\'Étoiles',
            desc: 'Attraper 50 fragments',
            requirement: 50,
            reward: { lumen: 300, energy: 50 },
            stat: 'fragmentsCaught',
            icon: '💫'
        }
    }
};
