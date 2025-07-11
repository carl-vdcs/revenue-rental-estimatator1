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

> **⚠️ NOUVEAU FOCUS** : Lead magnet crédible (pas concurrence PriceLabs)
> 
> **Objectif** : Générer 10-20 leads qualifiés/mois pour tester la traction
> 
> **Timeline** : 2-3 semaines max

### 🔥 Sprint 1 : Volume suffisant (Priorité HAUTE)

**Objectif** : 50+ comparables pour crédibilité (vs 18 actuels)

#### Stratégie simple et efficace
```python
@app.get("/estimate")
async def estimate(address: str, adults: int = 2):
    all_comps = []
    
    # 3 pages = ~54 annonces (suffisant pour crédibilité)
    for page in range(3):
        data = await airbnb_search(address, adults, page=page)
        all_comps.extend(data["searchResults"])
    
    # Filtrer dans 10km max (rayon raisonnable)
    filtered = [c for c in all_comps if c.distance_km <= 10]
    
    return format_response(filtered[:50])  # Max 50 pour performance
```

#### Impact lead magnet
- **18 → 50+ comparables** = +180% crédibilité
- **Message confiance** : "Basé sur 50+ annonces réelles"
- **Performance maintenue** : <3s de réponse
- **Timeline** : 3-4 jours d'implémentation

---

### ⚡ Sprint 2 : Occupation crédible (Priorité HAUTE)

**Objectif** : Algo simple mais crédible (vs 60% fixe peu crédible)

#### Problème actuel
- **60% fixe** pour tous les logements = peu crédible
- Utilisateurs voient que c'est "bidon"

#### Algorithme simple mais réaliste
```python
def calculate_credible_occupation(location_name, amenities):
    # Base selon zone (données publiques INSEE/Observatoire)
    base_rates = {
        "fort-de-france": 45,
        "trois-ilets": 70, 
        "sainte-anne": 75,
        "le-diamant": 65,
        "sainte-luce": 68,
        "le-marin": 62,
        "default": 55
    }
    
    base = base_rates.get(location_name.lower(), base_rates["default"])
    
    # Bonus équipements premium (simple)
    premium_amenities = ["sea view", "pool", "air conditioning", "wifi"]
    bonus = len([a for a in amenities if any(p in a.lower() for p in premium_amenities)]) * 3
    
    return min(base + bonus, 85)  # Cap 85%
```

#### Impact lead magnet
- **Occupation variable 45-85%** selon zone/équipements
- **Crédibilité locale** : Fort-de-France ≠ Sainte-Anne
- **Timeline** : 2-3 jours d'implémentation

---

### 🎯 Sprint 3 : Lead capture UX (Priorité MOYENNE)

**Objectif** : Convertir les visiteurs en leads qualifiés

#### Améliorations UX critiques
1. **Message de crédibilité** dans ResultsCard
2. **CTA lead capture** optimisé
3. **Formulaire email** simple

```tsx
// Message de crédibilité 
<div className="bg-blue-50 p-3 rounded mb-4">
  <p className="text-sm text-blue-800">
    📊 Estimation basée sur <strong>{comps.length} annonces réelles</strong> 
    dans un rayon de 10km avec données Airbnb actualisées
  </p>
</div>

// CTA amélioré
<Button onClick={() => setShowLeadModal(true)}>
  📧 Recevoir l'analyse détaillée par email
</Button>

// Modal lead capture
const LeadCaptureModal = () => (
  <Dialog open={showLeadModal}>
    <DialogContent>
      <h3>Recevez votre analyse détaillée</h3>
      <form onSubmit={handleEmailCapture}>
        <Input placeholder="Votre email" type="email" required />
        <Input placeholder="Nom du projet (optionnel)" />
        <Button type="submit">Envoyer l'analyse</Button>
      </form>
    </DialogContent>
  </Dialog>
);
```

#### Impact lead magnet
- **Taux de conversion** objectif : 15%
- **Message confiance** visible
- **CTA clair** et attractif
- **Timeline** : 2-3 jours

---

### 🔍 Sprint 4 : Volume de données massif (Priorité BASSE - Post-traction)

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