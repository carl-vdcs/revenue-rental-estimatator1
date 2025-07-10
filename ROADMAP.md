# Roadmap MVP - Widget Estimateur Martinique

## 🎯 État actuel : Système opérationnel avec données réelles

Le widget fonctionne avec de **vraies données Airbnb** récupérées via MCP Server :
```json
{
  "address": "Fort-de-France",
  "medianPrice": 103,
  "p75Price": 169, 
  "annualRevenue": 22557,
  "comps": [
    {
      "name": "Étang Z'abricot Apartment – Marina",
      "adr": 130,
      "amenities": ["Bay view", "Sea view", "Hair dryer"],
      "url": "https://www.airbnb.com/rooms/1263162401888880844"
    }
  ]
}
```

## 📋 Prochaines itérations par priorité

### 🔥 Sprint 1 : Saisonnalité avancée (Priorité HAUTE)

**Objectif** : Calculer les prix haute/basse saison automatiquement

#### Implémentation backend
```python
# utils/seasonality.py
@cached(ttl=86400)
async def get_seasonality(location, adults=2, year=2025):
    sem = asyncio.Semaphore(3)
    
    async def _month(m):
        checkin, checkout = probe_week(year, m)  # 2e semaine du mois
        async with sem:
            data = await airbnb_search(
                location=location,
                adults=adults, 
                checkin=checkin,
                checkout=checkout
            )
        prices = [extract_price(r) for r in data["searchResults"]]
        return statistics.median(prices)
    
    return await asyncio.gather(*[_month(m) for m in range(1,13)])

# Route FastAPI
@app.get("/seasonality")
async def seasonality(address: str, adults: int = 2, year: int = 2025):
    curve = await get_seasonality(address, adults, year)
    hi, lo = max(curve), min(curve)
    return {
        "address": address,
        "year": year, 
        "seasonality": curve,
        "highPrice": hi,
        "lowPrice": lo,
        "monthHigh": curve.index(hi) + 1,
        "monthLow": curve.index(lo) + 1
    }
```

#### Frontend à adapter
- Affichage graphique des 12 mois (Recharts)
- Badges "Haute saison : Août ≈ 180€"
- Toggle haute/basse saison dans l'interface

---

### ⚡ Sprint 2 : Occupation réaliste (Priorité HAUTE)

**Objectif** : Remplacer le `occ: 60` fixe par un calcul intelligent

#### Algorithme simplifié
```python
def calculate_occupation(seasonality_curve, location_type="urban"):
    base_occ = 0.4  # 40% de base
    seasonal_bonus = 0.4 * (median(seasonality_curve) / max(seasonality_curve))
    
    # Ajustements par zone
    location_multiplier = {
        "urban": 1.0,      # Fort-de-France
        "beach": 1.2,      # Sainte-Anne
        "mountain": 0.8    # Intérieur
    }.get(location_type, 1.0)
    
    return min(base_occ + seasonal_bonus * location_multiplier, 0.85)
```

#### Cache Redis
- Clé : `occ:{listing_id}` 
- TTL : 24h
- Invalidation si nouvelle data seasonality

---

### 🔍 Sprint 3 : Pagination intelligente (Priorité MOYENNE)

**Objectif** : Plus de comparables cohérents

#### Problématique actuelle
- Airbnb retourne 18 annonces/page
- Fort-de-France > 200 annonces disponibles
- Page 0 = biais "guest favorites"

#### Stratégie MVP
```python
@app.get("/estimate")
async def estimate(address: str, adults: int = 2, pages: int = 2):
    all_comps = []
    
    for page in range(pages):
        cursor = get_page_cursor(page)  # pagination logic
        data = await airbnb_search(address, adults, cursor=cursor)
        all_comps.extend(data["searchResults"])
    
    # Filtrage intelligent
    filtered_comps = filter_comparables(
        all_comps,
        max_distance_km=3,
        same_bedrooms=adults,
        min_amenities_overlap=0.3
    )
    
    return format_response(filtered_comps)
```

#### Frontend ajustements
- Liste scrollable des comparables
- Filtre par distance/typologie
- Loader "Recherche de comparables similaires..."

---

### 🛡️ Sprint 4 : Rate limiting (Priorité MOYENNE)

**Objectif** : Protection anti-spam et performance

```python
# Sémaphore global
listing_details_sem = asyncio.Semaphore(3)

async def get_listing_details(listing_id):
    async with listing_details_sem:
        return await mcp_client.airbnb_listing_details(listing_id)
```

---

### 📄 Sprint 5 : Rapports PDF + Email (Priorité MOYENNE)

**Objectif** : Génération et envoi automatique de rapports

#### Stack technique
- **WeasyPrint** pour PDF generation
- **Jinja2** templates
- **n8n SMTP** node pour envoi

#### Template rapport
```html
<!-- report_template.html -->
<div class="report">
  <h1>Estimation {{ address }}</h1>
  <div class="kpis">
    <div>CA annuel estimé : {{ annual_revenue }}€</div>
    <div>Prix médian : {{ median_price }}€/nuit</div>
  </div>
  <div class="seasonality-chart">
    <!-- Graphique 12 mois -->
  </div>
  <div class="comparables">
    <!-- Liste des comps avec amenities -->
  </div>
</div>
```

---

### 💎 Sprint 6 : Features premium (Priorité BASSE)

#### Refresh forcé
```python
@app.get("/estimate") 
async def estimate(address: str, refresh: bool = False):
    if refresh:
        # Bypass tous les caches
        await redis.delete(f"search:{address}")
        await redis.delete(f"seasonality:{address}")
    # ...
```

#### Export CSV complet
- Boucle sur toutes les pages Martinique
- Export pour analyse ETL
- Stockage MySQL pour historique

---

## 🎨 Frontend UI - Améliorations nécessaires

### Composants à créer/modifier

#### 1. `SeasonalityChart.tsx`
```typescript
interface SeasonalityData {
  month: string;
  price: number;
  isHigh: boolean;
  isLow: boolean;
}

const SeasonalityChart = ({ data }: { data: SeasonalityData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Bar dataKey="price" fill={(entry) => entry.isHigh ? "#ef4444" : entry.isLow ? "#3b82f6" : "#6b7280"} />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

#### 2. `ComparablesGrid.tsx`
```typescript
const ComparablesGrid = ({ comps }: { comps: Comparable[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
      {comps.map((comp) => (
        <ComparableCard key={comp.url} comparable={comp} />
      ))}
    </div>
  );
};
```

#### 3. Mise à jour `ResultsCard.tsx`
- Ajout section saisonnalité
- Toggle haute/basse saison  
- Pagination des comparables

---

## 🔧 Limitations techniques à résoudre

### Images des logements 
**Problème** : MCP Server ne récupère pas les images Airbnb

**Solutions** :
1. **Améliorer le scraper MCP** : Extraire les URLs d'images depuis le HTML
2. **API tierce** : Utiliser une API d'images immobilières
3. **Upload manuel** : Interface pour ajouter des images custom

### Géolocalisation précise
**Problème** : Coordonnées approximatives

**Solutions** :
1. **API de géocodage** : Google Maps / OpenStreetMap
2. **Améliorer l'extraction** : Parser les adresses Airbnb plus finement

---

## 📈 Métriques de succès

### Performance
- [ ] Temps de réponse `/estimate` < 3s
- [ ] Cache hit ratio > 80%
- [ ] Taux d'erreur MCP < 5%

### Qualité des données
- [ ] > 10 comparables par estimation
- [ ] Distance moyenne < 2km
- [ ] Écart-type prix < 30%

### UX
- [ ] Taux de conversion form > 15%
- [ ] Temps passé sur résultats > 2min
- [ ] Taux de rebond < 40%

---

## 🚀 Déploiement

### Ordre de release
1. **Backend seasonality** → Tests avec Fort-de-France
2. **Frontend charts** → Validation UX
3. **Occupation algorithm** → A/B test vs fixed 60%
4. **Pagination** → Mesure impact qualité comps
5. **PDF reports** → Feature secondaire
6. **Premium features** → Monétisation

### Rollback strategy
- Feature flags pour chaque fonctionnalité
- Fallback sur données mock si API fail
- Monitoring Sentry pour alertes