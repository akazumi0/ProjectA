# 📦 Dossier Assets - Falling Stars

Ce dossier contient (ou contiendra) tous les assets graphiques et audio externes utilisés pour améliorer le jeu Falling Stars.

---

## 📁 STRUCTURE

```
Assets/
├── README.md                  # Ce fichier
├── RESOURCES.md               # Liste complète des ressources gratuites recommandées
├── CREDITS-TEMPLATE.md        # Template pour documenter les assets utilisés
└── [Assets téléchargés]       # Vos fichiers graphiques/audio ici
```

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Consulter les ressources disponibles

Ouvrez `RESOURCES.md` pour voir toutes les ressources gratuites recommandées:
- Assets graphiques (étoiles, particules, planètes, UI)
- Musiques ambiantes spatiales
- Effets sonores sci-fi

### 2. Télécharger les assets

Visitez les sites listés dans `RESOURCES.md` et téléchargez les assets qui vous intéressent.

**Priorités recommandées:**
- Sprites de fragments/étoiles lumineux
- Particules pour effets de capture
- 1-2 musiques ambient spatiales
- Sons de capture, achat, et prestige

### 3. Organiser les fichiers

Pour l'instant, déposez tous les assets directement dans ce dossier `Assets/` à la racine.

**Suggestions de nommage:**
- `fragment_01.png`, `fragment_02.png` - Sprites de fragments
- `particle_glow.png` - Particules lumineuses
- `earth_red.png`, `earth_yellow.png`, `earth_green.png`, `earth_cyan.png` - États de la Terre
- `ambient_space_01.mp3` - Musique de fond
- `sfx_capture.mp3` - Son de capture
- `sfx_buy.mp3` - Son d'achat
- `sfx_prestige.mp3` - Son de prestige

### 4. Documenter les crédits

Utilisez `CREDITS-TEMPLATE.md` pour créer un fichier `CREDITS.md` listant tous les assets utilisés avec leurs licences et attributions.

---

## ⚖️ IMPORTANT - LICENCES

### Avant de télécharger un asset:

1. **Vérifiez la licence**
   - CC0 = Domaine public, aucune attribution requise
   - CC-BY = Attribution requise (mentionner l'auteur)
   - Royalty-Free = Vérifier les conditions spécifiques

2. **Lisez les conditions d'utilisation**
   - Usage commercial autorisé ?
   - Attribution requise ?
   - Modifications autorisées ?

3. **Documentez immédiatement**
   - Notez l'auteur, la source et la licence
   - Ajoutez-le au fichier CREDITS.md

---

## 🎯 ASSETS PRIORITAIRES POUR FALLING STARS

### Graphiques essentiels:
- [ ] **Fragments stellaires** - Sprites animés avec glow
- [ ] **Particules de capture** - Effets lumineux, étincelles
- [ ] **Terre évolutive** - 4 versions colorées (rouge → jaune → vert → cyan)
- [ ] **Étoiles d'arrière-plan** - Petites étoiles pour l'ambiance
- [ ] **Icônes UI** - Boutons, technologies orbitales

### Audio essentiel:
- [ ] **Musique ambient** - 1-2 tracks en loop
- [ ] **Son de capture** - Cristallin, satisfaisant
- [ ] **Son d'achat** - Confirmation/validation
- [ ] **Son de prestige** - Épique, cosmique
- [ ] **Sons UI optionnels** - Hover, clicks

---

## 🔧 INTÉGRATION DANS LE JEU

Une fois les assets téléchargés, vous devrez les intégrer dans le code HTML/JS du jeu.

### Exemple d'intégration d'images:
```javascript
// Charger un sprite de fragment
const fragmentImg = new Image();
fragmentImg.src = 'Assets/fragment_01.png';
```

### Exemple d'intégration audio:
```javascript
// Charger un effet sonore
const captureSound = new Audio('Assets/sfx_capture.mp3');
captureSound.play();
```

### Exemple de musique en loop:
```javascript
const bgMusic = new Audio('Assets/ambient_space_01.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;
bgMusic.play();
```

---

## 💡 CONSEILS

### Optimisation:
- Utilisez des formats compressés (PNG pour transparence, JPG pour photos, WebP si supporté)
- Limitez la taille des fichiers audio (MP3 128-192 kbps suffit)
- Redimensionnez les images à la taille nécessaire

### Cohérence visuelle:
- Maintenez un style artistique cohérent
- Utilisez une palette de couleurs harmonieuse (bleus, cyans, violets pour l'espace)
- Assurez-vous que le glow/luminosité correspond au thème

### Performance:
- Pré-chargez les assets critiques au démarrage
- Utilisez des sprite sheets si possible
- Lazy-load les assets non-essentiels

---

## 📚 RESSOURCES ADDITIONNELLES

### Tutoriels utiles:
- Comment créer des sprite sheets
- Optimisation d'images pour le web
- Web Audio API pour intégrer les sons
- Canvas API pour dessiner les sprites

### Outils recommandés:
- **GIMP** / **Krita** - Édition d'images (gratuit)
- **Audacity** - Édition audio (gratuit)
- **TexturePacker** - Création de sprite sheets
- **TinyPNG** - Compression d'images PNG

---

## 🤝 CONTRIBUTION

Si vous trouvez d'autres ressources gratuites de qualité pour le projet, n'hésitez pas à les ajouter dans `RESOURCES.md` avec:
- Le nom et l'URL
- Le type d'asset
- La licence
- Une brève description

---

## 📞 SUPPORT

Pour toute question sur l'utilisation des assets ou les licences, consultez:
- Les pages de licence des sites sources
- Les communautés GameDev (r/gamedev, itch.io forums)
- La documentation Creative Commons

---

**Bon développement ! 🚀✨**
