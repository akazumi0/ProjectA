# Système de Visualisation des Bâtiments

## Vue d'ensemble

Système visuel simple mais efficace pour montrer vos bâtiments en action dans le jeu, sans avoir besoin de créer des assets graphiques complexes.

## 🏗️ Bâtiments de Production

### Affichage
- **Position :** En bas de l'écran (85% de la hauteur)
- **Espacement :** 60px entre chaque bâtiment
- **Éléments visuels :**
  - Plateforme (rectangle avec gradient)
  - Icône emoji du bâtiment (32px)
  - Indicateur de niveau ("Lv X")

### Effets de Production
- **Particules dorées** qui montent depuis chaque bâtiment
- **Intensité** basée sur le niveau du bâtiment
- **Taux de spawn** : `niveau * 2%` par frame (max 50%)
- Particules avec :
  - Taille : 2-4px (plus grandes pour niveaux élevés)
  - Vitesse : 1-2.5 px/frame vers le haut
  - Durée de vie : 60-100 frames
  - Couleur : Or (#ffd700) avec glow

### Bâtiments affichés
Seuls les bâtiments **construits** (level > 0) apparaissent :
- ⛏️ Mine de Lumen
- 🔌 Collecteur d'Énergie
- ☀️ Réseau Solaire
- ⚛️ Réacteur à Fusion
- ... et tous les autres bâtiments

## ⚡ Canons Défensifs

### Canons latéraux
**Conditions d'apparition :**
- Nécessite `autoCapture` niveau > 0

**Position :**
- Canon gauche : x=30, y=50% (cyan)
- Canon droit : x=width-30, y=50% (magenta)

**Visuel :**
- Cercle lumineux avec glow
- Taille : 8px + niveau d'autoCapture
- Icône : ⚡

### Rayons Laser
**Comportement :**
- Tirent automatiquement sur les étoiles
- Fréquence : `niveau * 5%` par frame
- Alternent entre gauche et droite

**Rendu :**
- Rayon externe (3px) avec couleur du canon
- Rayon interne blanc (1px)
- Glow intense (shadowBlur: 15px)
- Durée : 10 frames
- Effet d'impact avec particules (8 particules)

**Dégâts :**
- `niveau * 10` points de dégâts (non utilisé actuellement)

## 🎨 Détails Techniques

### Performance
- Particules limitées naturellement par durée de vie
- Beams supprimés après 10 frames
- Pas de calculs complexes
- Utilise des formes simples (cercles, lignes)

### Code Structure

```javascript
// Variables globales
let buildingVisuals = [];
let defenseBeams = [];
let productionParticles = [];

// Fonctions principales
calculateBuildingPositions()  // Calcule positions basées sur level
createProductionParticle()    // Crée une particule de production
renderBuildings()             // Rendu bâtiments + particules
fireDefenseBeam()             // Tire un rayon laser
renderDefenseBeams()          // Rendu des canons + rayons
```

### Intégration dans renderLoop()
```javascript
// Ordre de rendu
1. Nébuleuses
2. Étoiles de fond
3. Terre
4. Bâtiments + particules production ⭐ NOUVEAU
5. Rayons défensifs ⭐ NOUVEAU
6. Power-ups
7. Fragments (étoiles tombantes)
8. Particules d'effets
9. Companion
```

## 🎮 Expérience Utilisateur

### Feedback Visuel

**Au début du jeu :**
- Aucun bâtiment visible
- Zone de production vide

**Après construction :**
- Premier bâtiment apparaît avec son icône
- Particules commencent à monter
- Chaque upgrade rend les particules plus intenses

**Avec défenses :**
- Canons apparaissent sur les côtés
- Rayons laser tirent automatiquement
- Effets visuels montrent l'action

### Progression Visuelle

| Niveau | Visuel |
|--------|--------|
| 0 | Aucun bâtiment |
| 1-5 | Quelques particules |
| 6-10 | Flux modéré de particules |
| 10+ | Pluie de particules intense |

## 🔧 Personnalisation Future

**Facile à étendre :**
- Ajouter couleurs spécifiques par type de bâtiment
- Animations différentes selon production
- Effets spéciaux pour bâtiments avancés
- Sprites SVG pour remplacer les emoji

**Exemples d'améliorations :**
```javascript
// Couleurs par type
lumenMine: '#ffd700'      // Or
energyCollector: '#00d4ff' // Cyan
fusionReactor: '#ff6600'  // Orange
```

## 📊 Avantages

✅ **Simplicité** : Utilise uniquement des formes basiques
✅ **Performance** : Très léger, pas d'images
✅ **Évolutif** : Facile d'ajouter de nouveaux effets
✅ **Feedback** : Montre clairement la progression
✅ **Immersion** : Le joueur voit sa base "travailler"

## 🐛 Debug

**Console logs utiles :**
```javascript
console.log('Buildings:', calculateBuildingPositions());
console.log('Production particles:', productionParticles.length);
console.log('Defense beams:', defenseBeams.length);
```

**Vérifications :**
- Les bâtiments ont-ils un niveau > 0 ?
- Les particules montent-elles ?
- Les canons apparaissent-ils avec autoCapture > 0 ?
- Les rayons ciblent-ils les étoiles ?
