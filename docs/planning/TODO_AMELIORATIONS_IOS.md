# 📋 TODO - Améliorations Falling Stars pour iOS

**Objectif:** Rendre le jeu prêt pour une sortie iOS de qualité
**Budget:** 0€ (utiliser ressources gratuites et génération IA)
**Exécutant:** IA Claude (tâches automatisables)

---

## 🔴 PRIORITÉ CRITIQUE (Bloquants)

### 1. ONBOARDING & TUTORIEL

- [ ] **Créer système de tutoriel progressif**
  - Ajouter flag `tutorialStep` dans gameState (0-10)
  - Bloquer UI sauf élément à cliquer (overlay sombre avec spotlight)
  - Étape 1: Cliquer 3 fragments (bloquer tout le reste)
  - Étape 2: Acheter 1ère mine (afficher seulement ça)
  - Étape 3: Acheter 1er upgrade défense (gants gravitationnels)
  - Étape 4: Ouvrir onglet Technologies, expliquer
  - Étape 5: Débloquer tous les systèmes, félicitations ASTRA

- [ ] **Progressive Disclosure - Cacher systèmes au début**
  - Cacher toutes les icônes leftIconBar sauf "🎁 Daily" jusqu'au tutoriel fini
  - Débloquer icônes une par une selon progression:
    - 🎁 Daily: Dès le début
    - 📜 Quests: Après 10 min de jeu
    - 🏆 Achievements: Après 1er achievement
    - 📦 Lootbox: Après 50 fragments capturés
    - 💎 Artifacts: Après 1ère technologie
    - 🌟 Events: Après 100 Lumen collectés
    - 🌠 Prestige: Après 10K Lumen total
    - 🏪 Shop: Après tutoriel complet

- [ ] **Améliorer dialogues ASTRA tutoriel**
  - Écrire 15 dialogues ASTRA pour guider les 5 premières minutes
  - Ton: Amical, encourageant, pas condescendant
  - Exemples:
    - "Bienvenue, Commandant! Les fragments stellaires approchent. Touchez-les pour les capturer!"
    - "Excellent! Vous maîtrisez la capture manuelle. Construisons une Mine pour automatiser."
    - "Votre réseau grandit! Les technologies débloqueront de nouvelles possibilités."

### 2. FEEDBACK VISUEL & POLISH

- [ ] **Améliorer feedback clic fragment**
  - Ajouter screen shake (3px, 100ms) sur chaque capture
  - Particles explosion au point de clic (5-10 particules, couleur du fragment)
  - Flash blanc 50ms sur le canvas
  - Effet zoom-in sur le nombre de ressources (+X Lumen)
  - Son satisfaisant (améliorer le procedural sound)

- [ ] **Animations achat bâtiment/technologie**
  - Pulse animation sur la carte (scale 1.0 → 1.1 → 1.0, 300ms)
  - Confetti particles (10-15) jaillissant de la carte
  - Flash vert success sur le bouton
  - Afficher "+1 [NOM]" flottant au-dessus (fade out 1s)
  - Heavy haptic feedback

- [ ] **Améliorer affichage combo**
  - Agrandir le combo display quand multiplier augmente
  - Changer couleur selon niveau:
    - x1-2: Blanc
    - x3-5: Cyan
    - x6-10: Vert
    - x11+: Or + pulse glow
  - Ajouter son "ding" à chaque niveau de combo
  - Animation shake when combo breaks

- [ ] **Milestones celebrations**
  - Détecter milestones importants:
    - 100, 1K, 10K, 100K, 1M Lumen
    - 1er, 5e, 10e bâtiment
    - 1ère, 5e technologie
  - Afficher modal fullscreen célébration:
    - Fireworks particles
    - Message congratulations ASTRA
    - Effet sonore épique
    - Optionnel: petite récompense bonus

- [ ] **Loading & transition states**
  - Ajouter fade in/out entre écrans (200ms)
  - Loading spinner si calculs offline > 1s
  - Skeleton screens pour modals (pas de flash blanc)

### 3. UI/UX POLISH

- [ ] **Améliorer lisibilité ressources header**
  - Font plus grande pour les valeurs (14px → 16px)
  - Couleurs plus contrastées:
    - Lumen: #FFD700 (gold)
    - Énergie: #00D4FF (cyan électrique)
    - Antimatière: #FF00FF (magenta)
  - Ajouter background glow subtil sur les nombres
  - Animer les changements de valeur (count up animation)

- [ ] **Responsive design - tester toutes tailles iOS**
  - iPhone SE (375x667): Minimum viable
  - iPhone 14 (390x844): Standard
  - iPhone 14 Pro Max (430x932): Large
  - iPad Mini (768x1024): Tablet
  - Ajuster font-sizes, paddings, canvas size selon viewport
  - Media queries dans CSS

- [ ] **Améliorer tabs navigation**
  - Ajouter indicateurs visuels si action possible:
    - Badge rouge sur "BÂTIMENTS" si achat possible
    - Badge vert sur "TECHNOLOGIES" si recherche possible
    - Badge doré sur "DÉFENSE" si upgrade available
  - Smooth transition entre tabs (slide animation)

- [ ] **Better affordances (visual hints)**
  - Pulse animation sur éléments cliquables importants
  - Hover effect plus visible (même sur mobile avec first-tap)
  - Disabled state plus clair (grayscale + opacity 0.5)
  - Couleur verte "buildable" plus intense (#00FF00)

---

## 🟠 PRIORITÉ HAUTE (Importantes)

### 4. CONTENU NARRATIF

- [ ] **Développer personnalité ASTRA**
  - Écrire 50 dialogues contextuels variés:
    - 10 dialogues encourageants (milestones)
    - 10 dialogues humoristiques (random)
    - 10 dialogues narratifs (lore)
    - 10 dialogues conseils (tips)
    - 10 dialogues réactions (events)
  - Déclencher selon:
    - Temps écoulé (1 toutes les 5min)
    - Actions joueur (achat, prestige, etc.)
    - Random (5% chance par minute)

- [ ] **Améliorer Story Events**
  - Ajouter 10 events narratifs supplémentaires
  - Conséquences plus impactantes des choix:
    - Buffs/debuffs temporaires (30min)
    - Déblocage contenus exclusifs
    - Achievements secrets
  - Meilleure écriture, plus émotionnelle
  - Illustrations textuelles riches (ASCII art simple?)

- [ ] **Progression narrative liée aux milestones**
  - 1K Lumen: ASTRA révèle origine des fragments
  - 10K Lumen: Découverte 1ère planète habitable
  - 100K Lumen: Contact alien mystérieux
  - 1M Lumen: Révélation finale sur la mission
  - Prestige 1: ASTRA évolue, nouvelle personnalité
  - Créer fichier `/src/js/data/storyMilestones.js`

### 5. GAME BALANCE

- [ ] **Rebalancer early game (premières 10 minutes)**
  - Augmenter Lumen de départ: 0 → 50
  - Réduire coût 1ère mine: 10 → 5
  - Augmenter drop rate fragments: +50%
  - Réduire vitesse fragments: -20% (plus facile à cliquer)
  - Objectif: 1er bâtiment en < 30 secondes

- [ ] **Ajuster Antimatière (trop rare actuellement)**
  - Drop rate: 0.1% → 0.5% (1/200 au lieu 1/1000)
  - Ajouter source alternative:
    - Daily reward jour 7: 5 Antimatière (au lieu 1)
    - Achievements: +1 Antimatière par achievement
    - Flash missions: 10% chance de reward Antimatière
  - Réduire prix IAP: $0.99 pour 10 → $0.99 pour 20

- [ ] **Prestige plus accessible**
  - 1er prestige requirement: 1M → 500K Lumen
  - Afficher popup suggestion prestige à 80% du goal
  - Bonus prestige plus visibles:
    - +10% production → +25% production par niveau
    - Débloquer artifact cosmétique à chaque prestige
  - Ajouter prestige "paths" (choix):
    - Path 1: +50% production buildings
    - Path 2: +100% click power
    - Path 3: +50% offline earnings

- [ ] **Quêtes plus rewarding**
  - Multiplier rewards par 3
  - Ajouter "Quest chains" (3 quests linked)
  - Mega reward si 3 quests complétées dans la journée
  - Visual progress bar pour chaque quest

### 6. AUDIO AMÉLIORÉ

- [ ] **Générer/trouver musique ambient**
  - Chercher royalty-free space ambient music:
    - Incompetech: "Ascending"
    - Purple Planet: "Space Ambient"
    - Free Music Archive: tag "space"
  - Format: MP3 128kbps, loop 2-3min
  - Volume: 0.2 par défaut
  - Fade in/out smooth (3s)

- [ ] **Améliorer sons procéduraux Web Audio API**
  - Capture fragment:
    - Fréquence: 800Hz → varie selon type (Lumen: 800Hz, Energy: 1200Hz, Antimatter: 500Hz)
    - Ajouter reverb léger
    - Pitch varie selon combo (plus aigu = combo plus haut)
  - Achat building:
    - Son plus grave et satisfaisant (200-400Hz)
    - Chord au lieu de single tone
  - Success/Achievement:
    - Mélodie montante (C-E-G-C)
    - Durée 500ms

- [ ] **Variations pour éviter répétition**
  - Son clic: 5 variations (pitch ±10%)
  - Son achat: 3 variations
  - Jouer aléatoirement parmi les variations
  - Limiter même son à max 1x par 100ms (éviter spam)

- [ ] **Sound settings**
  - Sliders séparés:
    - Music volume (0-100%)
    - SFX volume (0-100%)
    - Haptics on/off
  - Sauvegarder dans settings

---

## 🟡 PRIORITÉ MOYENNE (Nice-to-have)

### 7. LOCALISATION

- [ ] **Traduire en anglais (minimum vital)**
  - Créer fichier `/src/js/data/translations.js`
  - Structure:
    ```js
    const translations = {
      fr: { /* textes actuels */ },
      en: { /* traductions */ }
    }
    ```
  - Traduire:
    - Tous les textes UI (boutons, labels)
    - Noms buildings/technologies
    - Descriptions
    - Dialogues ASTRA (priorité)
    - Story events
  - Utiliser fonction `t(key)` partout dans le code
  - Détecter langue navigateur au démarrage
  - Toggle FR/EN dans settings

- [ ] **Optionnel: Espagnol & Allemand**
  - Même structure
  - Marché ES: 500M locuteurs
  - Marché DE: 100M, fort pouvoir achat

### 8. SYSTÈMES SECONDAIRES

- [ ] **Leaderboard local (sans serveur)**
  - Stocker top 10 scores en localStorage
  - Afficher dans modal Stats
  - Critères:
    - Total Lumen all-time
    - Highest combo
    - Fragments caught
    - Time played
  - Compare avec "previous best"

- [ ] **Achievements plus visibles**
  - Popup toast quand achievement unlocked (pas juste notification)
  - Progress bars pour achievements en cours
  - Catégoriser mieux (tabs dans modal)
  - Ajouter 10 achievements secrets

- [ ] **Statistics détaillées**
  - Graphique production/heure (Canvas line chart simple)
  - Breakdown production par building type
  - Efficacité clics vs idle
  - "Best run" stats

- [ ] **Daily/Weekly challenges**
  - Challenges rotatifs:
    - "Capture 500 fragments en 1h"
    - "Atteindre combo x15"
    - "Gagner 10K Lumen sans acheter buildings"
  - Rewards spéciaux (boost 24h, cosmetic, badge)

### 9. PARTICLES & VISUAL EFFECTS

- [ ] **Particle system simple**
  - Créer `/src/js/utils/particles.js`
  - Types de particles:
    - Confetti (achat)
    - Sparkles (combo)
    - Stars (capture)
    - Fireworks (milestones)
  - Render sur canvas, alpha fade out
  - Max 100 particles simultanées (performance)

- [ ] **Background animations**
  - Parallax stars qui bougent lentement
  - Earth pulse glow (respiration lente)
  - Shooting stars occasionnelles (1 toutes les 30s)
  - Aurora borealis effect quand high production

- [ ] **Fragment trails**
  - Laisser traînée lumineuse derrière fragments qui tombent
  - Couleur = type de fragment
  - Fade out sur 200ms

---

## 🔵 PRIORITÉ BASSE (Polish final)

### 10. APP STORE ASSETS

- [ ] **Générer icône app professionnelle**
  - Utiliser IA génération image (DALL-E, Midjourney, Stable Diffusion)
  - Prompt: "Mobile game icon, glowing star fragment falling to Earth, space theme, vibrant colors, simple, recognizable, trending on dribbble"
  - Exporter formats:
    - 1024x1024 (App Store)
    - 180x180 (iPhone)
    - 120x120 (iPhone retina)
    - 167x167 (iPad Pro)
  - Remplacer icon.svg actuel

- [ ] **Screenshots App Store (6.5" required)**
  - 6 screenshots minimum:
    1. Hero shot: Gameplay avec Earth + fragments
    2. Buildings tab avec plusieurs buildings
    3. Technologies tree
    4. ASTRA dialogue + story event
    5. Achievements unlocked
    6. Prestige screen
  - Ajouter texte overlay marketing:
    - "Capturez les fragments stellaires!"
    - "Construisez votre empire spatial"
    - "Sauvez la Terre!"
  - Dimensions: 1242x2688 (iPhone 6.5")
  - Outil: Photopea (Photoshop gratuit web)

- [ ] **App Store metadata**
  - **Titre:** "Falling Stars: Idle Space" (30 char max)
  - **Sous-titre:** "Sauvez la Terre des fragments" (30 char)
  - **Description** (4000 char):
    - Hook (1er paragraphe): Problème + solution
    - Features (bullet points)
    - Story teaser
    - Call to action
  - **Keywords:** idle game, space, clicker, incremental, étoiles, cosmos, sci-fi
  - **Catégorie:** Games > Simulation
  - **Catégorie secondaire:** Games > Strategy

- [ ] **Privacy Policy page**
  - Créer fichier `privacy-policy.html`
  - Sections:
    - Data collected (LocalStorage only)
    - No third-party sharing
    - No ads
    - Contact info
  - Héberger sur GitHub Pages
  - URL: `https://akazumi0.github.io/ProjectA/privacy-policy.html`

### 11. CAPACITOR CONVERSION

- [ ] **Setup Capacitor**
  ```bash
  npm init -y
  npm install @capacitor/core @capacitor/cli
  npx cap init "Falling Stars" "com.akazumi.fallingstars"
  npm install @capacitor/ios
  npx cap add ios
  ```

- [ ] **Configuration iOS**
  - Éditer `capacitor.config.json`:
    ```json
    {
      "appId": "com.akazumi.fallingstars",
      "appName": "Falling Stars",
      "webDir": "src",
      "bundledWebRuntime": false,
      "ios": {
        "contentInset": "always"
      }
    }
    ```
  - Copier fichiers: `npx cap copy ios`
  - Sync: `npx cap sync ios`

- [ ] **Permissions iOS (Info.plist)**
  - Pas de permissions spéciales requises (jeu offline)
  - Optionnel: `NSUserTrackingUsageDescription` si analytics futur

- [ ] **Splash Screen & Icon**
  - Installer `@capacitor/splash-screen`
  - Générer splash avec icône + background gradient
  - Placer dans `/ios/App/App/Assets.xcassets/`

- [ ] **Testing sur device**
  - Ouvrir Xcode: `npx cap open ios`
  - Connecter iPhone
  - Build & Run
  - Tester:
    - Touch events (clics fragments)
    - Performance (60fps?)
    - Audio (iOS lock screen)
    - Offline mode
    - Save/Load
    - Rotation lock (portrait only)

### 12. IAP IMPLEMENTATION (si monétisation souhaitée)

- [ ] **Installer plugin IAP**
  ```bash
  npm install @capacitor-community/in-app-purchases
  npx cap sync
  ```

- [ ] **Configurer App Store Connect**
  - Créer app dans App Store Connect
  - Ajouter 4 IAP products:
    - `com.akazumi.fallingstars.antimatter.small` - $0.99 - 20 Antimatière
    - `com.akazumi.fallingstars.antimatter.medium` - $2.99 - 75 Antimatière
    - `com.akazumi.fallingstars.antimatter.large` - $6.99 - 200 Antimatiére
    - `com.akazumi.fallingstars.starter` - $4.99 - 100 Antimatière + 24h boost
  - Status: "Ready to Submit"

- [ ] **Implémenter achat IAP**
  - Remplacer fonction `purchasePremiumItem()` dans shop.js
  - Ajouter error handling (cancelled, failed, etc.)
  - Receipt validation (optionnel si pas de backend)
  - Restore purchases button dans settings
  - Tester avec Sandbox account

- [ ] **Alternative: Retirer IAP**
  - Si pas de monétisation souhaitée:
  - Supprimer modal Shop
  - Supprimer icône 🏪
  - Retirer fichier `/src/js/data/shop.js`
  - Rendre Antimatière plus accessible (drop rate x5)

---

## 🎯 QUICK WINS (Facile, Impact Élevé)

**À faire en priorité si temps limité:**

1. [ ] **Tutoriel 3 étapes forcé** (2h dev)
2. [ ] **Screen shake + particles sur clic** (1h dev)
3. [ ] **Traduction anglais UI** (3h)
4. [ ] **Cacher systèmes complexes au début** (1h dev)
5. [ ] **Augmenter early game rewards x3** (30min balance)
6. [ ] **Générer icône app avec IA** (30min)
7. [ ] **5 dialogues ASTRA tutoriel** (1h writing)
8. [ ] **Milestone celebrations** (2h dev)
9. [ ] **Améliorer combo display** (1h dev)
10. [ ] **Responsive iOS sizes** (2h CSS)

**Total Quick Wins: ~14h → Impact 80% de la qualité perçue**

---

## 📊 CHECKLIST PRÉ-LANCEMENT

### Testing
- [ ] Testé sur iPhone SE, 14, 14 Pro Max
- [ ] Testé sur iPad (optionnel)
- [ ] Testé connexion on/off (offline earnings)
- [ ] Testé save/load après force quit
- [ ] Testé 30min de gameplay continu (performance)
- [ ] Testé tous les flows (achat, prestige, quests, etc.)

### App Store
- [ ] Icônes toutes tailles générées
- [ ] 6 screenshots créés
- [ ] Description + keywords optimisés
- [ ] Privacy policy page live
- [ ] Catégories sélectionnées
- [ ] Age rating: 4+ (pas de contenu mature)

### Code
- [ ] Aucune console.error en production
- [ ] Aucun placeholder/TODO dans UI
- [ ] Performance 60fps stable
- [ ] Bundle size < 5MB
- [ ] Pas de liens cassés
- [ ] Analytics optionnel configuré

### Polish Final
- [ ] Tous les textes relus (orthographe)
- [ ] Toutes les animations smooth
- [ ] Tous les sons cohérents
- [ ] UI responsive partout
- [ ] Loading states partout
- [ ] Haptics sur toutes actions importantes

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### Semaine 1: Fondations
1. Tutoriel + Progressive Disclosure
2. Traduction anglais
3. Balance early game
4. Quick wins (shake, particles, combo)

### Semaine 2: Polish
5. Audio amélioré
6. Particles & effects
7. Dialogues ASTRA (50)
8. Milestone celebrations

### Semaine 3: Narration
9. Story milestones
10. Story events supplémentaires
11. Achievements polish

### Semaine 4: Technical
12. Capacitor setup
13. iOS build & testing
14. Responsive design
15. Performance optimization

### Semaine 5: App Store
16. Icône app
17. Screenshots
18. Metadata
19. Privacy policy
20. Soumission

### Semaine 6+: Post-Launch
21. Monitoring reviews
22. Bug fixes
23. Itération selon feedback
24. Content updates

---

## 💡 RESSOURCES GRATUITES

### Génération Assets
- **DALL-E 3** (via Bing Create): Icônes, illustrations
- **Midjourney Free Trial**: 25 images gratuites
- **Stable Diffusion**: Illimité local
- **Photopea**: Photoshop gratuit web

### Audio
- **Incompetech**: Musique royalty-free
- **Purple Planet**: Space music
- **Freesound.org**: SFX gratuits
- **Web Audio API**: Génération procédurale

### Tools
- **Capacitor**: Framework iOS gratuit
- **Xcode**: IDE iOS gratuit
- **App Store Connect**: Compte dev ($99/an requis)
- **TestFlight**: Beta testing gratuit

### Learning
- **YouTube**: Tutorials idle games
- **Reddit r/incremental_games**: Community feedback
- **TouchArcade Forums**: iOS gaming community

---

## ⚠️ PIÈGES À ÉVITER

1. **Feature creep**: Ne pas ajouter nouveaux systèmes, finir l'existant
2. **Perfectionnisme**: Livrer "bon" vaut mieux que "parfait jamais sorti"
3. **Ignorer feedback**: Tester avec 5 vrais joueurs avant soumission
4. **Sous-estimer App Review**: Lire guidelines, 30% rejet 1ère fois
5. **Oublier analytics**: Impossible d'améliorer sans data

---

## 📈 MÉTRIQUES À TRACKER POST-LAUNCH

Si analytics ajouté (optionnel):

- **Acquisition**: Downloads, sources
- **Activation**: % qui finissent tutoriel
- **Retention**: D1, D7, D30
- **Engagement**: Session length, sessions/day
- **Monetization**: Conversion rate, ARPDAU
- **Referral**: Shares, ratings

---

**BONNE CHANCE, COMMANDANT!** 🚀⭐

*Cette todo est un guide, pas une prison. Priorisez selon votre temps et objectifs.*
