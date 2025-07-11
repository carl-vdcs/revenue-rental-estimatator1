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

### ⚡ Sprint 2 : Occupation intelligente (Priorité HAUTE)

**Objectif** : Algorithme sophistiqué vs PriceLabs (58% ajustée vs notre 60% fixe)

#### Insight concurrentiel
- PriceLabs : Occupation ajustée 58% (algorithme exclusif)
- Nous : 60% fixe pour tous les logements

#### Algorithme amélioré multi-facteurs
```python
def calculate_smart_occupation(listing, seasonality_data, location_type):
    # Base selon type de zone (données Martinique)
    base_occ = {
        "urban": 0.45,        # Fort-de-France
        "beach": 0.65,        # Sainte-Anne, Diamant  
        "mountain": 0.35      # Intérieur Martinique
    }.get(location_type, 0.50)
    
    # Bonus équipements (Sea view, Pool, etc.)
    amenity_bonus = calculate_amenity_score(listing.amenities) * 0.10
    
    # Facteur saisonnier 
    seasonal_factor = (median(seasonality_data) / max(seasonality_data))
    
    # Évolution marché (données historiques)
    market_trend = get_market_evolution(location, year=2024) # +5% vs 2023
    
    occupation = min(
        base_occ + amenity_bonus + (seasonal_factor * 0.15) + market_trend,
        0.85  # Cap à 85% max
    )
    
    return round(occupation * 100)  # Retour en %
```

#### Cache Redis
- Clé : `occ:{listing_id}` 
- TTL : 24h
- Invalidation si nouvelle data seasonality

---

### 🔍 Sprint 3 : Volume de données massif (Priorité HAUTE ⬆️)

**Objectif** : Rivaliser avec PriceLabs (350 annonces vs nos 18 actuelles)

#### Insight concurrentiel
- PriceLabs : 350 annonces dans 15km radius
- Nous : ~18 annonces (page 0 uniquement)

#### Stratégie améliorée - Radius adaptatif
```python
@app.get("/estimate")
async def estimate(address: str, adults: int = 2, max_radius_km: int = 15):
    all_comps = []
    radius_km = 5  # Commencer par 5km
    
    while len(all_comps) < 300 and radius_km <= max_radius_km:
        # Récupérer 5 pages par radius = ~90 annonces
        for page in range(5):
            data = await airbnb_search(
                address, adults, 
                page=page, 
                radius_km=radius_km
            )
            all_comps.extend(data["searchResults"])
        
        radius_km += 2  # Élargir à 7km, 9km, etc.
    
    # Filtrer et garder les 300 meilleurs comparables
    return filter_best_comparables(all_comps[:300])
```

#### Impact attendu
- 🎯 **300+ comparables** vs 18 actuels
- 📊 **Précision estimations** considérablement améliorée  
- 🏆 **Niveau concurrentiel** PriceLabs

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

### � Sprint 5 : Prix nets propriétaire (Priorité MOYENNE)

**Objectif** : Calculer revenus réels propriétaire vs PriceLabs

#### Insight concurrentiel
- PriceLabs : "Prix avant commissions, taxes, frais de nettoyage"
- Nous : Prix bruts Airbnb sans détail des frais

#### Implémentation prix nets
```python
def calculate_net_owner_price(gross_airbnb_price):
    """Calcule le revenu net réel du propriétaire"""
    # Frais Airbnb (3% hôte + 14% voyageur sur total)
    airbnb_commission = gross_airbnb_price * 0.03
    
    # Taxes locales Martinique
    tourist_tax = 2.30  # € par nuit (DOM-TOM)
    
    # Frais nettoyage moyens Martinique
    cleaning_fee = 45  # € (revenu séparé propriétaire)
    
    net_price = gross_airbnb_price - airbnb_commission - tourist_tax
    
    return {
        "gross_price": gross_airbnb_price,
        "net_owner_price": net_price,
        "airbnb_commission": airbnb_commission,
        "tourist_tax": tourist_tax,
        "cleaning_fee": cleaning_fee,  # Revenue additionnel
        "effective_yield": (net_price + cleaning_fee) / gross_airbnb_price
    }
```

---

### �📄 Sprint 6 : Rapports PDF + Email (Priorité MOYENNE)

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

### � Sprint 7 : Tendances historiques (Priorité MOYENNE)

**Objectif** : Graphiques mensuels vs PriceLabs

#### Insight concurrentiel
- PriceLabs : Graphiques tendances mensuelles (revenus, tarifs, occupation)
- Nous : Données instantanées uniquement

#### Endpoint tendances
```python
@app.get("/trends")
async def get_monthly_trends(address: str, year: int = 2024):
    """Analyse 12 mois de données historiques"""
    
    trends = []
    for month in range(1, 13):
        # Données historiques via MCP
        historical_data = await get_historical_month_data(address, month, year)
        
        trends.append({
            "month": month,
            "avg_revenue": historical_data.revenue,
            "avg_adr": historical_data.adr, 
            "avg_occupation": historical_data.occupation,
            "num_listings": len(historical_data.comparables)
        })
    
    return {
        "address": address,
        "year": year,
        "monthly_trends": trends,
        "yearly_summary": calculate_yearly_stats(trends)
    }
```

---

### �💎 Sprint 8 : Features premium (Priorité BASSE)

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