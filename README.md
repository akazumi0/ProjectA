# 🌟 Cosmic Catch - Jeu iOS 2D

Un jeu mobile fun et sans prise de tête où vous devez attraper des étoiles tombantes tout en évitant les météorites !

## 🎮 Comment jouer

- **Objectif** : Attrapez un maximum d'étoiles dorées ⭐
- **Contrôles** : Touchez l'écran pour déplacer votre vaisseau
- **Évitez** : Les météorites rouges ☄️ qui vous font perdre une vie
- **Combos** : Enchaînez les étoiles pour multiplier vos points ! 🔥

## 📱 Jouer depuis votre iPhone (sans PC)

### 🎯 Méthode recommandée : GitHub Pages (GRATUIT et permanent)

**👉 [GUIDE DÉTAILLÉ : GITHUB-PAGES-SETUP.md](GITHUB-PAGES-SETUP.md)**

**Étapes rapides :**
1. Sur Safari, allez sur `https://github.com/[votre-nom]/ProjectA/settings/pages`
2. Sous "Branch", sélectionnez `claude/ios-game-tech-discussion-011CUocgaShPuwdSTPCTyziz`
3. Cliquez "Save" et attendez 1-2 minutes ⏱️
4. Votre jeu sera en ligne à : `https://[votre-nom].github.io/ProjectA/` 🎮

**C'est gratuit, permanent et sans pub !**

---

### Alternative rapide : CodePen (pour tester immédiatement)

**👉 [Autres méthodes : INSTRUCTIONS-IOS.md](INSTRUCTIONS-IOS.md)**

1. Sur votre iPhone, allez sur : **https://codepen.io/pen/**
2. Copiez le code de `cosmic-catch.html` depuis GitHub
3. Collez-le dans l'onglet "HTML" de CodePen
4. Jouez !

## 💻 Test sur PC (optionnel)

Si vous avez un ordinateur :

```bash
# Python 3
python3 -m http.server 8000

# Puis sur votre iPhone : http://[votre-ip]:8000/cosmic-catch.html
```

## 🎯 Fonctionnalités

- ✅ Contrôles tactiles optimisés pour mobile
- ✅ Système de score avec combos
- ✅ Sauvegarde automatique du meilleur score
- ✅ Effets visuels et particules
- ✅ Responsive (s'adapte à toutes les tailles d'écran)
- ✅ Fonctionne hors ligne
- ✅ Pas de dépendances externes

## 🚀 Prochaines étapes possibles

Si vous souhaitez aller plus loin :

1. **Conversion en app native iOS** : Utiliser Capacitor pour créer une vraie app iOS
2. **App Store** : Configuration Xcode pour publication
3. **Fonctionnalités supplémentaires** :
   - Power-ups (boucliers, slow-motion, aimants)
   - Niveaux de difficulté croissante
   - Mode multijoueur
   - Personnalisation du vaisseau
   - Sons et musique

## 🛠️ Technologies utilisées

- HTML5 Canvas pour le rendu graphique
- JavaScript pur (pas de frameworks)
- CSS3 pour l'interface
- LocalStorage pour sauvegarder le score

## 📊 Système de scoring

- Étoile attrapée : **10 points × combo**
- Combo : Se multiplie à chaque étoile consécutive
- Manquer une étoile : Reset le combo
- Toucher une météorite : -1 vie + reset combo

Amusez-vous bien ! 🎮✨
