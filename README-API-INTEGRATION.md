# Migration API Cloudflare - Estimateur Revenus Airbnb

## 📋 Contexte

Cette migration remplace l'ancien appel API passant par n8n/webhook par un appel direct à l'API Cloudflare Workers déployée sur `https://estimate-api.carl-659.workers.dev/estimate`.

## 🔄 Changements effectués

### 1. Service NextJS (src/services/vdc-solutions.ts)

- ✅ Remplacement de l'implémentation mock par l'appel à l'API Cloudflare
- ✅ Gestion complète des erreurs avec try/catch
- ✅ Transformation des données pour maintenir la compatibilité avec l'interface existante
- ✅ Génération automatique des données de saisonnalité basées sur les prix
- ✅ Mapping intelligent bedrooms → adults (2 adultes minimum par chambre)

### 2. Page principale (src/app/page.tsx)

- ✅ Remplacement de l'appel fetch direct par l'utilisation du service `estimateProperty`
- ✅ Amélioration des messages d'erreur et de succès
- ✅ Conservation du loading state et de la gestion d'erreur existante

### 3. Version Webflow (webflow-estimator.js)

- ✅ Classe JavaScript vanilla compatible tous navigateurs
- ✅ Gestion complète des états : loading, succès, erreur
- ✅ Interface basée sur des data attributes pour faciliter l'intégration
- ✅ Format de données identique au système NextJS

## 🚀 API Cloudflare

### URL et paramètres
```
GET https://estimate-api.carl-659.workers.dev/estimate
```

**Paramètres :**
- `address` (requis) : Adresse/ville à analyser
- `adults` (optionnel, défaut=2) : Nombre d'adultes

**Exemple d'appel :**
```
https://estimate-api.carl-659.workers.dev/estimate?address=Sainte-Luce&adults=4
```

### Format de réponse
```json
{
  "address": "Sainte-Luce",
  "adults": 2,
  "medianPrice": 83,
  "p75Price": 117,
  "annualRevenue": 18177,
  "comps": [
    {
      "name": "Cozy studio 50 m from the beach",
      "adr": 83,
      "occ": 60,
      "dist": 0,
      "src": "Airbnb",
      "amenities": [],
      "url": "https://www.airbnb.com/rooms/1286341199827345361"
    }
  ]
}
```

## 💻 Utilisation NextJS

```typescript
import { estimateProperty } from '@/services/vdc-solutions';

const params = {
  address: 'Sainte-Luce',
  bedrooms: 2,
  currentPrice: 120
};

try {
  const result = await estimateProperty(params);
  if (result) {
    console.log('CA annuel estimé:', result.annualRevenue);
    console.log('Prix médian:', result.medianPrice);
    console.log('Nombre de comparables:', result.comps.length);
  }
} catch (error) {
  console.error('Erreur estimation:', error.message);
}
```

## 🌐 Utilisation Webflow

### 1. Intégration des fichiers

**Dans le `<head>` de votre page Webflow :**
```html
<!-- Pas de dépendances externes requises -->
```

**Avant la fermeture `</body>` :**
```html
<script src="webflow-estimator.js"></script>
```

### 2. Structure HTML

Utilisez les data attributes pour lier vos éléments :

```html
<!-- Formulaire -->
<form data-estimator="form">
  <input name="address" placeholder="Ville/Adresse" required>
  <select name="bedrooms">
    <option value="2">2 chambres</option>
  </select>
  <input name="currentPrice" type="number" placeholder="Prix actuel">
  <button type="submit">Estimer</button>
</form>

<!-- Loading -->
<div data-estimator="loader" style="display:none">
  Calcul en cours...
</div>

<!-- Erreurs -->
<div data-estimator="error" style="display:none"></div>

<!-- Résultats -->
<div data-estimator="results" style="display:none">
  <div data-result="annual-revenue"></div>
  <div data-result="median-price"></div>
  <div data-result="high-season"></div>
  <div data-result="low-season"></div>
  <div data-estimator="comps-list"></div>
</div>

<!-- Reset -->
<button data-estimator="reset">Recommencer</button>
```

### 3. Data attributes disponibles

**Contrôles :**
- `data-estimator="form"` : Formulaire principal
- `data-estimator="loader"` : Indicateur de chargement
- `data-estimator="error"` : Zone des messages d'erreur
- `data-estimator="results"` : Container des résultats
- `data-estimator="reset"` : Bouton de remise à zéro
- `data-estimator="comps-list"` : Liste des comparables

**Résultats :**
- `data-result="annual-revenue"` : CA annuel estimé
- `data-result="median-price"` : Prix médian
- `data-result="high-season"` : Prix haute saison
- `data-result="low-season"` : Prix basse saison
- `data-result="current-price"` : Prix actuel utilisateur
- `data-result="price-comparison"` : Comparaison de prix
- `data-result="comps-count"` : Nombre de comparables

### 4. Utilisation programmatique

```javascript
// Accès à l'estimateur global
const estimator = window.AirbnbEstimator;

// Appel direct
estimator.estimateProperty({
  address: 'Fort-de-France',
  bedrooms: 3,
  currentPrice: 150
}).then(result => {
  if (result) {
    console.log('Estimation réussie:', result);
  }
});

// Réinitialiser l'interface
estimator.reset();
```

## 🔧 Gestion des erreurs

### Types d'erreurs gérées

1. **Erreurs de validation :**
   - Adresse manquante
   - Format de paramètres incorrect

2. **Erreurs API :**
   - Erreur réseau (500, 404, etc.)
   - Timeout de requête
   - Réponse JSON invalide

3. **Erreurs métier :**
   - Aucune propriété comparable trouvée
   - Zone non couverte

### Affichage des erreurs

```javascript
// NextJS - Toast automatique
toast({ 
  title: 'Erreur d\'estimation', 
  description: error.message,
  variant: 'destructive' 
});

// Webflow - Affichage dans data-estimator="error"
// Masquage automatique après 5 secondes
```

## 📊 Transformation des données

### Mapping bedrooms → adults
```javascript
const adults = bedrooms ? Math.max(2, bedrooms * 2) : 2;
```

### Génération saisonnalité (Martinique)
```javascript
// Haute saison: Décembre-Avril
// Basse saison: Mai-Novembre
const seasonality = [
  highSeason,    // Janvier
  highSeason,    // Février  
  highSeason,    // Mars
  basePrice,     // Avril
  lowSeason,     // Mai-Novembre
  // ...
  highSeason,    // Décembre
];
```

### Compatibilité format existant
```javascript
const result = {
  medianPrice: data.medianPrice,
  p75Price: data.p75Price,
  annualRevenue: data.annualRevenue,
  comps: data.comps.map(comp => ({
    ...comp,
    price: comp.adr,      // Alias pour compatibilité
    occupancy: comp.occ,
    distance: comp.dist,
    source: comp.src,
  })),
  seasonality: generateSeasonalityData(data.medianPrice, data.p75Price),
  highSeasonAverage: Math.round(data.p75Price * 1.1),
  lowSeasonAverage: Math.round(data.medianPrice * 0.8),
};
```

## ✅ Tests recommandés

### 1. Test d'intégration NextJS
```bash
npm run dev
# Tester avec address="Sainte-Luce", bedrooms="2"
```

### 2. Test Webflow
1. Ouvrir `webflow-integration-example.html`
2. Tester différentes villes
3. Vérifier la gestion d'erreur avec une ville inexistante

### 3. Cas de test
- ✅ Ville existante : "Sainte-Luce"
- ✅ Ville avec espaces : "Fort de France"
- ❌ Ville inexistante : "VilleInexistante123"
- ✅ Différents nombres de chambres (1-5)
- ✅ Avec et sans prix actuel

## 🔒 Sécurité

- ✅ Pas de clés API côté client (API publique)
- ✅ Validation des paramètres côté serveur
- ✅ Gestion des erreurs sans exposition d'informations sensibles
- ✅ Rate limiting géré par Cloudflare Workers

## 🚀 Déploiement

### NextJS
```bash
npm run build
npm run start
```

### Webflow
1. Uploader `webflow-estimator.js` vers Webflow
2. Ajouter le script dans les paramètres de page
3. Configurer la structure HTML avec les data attributes
4. Styliser selon le design souhaité

## 📝 Notes importantes

1. **Conservation de l'interface existante** : Tous les composants React existants continuent de fonctionner sans modification
2. **Compatibilité descendante** : Le format de données reste identique
3. **Performance** : Appel direct à l'API (suppression de l'intermédiaire n8n)
4. **Maintenance** : Code centralisé dans le service, facilite les futures modifications