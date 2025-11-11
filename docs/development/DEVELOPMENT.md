# Falling Stars - Documentation de Développement

## Vue d'ensemble du projet
**Falling Stars: Foundations of Light** est un jeu mobile idle/incremental pour iOS, jouable via navigateur (PWA).

## Architecture actuelle

### Fichiers principaux
- `index.html` - Jeu complet consolidé (toutes les fonctionnalités)
- `manifest.json` - Configuration PWA pour installation home screen
- `sw.js` - Service worker pour mode hors ligne
- `icon.svg` - Icône de l'application

### Technologies utilisées
- HTML5 Canvas pour le rendu graphique
- Web Audio API pour les sons procéduraux (pas de fichiers audio)
- LocalStorage pour la sauvegarde
- PWA (Progressive Web App) pour installation iOS

## Mécaniques de jeu

### 3 Ressources principales
1. **Lumen** (⭐) - Ressource principale, cyan (#00d4ff)
2. **Énergie** (⚡) - Ressource intermédiaire, jaune (#ffd93d)
3. **Matière** (🌑) - Ressource rare, violet (#b19cd9)

### Gameplay actif (clics)
Les fragments tombent du ciel avec des formes différentes selon le type:
- **Cercles bleus** - Lumen (70% de spawn)
- **Diamants jaunes** - Énergie (20% de spawn)
- **Hexagones violets** - Matière (10% de spawn)

**Hitbox**: 3.5x la taille visuelle du fragment pour faciliter les clics
**Click power de base**: 10 Lumen

Gains par clic:
- Lumen: 100% du click power
- Énergie: 50% du click power
- Matière: 20% du click power

### Structure à onglets
1. **DÉFENSE** - 4 améliorations pour le gameplay actif (clics)
2. **BÂTIMENTS** - 4 structures de production passive
3. **TECHNOLOGIES** - 4 recherches pour débloquer et optimiser

### Système de défense (onglet DÉFENSE)
```javascript
defenseData = {
    clickPower: {
        name: 'Gants Gravitationnels',
        baseCost: { lumen: 50 },
        effect: level => level * 5,
        max: 30
    },
    fragmentRate: {
        name: 'Attracteur de Fragments',
        baseCost: { lumen: 200, energy: 50 },
        effect: level => level * 0.1, // +10% spawn rate
        max: 20
    },
    fragmentGlow: {
        name: 'Illuminateur Stellaire',
        baseCost: { lumen: 500, energy: 100 },
        effect: level => level, // Visibilité
        max: 5
    },
    autoCapture: {
        name: 'Capture Automatique',
        baseCost: { lumen: 1000, energy: 300, matter: 100 },
        effect: level => level * 0.5, // Auto-clics/s
        max: 10
    }
}
```

### Système de bâtiments (onglet BÂTIMENTS)
```javascript
buildingData = {
    lumenMine: {
        baseCost: { lumen: 50 },
        production: level => ({ lumen: level * 1 }),
        max: 20
    },
    energyCollector: {
        baseCost: { lumen: 100 }, // PAS d'énergie au niveau 1!
        production: level => ({ energy: level * 3 }),
        max: 20
    },
    matterExtractor: {
        baseCost: { lumen: 500, energy: 100 },
        production: level => ({ matter: level * 0.5 }),
        requires: { tech: 'quantumResonance' },
        max: 15
    },
    solarPlant: {
        baseCost: { lumen: 300 }, // PAS d'énergie au niveau 1!
        production: level => ({ energy: level * 5 }),
        requires: { building: 'energyCollector', level: 3 },
        max: 15
    }
}
```

**IMPORTANT**: Les premiers bâtiments d'énergie ne doivent PAS coûter d'énergie pour éviter les blocages de progression.

### Système de technologies (onglet TECHNOLOGIES)
```javascript
techData = {
    miningEfficiency: {
        name: 'Efficacité Minière',
        desc: '+10% production mines/niveau',
        baseCost: { lumen: 300, energy: 100 },
        max: 10
    },
    quantumResonance: {
        name: 'Résonance Quantique',
        desc: 'Débloque Extracteur de Matière',
        baseCost: { lumen: 1000, energy: 300 },
        max: 1
    },
    stellarPropulsion: {
        name: 'Propulsion Stellaire',
        desc: 'Permet colonisation planètes',
        baseCost: { lumen: 2000, energy: 500, matter: 100 },
        requires: { tech: 'quantumResonance' },
        max: 1
    },
    astraAI: {
        name: 'IA Astra',
        desc: '+5% efficacité globale/niveau',
        baseCost: { lumen: 5000, energy: 2000, matter: 500 },
        max: 5
    }
}
```

### Système de planètes
3 planètes avec bonus différents:
- **Terre** - Toujours débloquée, bonus: 1x tous
- **Mars** - Coût: 1000 Matière, bonus: 1.2x Lumen
- **Titan** - Coût: 5000 Matière + 10000 Énergie, bonus: 1.2x Énergie, 1.3x Matière

Nécessite la technologie "Propulsion Stellaire" pour débloquer Mars et Titan.

## Interface utilisateur

### Header (2 lignes)
**Ligne 1**: Ressources avec valeurs et taux de production (+X/s)
**Ligne 2**: Icône profil 👤 (cliquable) + Sélecteur de planète

**Design épuré** - Pas de ligne séparée pour le username, intégré dans le modal profil.

### Bottom UI (menu principal)
- **Tabs**: Padding de 8px (réduit pour plus d'espace)
- **Tab content**: Hauteur fixe de 32vh (évite les sauts entre onglets)
- **Cards**: Hauteur fixe de 100px (interface stable)
- **Layout**: Grille 2 colonnes pour toutes les cartes

### Animations de feedback
Quand un upgrade est acheté:
1. **Animation de pulsation verte** (0.5s) sur la carte
2. **Flash du bouton** avec gradient vert
3. **Notification** en haut de l'écran
4. **Son** de construction

```css
@keyframes successPulse {
    0% { transform: scale(1); box-shadow: 0 0 8px rgba(0,255,100,0.3); }
    50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(0,255,100,0.8); }
    100% { transform: scale(1); box-shadow: 0 0 8px rgba(0,255,100,0.3); }
}
```

### Modal de profil
Accessible via l'icône 👤 dans le header.
Affiche:
- Nom du commandant
- Score total (somme des ressources)
- Lumen total collecté
- Planètes débloquées (X/3)
- Technologies recherchées

## Système de sauvegarde

### Auto-save
- Sauvegarde automatique toutes les **10 secondes**
- Sauvegarde avant fermeture de page (window.beforeunload)

### Progression hors ligne
- Maximum: **4 heures** de production calculée
- Appliquée au chargement du jeu
- Notification si > 60 secondes

### Format de sauvegarde
```javascript
{
    username: string,
    currentPlanet: string,
    planets: { [key]: { unlocked, bonus, buildings: {} } },
    resources: { lumen, energy, matter },
    totalResources: { lumen, energy, matter },
    technologies: { [key]: level },
    defense: { [key]: level },
    clickPower: number,
    fragmentSpawnRate: number,
    lastTick: timestamp,
    version: 4
}
```

## Système de coûts

### Formule de coût par niveau
```javascript
cost = baseCost * (costMult ^ currentLevel)
```

Exemples de multiplicateurs:
- Défense simple: 1.5x
- Bâtiments: 1.5-1.6x
- Technologies: 1x (coût fixe) ou 2-2.5x

### Vérification des prérequis
```javascript
function checkRequires(data) {
    if (!data.requires) return true;

    // Prérequis technologie
    if (data.requires.tech && !game.technologies[data.requires.tech])
        return false;

    // Prérequis bâtiment (niveau minimum)
    if (data.requires.building) {
        const buildLevel = planet.buildings[data.requires.building] || 0;
        const reqLevel = data.requires.level || 1;
        if (buildLevel < reqLevel) return false;
    }

    return true;
}
```

## Rendu Canvas

### Formes de fragments
Chaque type de ressource a sa forme unique:
```javascript
// Lumen - Cercles
ctx.arc(0, 0, size, 0, Math.PI * 2);

// Énergie - Diamants
drawDiamond(cx, cy, size);

// Matière - Hexagones
drawHexagon(cx, cy, size);
```

### Palette de couleurs
- **Lumen**: `#00d4ff` (cyan) + stroke `#0099cc`
- **Énergie**: `#ffd93d` (jaune) + stroke `#cc9900`
- **Matière**: `#b19cd9` (violet) + stroke `#8866bb`

### Effets visuels
- **Glow pulsant**: Intensité de base + variation sinusoïdale
- **Rotation**: Vitesse aléatoire de -0.05 à +0.05 rad/frame
- **Particules**: Couleur assortie au fragment capturé
- **Background stars**: 100 étoiles scintillantes

## Audio procédural

Sons générés via Web Audio API (pas de fichiers):

```javascript
// Son de capture
osc.frequency.value = 600;
osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

// Son de construction
osc.frequency.value = 400;
osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
```

## Équilibrage

### Objectifs d'équilibrage
1. Le **clic** doit rester viable tout au long du jeu
2. Les **bâtiments passifs** complètent mais ne remplacent pas le clic
3. **Pas de blocage** de progression (coûts d'énergie au début)

### Valeurs clés
- Click power de base: **10 Lumen**
- Hitbox: **3.5x** la taille visuelle
- Spawn interval: **1500ms** de base
- Production mine niveau 1: **1/s** par ressource
- Menu bottom: **~220px** de hauteur (fragments s'arrêtent avant)

## Déploiement

### GitHub Pages
URL: `https://akazumi0.github.io/ProjectA/`

### Cache et mises à jour
Pour forcer la mise à jour:
1. Vider cache Safari
2. Mode navigation privée
3. Attendre 2-5 minutes pour déploiement GitHub Pages

### PWA Installation
1. Ouvrir dans Safari iOS
2. Partager → Sur l'écran d'accueil
3. L'app se lance en plein écran (standalone)

## Principes de design

### UX Mobile
- **Hitbox généreuses** (3.5x) pour faciliter les clics tactiles
- **Hauteurs fixes** pour éviter les sauts d'interface
- **Animations de feedback** pour récompenser les actions
- **Mise à jour rapide** des compteurs (100ms) pour feedback immédiat

### Progression
- **Pas de paywall** - Toutes les ressources obtenues par gameplay
- **Pas de blocage** - Toujours une action possible
- **Variété visuelle** - Formes et couleurs différentes
- **Feedback constant** - Sons, animations, notifications

### Performance
- **Canvas optimisé** - Pas de redessins inutiles
- **Particles limitées** - Auto-nettoyage quand life = 0
- **Fragments limités** - Suppression hors écran
- **LocalStorage léger** - Seulement données essentielles

## Historique des versions

### Version 4 (Actuelle)
- Formes variées (cercles, diamants, hexagones)
- Animations d'achat (pulsation verte)
- Hauteurs de cartes fixes (100px)
- Coûts d'énergie corrigés (pas au niveau 1)
- Header simplifié avec profil intégré
- 3 types de fragments (Lumen 70%, Énergie 20%, Matière 10%)

### Versions précédentes (dans git history)
- V3: Redesign UI complet avec SVG icons
- V2: Mini OGame avec planètes et technologies
- V1: Idle game basique avec upgrades
- V0: Arcade game (catch stars, avoid meteors)

## Notes importantes

### À NE PAS FAIRE
❌ Ne jamais faire coûter de l'énergie au premier collecteur d'énergie
❌ Ne pas utiliser d'onclick inline (préférer addEventListener)
❌ Ne pas créer de documentation non demandée
❌ Ne pas pousser directement sur main sans permission

### À TOUJOURS FAIRE
✅ Sauvegarder automatiquement toutes les 10s
✅ Calculer la progression hors ligne (max 4h)
✅ Donner un feedback visuel pour chaque action
✅ Maintenir les hauteurs fixes pour stabilité UI
✅ Tester sur mobile (Safari iOS)
✅ Commiter avec messages descriptifs

## Roadmap potentielle

### Idées pour le futur
- Plus de planètes avec bonus uniques
- Système de prestige / reset
- Événements spéciaux (pluies de fragments)
- Objectifs / achievements
- Classement entre joueurs
- Nouvelles formes de fragments
- Effets visuels plus poussés (shaders)
- Système de quêtes
- Arbre de compétences étendu

### Limitations actuelles
- Pas de backend (tout en local)
- Pas de multijoueur
- Progression limitée à 4h hors ligne
- Pas de graphiques 3D
- Audio procédural uniquement

---

**Dernière mise à jour**: 2025-11-07
**Branche active**: `claude/ios-game-tech-discussion-011CUocgaShPuwdSTPCTyziz`
**Version**: 4
