# 🌟 Cosmic Catch - Jeu iOS 2D

Un jeu mobile fun et sans prise de tête où vous devez attraper des étoiles tombantes tout en évitant les météorites !

## 🎮 Comment jouer

- **Objectif** : Attrapez un maximum d'étoiles dorées ⭐
- **Contrôles** : Touchez l'écran pour déplacer votre vaisseau
- **Évitez** : Les météorites rouges ☄️ qui vous font perdre une vie
- **Combos** : Enchaînez les étoiles pour multiplier vos points ! 🔥

## 📱 Test sur votre iPhone/iPad

### Méthode 1 : Test local rapide (recommandé)

1. Ouvrez le fichier `cosmic-catch.html` dans votre navigateur
2. Utilisez les outils de développement pour obtenir une URL locale
3. Ou utilisez un serveur local simple :

```bash
# Python 3
python3 -m http.server 8000

# Ou avec Node.js
npx http-server -p 8000
```

4. Sur votre iPhone, ouvrez Safari et accédez à `http://[votre-ip]:8000/cosmic-catch.html`

### Méthode 2 : Partage de fichier (le plus simple)

1. Envoyez-vous le fichier `cosmic-catch.html` par email ou via AirDrop
2. Ouvrez le fichier directement dans Safari sur votre iPhone
3. Appuyez sur le bouton "Partager" puis "Ajouter à l'écran d'accueil" pour en faire une icône d'app !

### Méthode 3 : GitHub Pages (en ligne)

Si vous voulez le partager en ligne, poussez ce repo sur GitHub et activez GitHub Pages.

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
