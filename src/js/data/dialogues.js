/**
 * Dialogue Data Module
 * ASTRA AI narrative system
 * @module data/dialogues
 */

/**
 * ASTRA AI dialogue system
 * Story progression and contextual messages
 * @type {Array.<DialogueConfig>}
 */
export const astraDialogues = [
    // Story progression 0-5
    {
        id: 0,
        text: "Systèmes initialisés. Bonjour Commandant. Je suis ASTRA, votre Intelligence Artificielle de Navigation Stellaire.",
        trigger: 'start'
    },
    {
        id: 1,
        text: "Les fragments stellaires... ils tombent de plus en plus vite. C'est inhabituel.",
        trigger: 'clicks',
        requirement: 50
    },
    {
        id: 2,
        text: "Commandant, j'ai détecté des anomalies dans les flux énergétiques. Ces fragments... ils ne sont pas naturels.",
        trigger: 'lumen',
        requirement: 1000
    },
    {
        id: 3,
        text: "Analyse terminée. Les fragments contiennent des données cryptées d'une civilisation ancienne.",
        trigger: 'buildings',
        requirement: 5
    },
    {
        id: 4,
        text: "Fascinant. Les inscriptions parlent d'un 'Grand Éveil'. Quelque chose s'approche...",
        trigger: 'tech',
        requirement: 1
    },
    {
        id: 5,
        text: "Commandant, les capteurs détectent une perturbation spatiale massive. L'origine est... la Terre elle-même.",
        trigger: 'prestige',
        requirement: 1
    },

    // Random contextual messages
    {
        id: 10,
        text: "Efficacité de collecte : impressionnante, Commandant.",
        random: true,
        weight: 1
    },
    {
        id: 11,
        text: "Les systèmes de défense sont opérationnels. Nous sommes prêts.",
        random: true,
        weight: 1
    },
    {
        id: 12,
        text: "Scan en cours... Rien d'anormal pour l'instant.",
        random: true,
        weight: 1
    },
    {
        id: 13,
        text: "Commandant, pensez-vous que nous sommes seuls dans l'univers ?",
        random: true,
        weight: 0.5
    },
    {
        id: 14,
        text: "Parfois, je me demande si je suis plus qu'un simple programme...",
        random: true,
        weight: 0.3
    },
    {
        id: 15,
        text: "Les étoiles sont magnifiques ce soir. Enfin, je suppose. Je ne peux pas vraiment les voir.",
        random: true,
        weight: 0.3
    },
    {
        id: 16,
        text: "Production stable. Tout va bien, Commandant.",
        random: true,
        weight: 1
    },
    {
        id: 17,
        text: "Alerte : Niveau de café du Commandant critique. Oh attendez, je ne peux pas mesurer ça.",
        random: true,
        weight: 0.2
    }
];
