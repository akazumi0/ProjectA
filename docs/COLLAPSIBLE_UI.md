# Fenêtre d'Upgrades Réductible

## Vue d'ensemble

Système permettant de réduire/agrandir la fenêtre d'upgrades (bottomUI) pour voir la planète et les bâtiments en action.

## 🎯 Objectif

- **Réduite** : Montrer uniquement les tabs, libérer la vue pour voir la planète et les bâtiments
- **Agrandie** : Vue complète pour consulter et acheter des upgrades

## 🎮 Utilisation

### Bouton Toggle
- **Position** : En haut à droite du bottomUI (au-dessus)
- **Style** : Bouton bleu avec flèche
- **Action** : Clic pour basculer entre réduit/agrandi

### États

**▼ Agrandi (défaut)**
- Tout le contenu visible
- Bâtiments positionnés à 68% de la hauteur (pour éviter overlap)
- Flèche vers le bas (▼)

**▲ Réduit**
- Uniquement les tabs visibles (~35px)
- Contenu masqué (opacity: 0)
- Bâtiments descendent à 90% de la hauteur
- Flèche vers le haut (▲)

## 🎨 CSS

### Transitions fluides
```css
#bottomUI {
    transition: transform 0.3s ease, height 0.3s ease;
}
```

### État minimized
```css
#bottomUI.minimized {
    transform: translateY(calc(100% - 35px)); /* Ne montre que les tabs */
}
```

### État expanded
```css
#bottomUI.expanded {
    transform: translateY(0); /* Vue complète */
}
```

## 📐 Positions Dynamiques des Bâtiments

### Logique
```javascript
const isMinimized = bottomUI.classList.contains('minimized');
const buildingAreaY = canvas.height * (isMinimized ? 0.90 : 0.68);
```

### Résultat
| État | Position Y | Visibilité |
|------|-----------|-----------|
| Agrandi | 68% | Bâtiments au-dessus de l'UI |
| Réduit | 90% | Bâtiments près du bas, planète visible |

## 💻 Code

### HTML
```html
<div id="bottomUI" class="expanded">
    <button id="bottomUIToggle" onclick="toggleBottomUI()">
        <span id="toggleIcon">▼</span>
    </button>
    <div id="tabs">...</div>
    <div class="tab-content">...</div>
</div>
```

### JavaScript
```javascript
window.toggleBottomUI = function() {
    const bottomUI = document.getElementById('bottomUI');
    const toggleIcon = document.getElementById('toggleIcon');

    if (bottomUI.classList.contains('minimized')) {
        bottomUI.classList.remove('minimized');
        bottomUI.classList.add('expanded');
        toggleIcon.textContent = '▼';
    } else {
        bottomUI.classList.remove('expanded');
        bottomUI.classList.add('minimized');
        toggleIcon.textContent = '▲';
    }
};
```

## 🎬 Cas d'Usage

### Scénario 1 : Admirer sa base
1. Joueur construit plusieurs bâtiments
2. Clique sur le bouton ▼ pour réduire
3. Voit tous ses bâtiments produire avec particules
4. Canons défensifs tirent sur les étoiles
5. Vue dégagée de la planète

### Scénario 2 : Acheter des upgrades
1. Joueur clique sur ▲ pour agrandir
2. Browse les différents tabs
3. Achète des upgrades
4. Ferme pour retourner au gameplay

## ✨ Améliorations Futures

**Possibles extensions :**
- Sauvegarder l'état (minimized/expanded) dans localStorage
- Raccourci clavier (Espace ou Tab)
- Animation de particules lors du toggle
- Resize automatique si trop de bâtiments

**Exemple avec sauvegarde :**
```javascript
// Save state
localStorage.setItem('bottomUIState', isMinimized ? 'minimized' : 'expanded');

// Load on start
const savedState = localStorage.getItem('bottomUIState') || 'expanded';
bottomUI.classList.add(savedState);
```

## 🐛 Debug

**Vérifications :**
- Le bouton toggle est-il visible ?
- L'icône change-t-elle (▼/▲) ?
- Les transitions sont-elles fluides (0.3s) ?
- Les bâtiments se repositionnent-ils ?

**Console logs :**
```javascript
console.log('BottomUI state:', bottomUI.className);
console.log('Building Y position:', buildingAreaY);
```

## 📊 Avantages

✅ **Immersion** : Voir la base en action
✅ **Flexibilité** : 2 modes selon le besoin
✅ **Performance** : Pas d'impact, juste CSS transform
✅ **UX** : Transition fluide et intuitive
✅ **Gameplay** : Met en valeur les visuels de production
