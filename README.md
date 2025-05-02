# Martinique Estimator Widget

Ce projet est un widget React conçu pour estimer la valeur et le revenu potentiel de biens immobiliers en Martinique. Il est destiné à être intégré via un `<iframe>` sur des plateformes comme Webflow.

## Stack Technique

- Vite
- React
- Tailwind CSS
- React Hook Form + Zod (Validation)
- React Leaflet (Cartographie)

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

Les fichiers optimisés seront créés dans le dossier `dist`.

## Déployer sur Cloudflare Pages

Cloudflare Pages est une excellente option pour héberger gratuitement des sites statiques comme ce widget.

1.  **Pousser votre code sur GitHub/GitLab :** Assurez-vous que votre projet est sur une plateforme Git supportée par Cloudflare.
2.  **Créer un projet Cloudflare Pages :**
    - Connectez-vous à votre tableau de bord Cloudflare.
    - Allez dans `Workers & Pages` > `Create application` > `Pages` > `Connect to Git`.
    - Sélectionnez votre dépôt Git et la branche à déployer (ex: `main`).
3.  **Configurer les paramètres de build :**
    - **Framework preset:** Sélectionnez `Next.js`. Cloudflare détecte souvent Next.js et pré-remplit les commandes.
    - **Build command:** `npm run build`
    - **Build output directory:** `.next` (Cloudflare Pages utilise le répertoire `.next` pour les builds Next.js)
    - **Variables d'environnement (optionnel) :** Ajoutez si nécessaire (ex: clé API pour VDC Solutions si elle était utilisée côté client, bien que ce ne soit pas recommandé pour des raisons de sécurité).
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

## Deployment on Cloudflare Pages (static)

1. Install dependencies locally:

```bash
npm install
```

2. Build **static export**:

```bash
npm run build
```

Due to `output: 'export'` in **next.config.ts**, this generates an `out/` folder.

3. Push to GitHub and in Cloudflare Pages choose **Framework preset: `Other`** and set  

- **Build command**: `npm run build`  
- **Output directory**: `out`

4. The app fetches mock data from `/mock/estimate.json` included in `public/mock/`.  
   Later, replace the fetch call (or add an API route) to serve real data.

5. Embed the final URL in Webflow:

```html
<iframe
  src="https://your-cloudflare-project.pages.dev"
  style="width:100%;max-width:900px;height:900px;border:0"
  title="Simulateur de revenus Martinique">
</iframe>
```
