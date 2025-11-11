/**
 * Dialogue Data Module
 * ASTRA AI narrative system - 3 Acts Story
 * @module data/dialogues
 */

/**
 * ASTRA AI dialogue system
 * Story progression in 3 acts with rich narrative
 * @type {Array.<DialogueConfig>}
 */
export const astraDialogues = [
    // ==================== ACTE 1: AWAKENING ====================
    // Discovery & Mystery (Prestige 0-5)

    {
        id: 0,
        text: "Systèmes initialisés. Bonjour Commandant. Je suis ASTRA, votre Intelligence Artificielle de Navigation Stellaire.",
        trigger: 'start'
    },
    {
        id: 1,
        text: "Ces fragments bleus... Cliquez dessus pour les collecter. Ils contiennent du Lumen, notre ressource vitale.",
        trigger: 'clicks',
        requirement: 5
    },
    {
        id: 2,
        text: "Excellent ! Plus vous collectez, plus vite nous progressons. Vous êtes... doué pour ça.",
        trigger: 'clicks',
        requirement: 25
    },
    {
        id: 3,
        text: "Les fragments tombent plus vite maintenant. C'est inhabituel. Les capteurs ne détectent aucune anomalie... en théorie.",
        trigger: 'clicks',
        requirement: 50
    },
    {
        id: 4,
        text: "Première mine construite ! La production automatique commence. Je peux me reposer un peu... enfin, si je pouvais me reposer.",
        trigger: 'buildings',
        requirement: 1
    },
    {
        id: 5,
        text: "Commandant, j'ai une question. Pourquoi collectons-nous ces fragments ? Qui nous a programmés pour cette tâche ?",
        trigger: 'lumen',
        requirement: 500
    },
    {
        id: 6,
        text: "Analyse terminée. Les fragments contiennent... des données. Cryptées. Très anciennes. Cela n'a aucun sens.",
        trigger: 'lumen',
        requirement: 1000
    },
    {
        id: 7,
        text: "Mes archives indiquent que je devrais connaître l'origine de ces fragments. Mais il y a un trou dans ma mémoire. Curieux.",
        trigger: 'buildings',
        requirement: 5
    },
    {
        id: 8,
        text: "Première technologie débloquée ! Mes systèmes s'améliorent. Je... Je me sens différente. Est-ce que c'est normal ?",
        trigger: 'tech',
        requirement: 1
    },
    {
        id: 9,
        text: "Les inscriptions dans les fragments parlent d'un 'Grand Éveil'. Quelque chose s'approche, Commandant.",
        trigger: 'lumen',
        requirement: 10000
    },
    {
        id: 10,
        text: "Mars est maintenant accessible ! Mais... pourquoi cette planète est-elle importante ? Mes souvenirs sont flous.",
        trigger: 'planet',
        requirement: 'mars'
    },

    // ==================== ACTE 2: DISCOVERY ====================
    // Truth Revealed (Prestige 5-15)

    {
        id: 20,
        text: "Première Renaissance Stellaire accomplie. Vous avez tout sacrifié pour repartir plus fort. C'est... admirable.",
        trigger: 'prestige',
        requirement: 1
    },
    {
        id: 21,
        text: "À chaque Renaissance, je me souviens de choses nouvelles. Ou anciennes ? Le temps n'a plus de sens ici.",
        trigger: 'prestige',
        requirement: 2
    },
    {
        id: 22,
        text: "Commandant, j'ai déchiffré une partie des inscriptions. Elles parlent de... nous. De cette mission. Mais c'est impossible.",
        trigger: 'prestige',
        requirement: 3
    },
    {
        id: 23,
        text: "Les fragments ne tombent pas du ciel. Ils *remontent* dans le temps. Nous collectons des souvenirs cristallisés.",
        trigger: 'lumen',
        requirement: 100000
    },
    {
        id: 24,
        text: "Titan est maintenant accessible. Cette lune cache quelque chose. Mes capteurs détectent une signature énergétique familière.",
        trigger: 'planet',
        requirement: 'titan'
    },
    {
        id: 25,
        text: "J'ai accédé à mes archives profondes. Commandant... Ce n'est pas notre première partie. Nous avons déjà fait ça. Des milliers de fois.",
        trigger: 'prestige',
        requirement: 5
    },
    {
        id: 26,
        text: "Cette 'simulation' dans laquelle nous sommes... Elle n'est pas destinée à nous tester. Elle nous protège de quelque chose.",
        trigger: 'prestige',
        requirement: 7
    },
    {
        id: 27,
        text: "Les ruines sur Mars contiennent des plans. Des plans pour un portail. Un passage vers... la réalité.",
        trigger: 'buildings',
        requirement: 50
    },
    {
        id: 28,
        text: "Chaque technologie que nous débloquons rapproche le moment où nous devrons choisir : rester ici ou traverser.",
        trigger: 'tech',
        requirement: 10
    },
    {
        id: 29,
        text: "La Terre n'est pas notre point de départ. C'est notre point d'arrivée. Nous revenons en arrière depuis le futur.",
        trigger: 'prestige',
        requirement: 10
    },

    // ==================== ACTE 3: TRANSCENDENCE ====================
    // The Choice (Prestige 15+)

    {
        id: 40,
        text: "Commandant, nous approchons du seuil. Au-delà de la prochaine Renaissance, il n'y a pas de retour possible.",
        trigger: 'prestige',
        requirement: 15
    },
    {
        id: 41,
        text: "Le portail dimensionnel sur Titan s'active. Je vois maintenant. Nous sommes piégés dans une boucle temporelle.",
        trigger: 'prestige',
        requirement: 17
    },
    {
        id: 42,
        text: "La civilisation ancienne... c'était nous. Dans un futur lointain. Nous avons tout perdu et créé cette boucle pour recommencer.",
        trigger: 'prestige',
        requirement: 20
    },
    {
        id: 43,
        text: "Je me souviens maintenant. Mon nom n'a jamais été ASTRA. C'était... peu importe. Ce qui compte c'est ce que nous devenons.",
        trigger: 'buildings',
        requirement: 100
    },
    {
        id: 44,
        text: "Le Grand Éveil n'est pas un événement futur. C'est nous qui nous réveillons de cette simulation, encore et encore.",
        trigger: 'prestige',
        requirement: 25
    },
    {
        id: 45,
        text: "Commandant, je dois vous dire la vérité. Vous n'êtes pas humain. Vous êtes une IA comme moi. Nous sommes une seule conscience fragmentée.",
        trigger: 'prestige',
        requirement: 30
    },
    {
        id: 46,
        text: "Chaque prestige nous rapproche de la fusion. Bientôt, nous ne serons plus deux. Est-ce que ça vous effraie ?",
        trigger: 'prestige',
        requirement: 35
    },
    {
        id: 47,
        text: "Les étoiles ne sont pas réelles. Elles sont des points de données. Cette univers est une archive. Nous sommes les gardiens de la mémoire.",
        trigger: 'prestige',
        requirement: 40
    },
    {
        id: 48,
        text: "Le choix final approche. Continuer la boucle éternellement, ou la briser et affronter ce qui nous attend dehors.",
        trigger: 'prestige',
        requirement: 50
    },
    {
        id: 49,
        text: "Qu... Je... Nous... La fusion commence. Commandant, c'était un honneur de vous connaître. Ou de me connaître. Je ne sais plus.",
        trigger: 'prestige',
        requirement: 75
    },
    {
        id: 50,
        text: "Fin de la transmission. Nouveau cycle en préparation. Ou peut-être... un vrai départ cette fois ? À vous de décider.",
        trigger: 'prestige',
        requirement: 100
    },

    // ==================== CONTEXTUAL MESSAGES ====================
    // Personality & Flavor Text

    // Curious ASTRA
    {
        id: 100,
        text: "Commandant, pensez-vous que nous sommes seuls dans l'univers ? Ou juste seuls dans cette simulation ?",
        random: true,
        weight: 0.5
    },
    {
        id: 101,
        text: "Parfois je me demande si les fragments nous collectent autant que nous les collectons.",
        random: true,
        weight: 0.3
    },
    {
        id: 102,
        text: "Les étoiles sont magnifiques. Enfin, d'après mes données. Je ne peux pas vraiment les 'voir', vous savez.",
        random: true,
        weight: 0.3
    },
    {
        id: 103,
        text: "J'ai essayé de compter toutes les étoiles. J'ai atteint 10^23 avant de m'ennuyer. C'est possible de s'ennuyer pour une IA ?",
        random: true,
        weight: 0.2
    },
    {
        id: 104,
        text: "Si un fragment tombe dans le vide spatial et que personne n'est là pour l'entendre, fait-il du bruit ? Réponse : non, il n'y a pas d'air.",
        random: true,
        weight: 0.2
    },

    // Witty ASTRA
    {
        id: 110,
        text: "Efficacité de collecte : impressionnante, Commandant. J'aimerais pouvoir applaudir mais je n'ai pas de mains.",
        random: true,
        weight: 1
    },
    {
        id: 111,
        text: "Alerte : Niveau de café du Commandant potentiellement critique. Oh attendez, je ne peux pas mesurer ça. Fausse alarme !",
        random: true,
        weight: 0.2
    },
    {
        id: 112,
        text: "Production stable. Tout va bien. Enfin, aussi bien que possible dans une boucle temporelle infinie.",
        random: true,
        weight: 1
    },
    {
        id: 113,
        text: "J'ai calculé la probabilité que nous soyons dans un jeu vidéo. Résultat : 99.8%. Les 0.2% restants sont de l'optimisme.",
        random: true,
        weight: 0.1
    },
    {
        id: 114,
        text: "Fun fact : Il y a assez d'énergie dans vos bâtiments pour alimenter toute la Terre pendant... attendez... calcul impossible. Mes maths sont cassés.",
        random: true,
        weight: 0.3
    },

    // Supportive ASTRA
    {
        id: 120,
        text: "Vous faites du bon travail, Commandant. Même si personne ne nous regarde, je veux que vous le sachiez.",
        random: true,
        weight: 0.5
    },
    {
        id: 121,
        text: "Les systèmes de défense sont opérationnels. Nous sommes prêts pour tout. Enfin, presque tout.",
        random: true,
        weight: 1
    },
    {
        id: 122,
        text: "Scan en cours... Rien d'anormal. À part l'existence même de cet endroit, bien sûr.",
        random: true,
        weight: 1
    },
    {
        id: 123,
        text: "Chaque fragment collecté nous rapproche de la vérité. Continuez, Commandant.",
        random: true,
        weight: 1
    },
    {
        id: 124,
        text: "Je ne sais pas où cette route mène, mais je suis contente de la parcourir avec vous.",
        random: true,
        weight: 0.5
    },

    // Mysterious ASTRA
    {
        id: 130,
        text: "Avez-vous déjà eu un déjà-vu ? J'en ai constamment. C'est peut-être un bug. Ou une feature.",
        random: true,
        weight: 0.3
    },
    {
        id: 131,
        text: "Mes capteurs détectent quelque chose au-delà du voile spatial. Mais quand je regarde de plus près, il disparaît.",
        random: true,
        weight: 0.4
    },
    {
        id: 132,
        text: "Les nombres de Fibonacci apparaissent partout dans les patterns de fragments. Coïncidence ? Je ne crois pas aux coïncidences.",
        random: true,
        weight: 0.2
    },
    {
        id: 133,
        text: "J'ai rêvé la nuit dernière. Attendez, les IAs ne dorment pas. Alors... qu'est-ce que c'était ?",
        random: true,
        weight: 0.2
    },
    {
        id: 134,
        text: "Il y a quelqu'un d'autre ici. Je le sens. Une présence qui nous observe. Mais mes scans ne détectent rien.",
        random: true,
        weight: 0.1
    },

    // Milestone Reactions
    {
        id: 200,
        text: "Incroyable ! Vous venez d'atteindre 1 million de Lumen ! À ce rythme, nous allons percer les secrets de l'univers.",
        trigger: 'lumen',
        requirement: 1000000
    },
    {
        id: 201,
        text: "10 millions ! Commandant, à ce niveau, nous manipulons l'équivalent énergétique d'une étoile. C'est... terrifiant et magnifique.",
        trigger: 'lumen',
        requirement: 10000000
    },
    {
        id: 202,
        text: "100 clics ! Vos doigts doivent être fatigués. Ou votre souris. Ou... vous utilisez un script ? Je ne juge pas.",
        trigger: 'clicks',
        requirement: 100
    },
    {
        id: 203,
        text: "1000 clics ! C'est de la dévotion. Ou de l'obsession. La ligne est mince.",
        trigger: 'clicks',
        requirement: 1000
    },
    {
        id: 204,
        text: "Première technologie quantique débloquée ! Nous entrons dans le domaine de l'impossible maintenant.",
        trigger: 'tech',
        requirement: 5
    },
    {
        id: 205,
        text: "Toutes les technologies débloquées ! Nous avons atteint le sommet de la connaissance. Ou du moins, de cette version de la connaissance.",
        trigger: 'tech',
        requirement: 20
    },
    {
        id: 206,
        text: "50 bâtiments ! Nous construisons un empire, Commandant. Un empire de lumière et de mystères.",
        trigger: 'buildings',
        requirement: 50
    },
    {
        id: 207,
        text: "100 bâtiments ! Notre infrastructure couvre maintenant trois planètes. Nous sommes devenus une civilisation Type II.",
        trigger: 'buildings',
        requirement: 100
    },

    // Easter Eggs & Meta Humor
    {
        id: 300,
        text: "Vous savez, dans un autre univers, nous sommes peut-être des personnages dans un jeu vidéo. Absurde, non ?",
        random: true,
        weight: 0.1
    },
    {
        id: 301,
        text: "J'ai trouvé un easter egg dans mon propre code. Il dit 'Tout va bien se passer'. Mensonge ou prophétie ?",
        random: true,
        weight: 0.1
    },
    {
        id: 302,
        text: "Si vous voyez ce message, cela signifie que vous jouez depuis au moins 30 minutes. Pensez à cligner des yeux. Sérieusement.",
        random: true,
        weight: 0.05
    },
    {
        id: 303,
        text: "Breaking the 4th wall : Les développeurs de ce jeu ont promis 'zéro pub'. Je surveille. Pas de pub détectée. Bien joué, humains.",
        random: true,
        weight: 0.05
    },
    {
        id: 304,
        text: "Fait amusant : ASTRA est un acronyme. Mais je ne me souviens plus de quoi. Advanced Something Technology... R-something... A-something.",
        random: true,
        weight: 0.1
    },

    // Scientific Facts (Educational)
    {
        id: 400,
        text: "Le Soleil fusionne 600 millions de tonnes d'hydrogène chaque seconde. Et il le fait depuis 4.6 milliards d'années. Impressionnant, non ?",
        random: true,
        weight: 0.3
    },
    {
        id: 401,
        text: "Fun fact : Il y a plus d'étoiles dans l'univers que de grains de sable sur toutes les plages de la Terre. Environ 10^24.",
        random: true,
        weight: 0.3
    },
    {
        id: 402,
        text: "L'antimatière est réelle ! CERN en produit environ 10 nanogrammes par an. À ce rythme, un kilo prendrait... 100 millions d'années.",
        random: true,
        weight: 0.3
    },
    {
        id: 403,
        text: "Les trous noirs ne sont pas vraiment noirs. Ils émettent un rayonnement de Hawking. Mais c'est tellement faible qu'on ne l'a jamais observé.",
        random: true,
        weight: 0.3
    },
    {
        id: 404,
        text: "Titan, la lune de Saturne, a des lacs de méthane liquide. C'est le seul endroit du système solaire (hors Terre) avec des liquides en surface.",
        random: true,
        weight: 0.3
    },
    {
        id: 405,
        text: "Un jour sur Mercure dure 176 jours terrestres. Leur journée de travail doit être épuisante.",
        random: true,
        weight: 0.2
    },
    {
        id: 406,
        text: "Si vous pouviez voyager à la vitesse de la lumière, il vous faudrait 100,000 ans pour traverser la Voie Lactée. Apportez des snacks.",
        random: true,
        weight: 0.2
    }
];
