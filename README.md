# Martinique Estimator Widget

Ce projet est un widget React/Next.js conçu pour estimer la valeur et le revenu potentiel de biens immobiliers en Martinique, basé sur des **données réelles Airbnb**. Il est destiné à être intégré via un `<iframe>` sur des plateformes comme Webflow.

## Architecture Technique

### Frontend
- **Next.js 15.2.3** avec App Router et export statique
- **TypeScript** avec validation Zod
- **Tailwind CSS + shadcn/ui** pour le design system
- **React Hook Form** pour la gestion des formulaires
- **React Leaflet** pour la cartographie
- **Recharts** pour les graphiques

### Backend (Architecture microservices)
```
Frontend (Next.js) 
    ↓ API call /estimate
n8n Webhook Orchestrator
    ↓ HTTP Request  
estimate-api:8080 ← Service d'estimation dédié
    ↓ MCP Protocol
Airbnb Search API ← Données réelles du marché
```

- **n8n** : Orchestration des workflows et logique métier
- **estimate-api** : Service backend d'estimation immobilière  
- **MCP Server** : Interface avec les APIs externes (Airbnb)
- **Données réelles** : Comparables Airbnb via scraping intelligent

## Démarrage Rapide

1.  **Installer les dépendances :**
    ```bash
    npm install
    ```
2.  **Lancer le serveur de développement :**
    ```bash
    npm run dev
    ```
    Le widget sera accessible sur `http://localhost:9002` (ou un autre port si 9002 est occupé).

## Build pour la Production

Pour générer les fichiers statiques pour le déploiement :

```bash
npm run build
```

Les fichiers optimisés seront créés dans le dossier `out` (export statique Next.js).

## Déployer sur Cloudflare Pages

Cloudflare Pages est une excellente option pour héberger gratuitement des sites statiques comme ce widget.

1.  **Pousser votre code sur GitHub/GitLab :** Assurez-vous que votre projet est sur une plateforme Git supportée par Cloudflare.
2.  **Créer un projet Cloudflare Pages :**
    - Connectez-vous à votre tableau de bord Cloudflare.
    - Allez dans `Workers & Pages` > `Create application` > `Pages` > `Connect to Git`.
    - Sélectionnez votre dépôt Git et la branche à déployer (ex: `main`).
3.  **Configurer les paramètres de build :**
    - **Framework preset:** Sélectionnez `Other` (car nous utilisons l'export statique)
    - **Build command:** `npm run build`
    - **Build output directory:** `out` (Next.js export statique)
    - **Variables d'environnement :**
      - `NEXT_PUBLIC_API_BASE` : URL de votre webhook n8n (ex: `https://votre-n8n.com/webhook`)
      - Autres variables selon votre configuration n8n
4.  **Déployer :** Cliquez sur `Save and Deploy`. Cloudflare va builder et déployer votre widget. Une URL unique vous sera fournie (ex: `martinique-estimator-widget.pages.dev`).

## Intégration via `<iframe>`

Une fois déployé, intégrez le widget dans votre site Webflow (ou autre) en utilisant une balise `<iframe>` :

```html
<iframe
  src="URL_DE_VOTRE_WIDGET_CLOUDFLARE"
  style="width: 100%; max-width: 500px; height: 700px; border: none; display: block; margin: 0 auto;"
  title="Martinique Estimator Widget"
></iframe>
```

Ajustez les styles (largeur, hauteur, etc.) selon vos besoins. Assurez-vous que la page contenant l'iframe autorise l'intégration depuis le domaine de Cloudflare Pages si des politiques de sécurité (CSP) sont en place.

## Configuration Backend (n8n)

### Prérequis
- Instance n8n opérationnelle
- Service `estimate-api` déployé sur le port 8080
- MCP Server configuré pour l'accès aux données Airbnb

### Workflow n8n
Le workflow fourni (`n8n-workflow.json`) contient :
- **Webhook `/estimate`** : Point d'entrée pour les requêtes frontend
- **Orchestration** : Appels séquentiels vers estimate-api et MCP Server
- **Formatage des données** : Transformation des réponses API pour le frontend
- **Gestion d'erreurs** : Fallback sur données mock si nécessaire

### Installation du workflow
1. Importez le workflow n8n depuis le fichier de configuration
2. Configurez l'URL du webhook dans `NEXT_PUBLIC_API_BASE`
3. Vérifiez que `estimate-api:8080` est accessible depuis n8n
4. Testez le MCP Server pour l'accès aux données Airbnb

### Limitations connues
- **Images des logements** : Non récupérées automatiquement depuis Airbnb, utilise des placeholders Picsum
- **Géolocalisation précise** : Coordonnées approximatives basées sur la zone de recherche
- **Rate limiting** : MCP Server peut être limité par les politiques anti-scraping d'Airbnb

### Problème actuel - Images manquantes
Le MCP Server récupère les données de comparables Airbnb (prix, description, localisation) mais **les images des logements ne sont pas extraites**. Le système utilise actuellement des images placeholder via Picsum Photos.

**Solutions possibles :**
1. Améliorer le scraper MCP pour extraire les URLs d'images Airbnb
2. Intégrer une API d'images immobilières tierces
3. Permettre l'upload manuel d'images via l'interface

## Déploiement complet

### 1. Frontend (Widget)
```bash
# Installation et build
npm install
npm run build
```

### 2. Backend (n8n + Services)
1. **Déployez n8n** avec le workflow fourni
2. **Configurez estimate-api** sur le port 8080  
3. **Configurez MCP Server** pour l'accès Airbnb
4. **Testez l'endpoint** `/estimate` avec des paramètres réels

### 3. Configuration Production
```bash
# Variables d'environnement
NEXT_PUBLIC_API_BASE=https://votre-n8n.com/webhook
```

### 4. Intégration finale
```html
<iframe
  src="https://your-widget.pages.dev"
  style="width:100%;max-width:900px;height:900px;border:0"
  title="Simulateur de revenus Martinique">
</iframe>
```

## Fonctionnalités

### ✅ Implémentées
- **Estimation automatique** basée sur URL Airbnb ou saisie manuelle
- **Données réelles** : Comparables Airbnb via MCP Protocol
- **Calculs précis** : Revenus annuels, saisonnalité, positionnement tarifaire
- **Interface moderne** : Responsive design avec shadcn/ui
- **Validation robuste** : React Hook Form + Zod
- **Intégration iframe** : Communication cross-frame optimisée

### 🚧 Limitations actuelles
- **Images des logements** : Placeholders au lieu des vraies photos
- **Géolocalisation précise** : Coordonnées approximatives
- **Cache des données** : Pas de persistance côté backend

### 🔮 Améliorations futures
- **IA Genkit** : Estimations enrichies par machine learning
- **Firebase** : Stockage et analytics avancés
- **TanStack Query** : Optimisation des requêtes et cache
- **Images automatiques** : Récupération depuis les sources Airbnb
