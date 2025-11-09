# Guide d'Intégration de la Boutique Premium - Falling Stars

## Vue d'ensemble

Ce document explique comment intégrer les achats avec argent réel dans Falling Stars, transformant l'application de PWA en application iOS native avec paiements In-App Purchase.

## État actuel

✅ **Implémenté :**
- Ressource Antimatière ajoutée au jeu
- Taux de drop ultra-rare : 0.1% (1 sur 1000 fragments)
- Interface boutique premium dans le modal Shop
- 5 packs d'antimatière disponibles ($0.99 à $24.99)
- Système d'achat en mode DÉMO (simulation)
- Documentation intégrée dans le code

⚠️ **À implémenter :**
- Intégration réelle des paiements (voir options ci-dessous)

---

## Option 1 : iOS Native avec StoreKit (Recommandé pour App Store)

### Avantages
- ✅ Paiements natifs Apple (sécurisés, fiables)
- ✅ Respect des guidelines App Store
- ✅ Gestion automatique des reçus et remboursements
- ✅ Support des abonnements
- ✅ TestFlight pour tests avant publication

### Prérequis
1. Compte Apple Developer ($99/an)
2. App Store Connect configuré
3. Node.js et npm installés

### Étapes d'intégration

#### 1. Convertir en app native avec Capacitor

```bash
# Installer Capacitor
npm install @capacitor/core @capacitor/cli

# Initialiser Capacitor
npx cap init "Falling Stars" "com.fallingstars.game"

# Ajouter la plateforme iOS
npm install @capacitor/ios
npx cap add ios

# Copier les fichiers web
npx cap copy
npx cap sync
```

#### 2. Installer le plugin In-App Purchase

```bash
npm install @capacitor-community/in-app-purchases
npx cap sync
```

#### 3. Configurer App Store Connect

1. Créer l'app dans App Store Connect
2. Ajouter les produits In-App Purchase avec les Product IDs :
   - `com.fallingstars.antimatter.small` - $0.99
   - `com.fallingstars.antimatter.medium` - $3.99
   - `com.fallingstars.antimatter.large` - $9.99
   - `com.fallingstars.antimatter.mega` - $24.99
   - `com.fallingstars.starter.pack` - $4.99

3. Configurer les informations fiscales et bancaires

#### 4. Modifier le code JavaScript

Remplacer la fonction `purchasePremiumItem()` dans `index.html` :

```javascript
import { InAppPurchases } from '@capacitor-community/in-app-purchases';

// Initialiser au démarrage
async function initializeIAP() {
    try {
        await InAppPurchases.restorePurchases();
        console.log('IAP initialized');
    } catch (error) {
        console.error('IAP init error:', error);
    }
}

async function purchasePremiumItem(itemKey) {
    const item = premiumShopData[itemKey];

    try {
        // Démarrer l'achat
        const result = await InAppPurchases.purchaseProduct({
            productId: item.productId,
            applicationUsername: game.username // Pour lier l'achat au joueur
        });

        if (result.transactionState === 'purchased') {
            // Vérifier le reçu côté serveur (recommandé)
            await verifyReceipt(result.receipt);

            // Donner les récompenses
            processPremiumPurchase(itemKey);

            // Finaliser la transaction
            await InAppPurchases.finishTransaction({
                transactionId: result.transactionId
            });
        }
    } catch (error) {
        if (error.message.includes('cancelled')) {
            showNotification('❌ Achat annulé');
        } else {
            showNotification('❌ Erreur: ' + error.message);
        }
    }
}

// Vérification du reçu (serveur backend requis)
async function verifyReceipt(receipt) {
    const response = await fetch('https://your-backend.com/verify-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            receipt,
            userId: game.username
        })
    });

    if (!response.ok) {
        throw new Error('Invalid receipt');
    }
}
```

#### 5. Serveur backend pour vérification (Node.js)

```javascript
const express = require('express');
const axios = require('axios');

app.post('/verify-receipt', async (req, res) => {
    const { receipt, userId } = req.body;

    // Vérifier avec Apple
    const verifyUrl = 'https://buy.itunes.apple.com/verifyReceipt'; // Production
    // const verifyUrl = 'https://sandbox.itunes.apple.com/verifyReceipt'; // Sandbox

    try {
        const response = await axios.post(verifyUrl, {
            'receipt-data': receipt,
            'password': 'YOUR_SHARED_SECRET' // Depuis App Store Connect
        });

        if (response.data.status === 0) {
            // Reçu valide - logger dans votre DB
            await logPurchase(userId, response.data);
            res.json({ valid: true });
        } else {
            res.status(400).json({ valid: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

#### 6. Tester avec TestFlight

```bash
# Build pour iOS
npx cap open ios
# Dans Xcode : Product > Archive > Distribute App > TestFlight
```

---

## Option 2 : Paiements Web avec Stripe (Pour PWA)

### Avantages
- ✅ Pas de conversion nécessaire
- ✅ Fonctionne sur tous les navigateurs
- ✅ Cartes de crédit, Apple Pay, Google Pay supportés
- ✅ Déploiement immédiat

### Inconvénients
- ❌ Ne peut pas être publié sur App Store avec paiements web
- ❌ Commission Stripe (2.9% + $0.30 par transaction)
- ❌ Nécessite un serveur backend

### Étapes d'intégration

#### 1. Créer un compte Stripe

1. S'inscrire sur [stripe.com](https://stripe.com)
2. Obtenir les clés API (Dashboard > Developers > API Keys)
   - Clé publiable : `pk_test_...` (développement)
   - Clé secrète : `sk_test_...` (backend uniquement)

#### 2. Ajouter Stripe.js

Dans `index.html`, ajouter avant `</head>` :

```html
<script src="https://js.stripe.com/v3/"></script>
```

#### 3. Modifier le code JavaScript

```javascript
const stripe = Stripe('pk_live_YOUR_PUBLISHABLE_KEY');

async function purchasePremiumItem(itemKey) {
    const item = premiumShopData[itemKey];

    try {
        // Créer une session de paiement
        const response = await fetch('https://your-backend.com/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: item.productId,
                userId: game.username
            })
        });

        const { sessionId } = await response.json();

        // Rediriger vers Stripe Checkout
        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
            showNotification('❌ Erreur: ' + error.message);
        }
    } catch (error) {
        showNotification('❌ Erreur de connexion');
    }
}

// Gérer le retour après paiement
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
        // Vérifier le paiement
        verifyPaymentAndGrantRewards(sessionId);
    }
});
```

#### 4. Serveur backend (Node.js + Express)

```javascript
const express = require('express');
const stripe = require('stripe')('sk_live_YOUR_SECRET_KEY');

const app = express();
app.use(express.json());

// Mapping des produits
const products = {
    'com.fallingstars.antimatter.small': {
        name: 'Pack Antimatière Petit',
        price: 99, // en centimes
        antimatter: 10
    },
    // ... autres produits
};

// Créer une session de paiement
app.post('/create-checkout', async (req, res) => {
    const { productId, userId } = req.body;
    const product = products[productId];

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: ['https://your-cdn.com/antimatter-icon.png']
                    },
                    unit_amount: product.price
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `https://your-game.com/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'https://your-game.com/',
            client_reference_id: userId,
            metadata: { productId, userId }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook pour confirmer le paiement
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET';

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Logger l'achat dans votre base de données
            await grantPremiumRewards(
                session.metadata.userId,
                session.metadata.productId
            );
        }

        res.json({ received: true });
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

#### 5. Déployer le backend

Options recommandées :
- **Heroku** : Gratuit pour commencer
- **Vercel/Netlify** : Pour serverless functions
- **DigitalOcean** : VPS à $5/mois

---

## Comparaison des options

| Critère | iOS Native (StoreKit) | Web (Stripe) |
|---------|----------------------|--------------|
| **Publication App Store** | ✅ Oui | ❌ Non |
| **Installation requise** | ✅ Via App Store | ❌ PWA direct |
| **Commission** | 15-30% (Apple) | 2.9% + $0.30 |
| **Développement** | Moyen (Capacitor) | Facile (Web API) |
| **Backend requis** | Optionnel | ✅ Requis |
| **Méthodes de paiement** | Apple Pay, Cartes | Carte, Apple Pay, Google Pay |
| **Délai approbation** | 1-3 jours | Immédiat |

---

## Recommandation

### Pour monetisation sérieuse :
**iOS Native (Option 1)** - L'antimatière rare justifie une vraie app mobile avec paiements Apple.

### Pour test rapide :
**Web Stripe (Option 2)** - Plus rapide à déployer, mais ne peut pas aller sur App Store.

### Approche hybride :
1. Démarrer avec Stripe pour tester le marché
2. Si succès, convertir en app native iOS + Android

---

## Prochaines étapes

1. ✅ Tester le système en mode démo
2. ⬜ Choisir l'option d'intégration (iOS ou Web)
3. ⬜ Créer compte développeur (Apple ou Stripe)
4. ⬜ Implémenter le système de paiement
5. ⬜ Tester avec de vrais paiements (sandbox/test)
6. ⬜ Configurer backend pour vérification
7. ⬜ Publier l'application

---

## Support & Ressources

### Apple StoreKit
- [Documentation officielle](https://developer.apple.com/in-app-purchase/)
- [Capacitor IAP Plugin](https://github.com/capacitor-community/in-app-purchases)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Stripe
- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Testing Stripe](https://stripe.com/docs/testing)

### Capacitor
- [Getting Started](https://capacitorjs.com/docs/getting-started)
- [iOS Development](https://capacitorjs.com/docs/ios)

---

## Questions fréquentes

**Q: Puis-je utiliser les deux systèmes (iOS + Web) ?**
A: Non, Apple interdit les paiements alternatifs dans les apps iOS. Vous devez utiliser uniquement StoreKit.

**Q: L'antimatière doit-elle être consommable ou non-consommable ?**
A: Consommable (peut être acheté plusieurs fois).

**Q: Comment gérer les remboursements ?**
A: iOS : Apple gère automatiquement. Stripe : Via le dashboard Stripe.

**Q: Faut-il un serveur backend ?**
A: Recommandé pour vérifier les reçus et éviter la fraude, mais pas obligatoire pour commencer.

---

*Document créé le 2025-11-08*
*Dernière mise à jour : 2025-11-08*
