# 📚 Index de la Documentation - Falling Stars

Bienvenue dans la documentation complète du projet **Falling Stars: Foundations of Light**.

## 📖 Navigation Rapide

### 🎮 Pour Commencer
- **[README Principal](../README.md)** - Vue d'ensemble du projet et gameplay
- **[Guide GitHub Pages](guides/GITHUB-PAGES-SETUP.md)** - Déployer le jeu gratuitement
- **[Instructions iOS](guides/INSTRUCTIONS-IOS.md)** - Jouer sur iPhone

---

## 🔧 Documentation Technique

Pour les développeurs qui souhaitent comprendre ou contribuer au projet :

### Architecture & Code
- **[Architecture](development/ARCHITECTURE.md)** - Structure modulaire ES6 complète
- **[Guide de Développement](development/DEVELOPMENT.md)** - Mécaniques de jeu, systèmes, API
- **[Refactoring](development/REFACTORING.md)** - Migration vers architecture modulaire
- **[Intégration Boutique Premium](development/PREMIUM_SHOP_INTEGRATION.md)** - Guide IAP et monétisation

**Points clés :**
- Architecture modulaire ES6 (23 modules)
- Web Audio API pour les sons
- Canvas HTML5 pour le rendu
- LocalStorage pour la sauvegarde
- 100% vanilla JavaScript (zéro dépendance)

---

## 📋 Planification & Roadmap

Documentation de planification et d'amélioration :

- **[TODO Améliorations iOS](planning/TODO_AMELIORATIONS_IOS.md)** - Liste complète des tâches pour release iOS
- **[Idées d'Améliorations](planning/IDLE_GAME_IDEAS.md)** - Propositions inspirées des meilleurs idle games

**Priorités actuelles :**
1. 🔴 Tutoriel et onboarding
2. 🔴 Polish visuel et effets
3. 🟠 Design sonore
4. 🟠 Traduction anglais

---

## 📜 Historique & Audits

Documentation des sessions de développement et analyses :

- **[Audit iOS Release](history/AUDIT_IOS_RELEASE.md)** - Analyse complète de viabilité (11 nov 2025)
- **[Récapitulatif Améliorations](history/RECAP_AMELIORATIONS.md)** - Résumé des changements phase 1

**Scores actuels :**
- Code & Architecture : 8/10 ✅
- Game Design : 5/10 ⚠️
- Onboarding/UX : 4/10 ⚠️
- Présentation Visuelle : 2/10 ❌
- Audio & Ambiance : 2/10 ❌

---

## 🎯 Guides Utilisateur

Pour les joueurs :

- **[Configuration GitHub Pages](guides/GITHUB-PAGES-SETUP.md)** - Héberger le jeu gratuitement (5 minutes)
- **[Instructions iPhone](guides/INSTRUCTIONS-IOS.md)** - Jouer sur iOS sans ordinateur

---

## 🗂️ Structure du Projet

```
ProjectA/
├── README.md                    # 👈 Commencez ici !
├── index.html                   # Jeu principal
│
├── docs/                        # Documentation complète
│   ├── INDEX.md                 # Ce fichier
│   ├── development/             # Docs techniques
│   ├── planning/                # TODOs et roadmap
│   ├── history/                 # Audits et récaps
│   └── guides/                  # Guides utilisateur
│
├── src/                         # Code source modulaire
│   ├── css/                     # Styles (4 modules)
│   ├── js/                      # JavaScript (19 modules)
│   │   ├── core/                # État et constantes
│   │   ├── data/                # Données de jeu
│   │   ├── systems/             # Systèmes (audio, storage, etc.)
│   │   └── utils/               # Utilitaires
│   └── assets/                  # Assets (icônes, etc.)
│
├── manifest.json                # Configuration PWA
└── sw.js                        # Service Worker
```

---

## 🚀 Liens Rapides par Cas d'Usage

### Je veux...

**...jouer au jeu**
→ [README Principal](../README.md) puis [Guide GitHub Pages](guides/GITHUB-PAGES-SETUP.md)

**...comprendre le code**
→ [Architecture](development/ARCHITECTURE.md) puis [Guide de Développement](development/DEVELOPMENT.md)

**...contribuer au projet**
→ [TODO iOS](planning/TODO_AMELIORATIONS_IOS.md) + [Architecture](development/ARCHITECTURE.md)

**...déployer sur iOS**
→ [Intégration Premium](development/PREMIUM_SHOP_INTEGRATION.md) (section Capacitor)

**...voir l'état actuel**
→ [Audit iOS](history/AUDIT_IOS_RELEASE.md) + [Récap Améliorations](history/RECAP_AMELIORATIONS.md)

**...proposer des idées**
→ [Idées d'Améliorations](planning/IDLE_GAME_IDEAS.md)

---

## 📊 Statistiques du Projet

- **Lignes de code :** ~5 500 lignes (réparties sur 23 modules)
- **Taille du bundle :** 249 KB
- **Dépendances :** 0 (100% vanilla)
- **Fichiers de documentation :** 11 fichiers
- **Systèmes de jeu :** 15+ (bâtiments, technologies, achievements, quests, etc.)

---

## 🤝 Contribuer

1. Lisez [Architecture](development/ARCHITECTURE.md) pour comprendre la structure
2. Consultez [TODO iOS](planning/TODO_AMELIORATIONS_IOS.md) pour les tâches prioritaires
3. Suivez les conventions du [Guide de Développement](development/DEVELOPMENT.md)
4. Testez localement avant de proposer des changements

---

## 📞 Support

Pour toute question :
1. Consultez d'abord cet index
2. Lisez la documentation appropriée
3. Ouvrez une issue sur GitHub si nécessaire

---

**Dernière mise à jour :** 11 novembre 2025
**Version du projet :** 1.0.0
**Branche active :** `claude/update-project-documentation-011CV253wKEHNaoyodh2NSyN`
