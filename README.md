# 🌟 Cosmic Catch - Jeu iOS 2D

Un jeu mobile fun et sans prise de tête où vous devez attraper des étoiles tombantes tout en évitant les météorites !

## 🎮 Comment jouer

- **Objectif** : Attrapez un maximum d'étoiles dorées ⭐
- **Contrôles** : Touchez l'écran pour déplacer votre vaisseau
- **Évitez** : Les météorites rouges ☄️ qui vous font perdre une vie
- **Combos** : Enchaînez les étoiles pour multiplier vos points ! 🔥

## 📱 Jouer depuis votre iPhone (sans PC)

**⚡ GUIDE COMPLET :** Consultez le fichier **[INSTRUCTIONS-IOS.md](INSTRUCTIONS-IOS.md)** pour 3 méthodes simples !

### Méthode la plus rapide : CodePen

1. Sur votre iPhone, allez sur : **https://codepen.io/pen/**
2. Copiez tout le code de `cosmic-catch.html` depuis GitHub
3. Collez-le dans l'onglet "HTML" de CodePen
4. Le jeu s'affiche automatiquement - cliquez "Change View" → "Full Page" pour jouer !

### Méthode permanente : GitHub Pages

1. Sur GitHub, allez dans **Settings** → **Pages** de ce repository
2. Sélectionnez la branche `claude/ios-game-tech-discussion-011CUocgaShPuwdSTPCTyziz`
3. Cliquez "Save" et attendez 1-2 minutes
4. Votre jeu sera accessible à : `https://[votre-compte].github.io/ProjectA/cosmic-catch.html`

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
