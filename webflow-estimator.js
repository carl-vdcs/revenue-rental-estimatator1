/**
 * Estimateur de revenus Airbnb pour Webflow
 * Utilise l'API Cloudflare Workers directement
 */

class AirbnbEstimator {
  constructor() {
    this.apiUrl = 'https://estimate-api.carl-659.workers.dev/estimate';
    this.isLoading = false;
  }

  /**
   * Appelle l'API Cloudflare pour obtenir une estimation
   * @param {Object} params - Paramètres d'estimation
   * @param {string} params.address - Adresse/ville à analyser
   * @param {number} [params.bedrooms=2] - Nombre de chambres
   * @param {number} [params.currentPrice] - Prix actuel par nuit
   * @returns {Promise<Object|null>} Résultat de l'estimation ou null si erreur
   */
  async estimateProperty(params) {
    if (this.isLoading) {
      console.warn('Une estimation est déjà en cours...');
      return null;
    }

    try {
      this.isLoading = true;
      this.showLoading();

      // Validation des paramètres
      if (!params.address || typeof params.address !== 'string') {
        throw new Error('L\'adresse est requise');
      }

      // Construction de l'URL avec les paramètres
      const url = new URL(this.apiUrl);
      url.searchParams.set('address', params.address.trim());
      
      // Conversion bedrooms -> adults (estimation: 2 adultes par chambre minimum)
      const adults = params.bedrooms ? Math.max(2, params.bedrooms * 2) : 2;
      url.searchParams.set('adults', adults.toString());

      console.log('Appel API Cloudflare:', url.toString());

      // Appel à l'API
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Vérification des données
      if (!data.comps || data.comps.length === 0) {
        this.showError('Aucune propriété comparable trouvée dans cette zone.');
        return null;
      }

      // Transformation des données pour compatibilité
      const result = this.transformApiResponse(data, params.currentPrice);
      
      console.log('Estimation réussie:', result);
      this.showResults(result, params);
      
      return result;

    } catch (error) {
      console.error('Erreur lors de l\'estimation:', error);
      this.showError(error.message || 'Une erreur est survenue lors de l\'estimation.');
      return null;
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  /**
   * Transforme la réponse de l'API Cloudflare au format attendu
   * @param {Object} apiData - Données de l'API Cloudflare
   * @param {number} currentPrice - Prix actuel de l'utilisateur
   * @returns {Object} Données formatées
   */
  transformApiResponse(apiData, currentPrice = 0) {
    const { medianPrice, p75Price, annualRevenue, comps } = apiData;

    // Génération des données de saisonnalité (simulation Martinique)
    const seasonality = this.generateSeasonalityData(medianPrice, p75Price);

    return {
      medianPrice,
      p75Price,
      annualRevenue,
      comps: comps.map(comp => ({
        ...comp,
        price: comp.adr,
        occupancy: comp.occ,
        distance: comp.dist,
        source: comp.src,
      })),
      seasonality,
      highSeasonAverage: Math.round(p75Price * 1.1),
      lowSeasonAverage: Math.round(medianPrice * 0.8),
      currentPrice,
      // Calcul de la différence en pourcentage
      priceDifferencePercent: currentPrice > 0 
        ? Math.round(((currentPrice - medianPrice) / medianPrice) * 100)
        : 0,
    };
  }

  /**
   * Génère des données de saisonnalité pour la Martinique
   * @param {number} medianPrice - Prix médian
   * @param {number} p75Price - Prix 75e percentile
   * @returns {number[]} Tableau de 12 mois de prix
   */
  generateSeasonalityData(medianPrice, p75Price) {
    const basePrice = medianPrice;
    const highSeason = p75Price;
    const lowSeason = Math.round(medianPrice * 0.8);
    
    // Martinique: haute saison décembre-avril, basse saison mai-novembre
    return [
      highSeason,    // Janvier
      highSeason,    // Février
      highSeason,    // Mars
      basePrice,     // Avril
      lowSeason,     // Mai
      lowSeason,     // Juin
      lowSeason,     // Juillet
      lowSeason,     // Août
      lowSeason,     // Septembre
      lowSeason,     // Octobre
      lowSeason,     // Novembre
      highSeason,    // Décembre
    ];
  }

  /**
   * Affiche l'indicateur de chargement
   */
  showLoading() {
    const loader = document.querySelector('[data-estimator="loader"]');
    const form = document.querySelector('[data-estimator="form"]');
    const results = document.querySelector('[data-estimator="results"]');
    
    if (loader) loader.style.display = 'block';
    if (form) form.style.display = 'none';
    if (results) results.style.display = 'none';
  }

  /**
   * Cache l'indicateur de chargement
   */
  hideLoading() {
    const loader = document.querySelector('[data-estimator="loader"]');
    if (loader) loader.style.display = 'none';
  }

  /**
   * Affiche les résultats dans l'interface
   * @param {Object} results - Résultats de l'estimation
   * @param {Object} params - Paramètres originaux
   */
  showResults(results, params) {
    const form = document.querySelector('[data-estimator="form"]');
    const resultsDiv = document.querySelector('[data-estimator="results"]');
    
    if (form) form.style.display = 'none';
    if (resultsDiv) {
      resultsDiv.style.display = 'block';
      this.populateResults(results, params);
    }
  }

  /**
   * Remplit les éléments de résultats avec les données
   * @param {Object} results - Résultats de l'estimation
   * @param {Object} params - Paramètres originaux
   */
  populateResults(results, params) {
    // Format monétaire
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(value).replace(/\s/g, '\u00A0');
    };

    // Mise à jour des éléments avec data attributes
    const elements = {
      'annual-revenue': formatCurrency(results.annualRevenue),
      'median-price': formatCurrency(results.medianPrice),
      'high-season': formatCurrency(Math.max(...results.seasonality)),
      'low-season': formatCurrency(Math.min(...results.seasonality)),
      'comps-count': results.comps.length.toString(),
      'p75-price': formatCurrency(results.p75Price),
    };

    // Mettre à jour les éléments DOM
    Object.entries(elements).forEach(([key, value]) => {
      const element = document.querySelector(`[data-result="${key}"]`);
      if (element) {
        element.textContent = value;
      }
    });

    // Affichage du prix actuel et comparaison si fourni
    if (params.currentPrice && params.currentPrice > 0) {
      const currentPriceEl = document.querySelector('[data-result="current-price"]');
      const priceComparisonEl = document.querySelector('[data-result="price-comparison"]');
      
      if (currentPriceEl) {
        currentPriceEl.textContent = formatCurrency(params.currentPrice);
      }
      
      if (priceComparisonEl) {
        const diff = results.priceDifferencePercent;
        let text, className;
        
        if (diff === 0) {
          text = 'dans la médiane';
          className = 'neutral';
        } else if (diff > 0) {
          text = `${diff}% au-dessus`;
          className = 'above';
        } else {
          text = `${Math.abs(diff)}% en-dessous`;
          className = 'below';
        }
        
        priceComparisonEl.textContent = text;
        priceComparisonEl.className = `price-comparison ${className}`;
      }
    }

    // Affichage des propriétés comparables
    this.displayComparables(results.comps);
  }

  /**
   * Affiche la liste des propriétés comparables
   * @param {Array} comps - Liste des comparables
   */
  displayComparables(comps) {
    const container = document.querySelector('[data-estimator="comps-list"]');
    if (!container) return;

    container.innerHTML = '';
    
    comps.slice(0, 5).forEach(comp => { // Limiter à 5 pour l'affichage
      const compElement = document.createElement('div');
      compElement.className = 'comp-item';
      compElement.innerHTML = `
        <div class="comp-name">${comp.name}</div>
        <div class="comp-details">
          <span class="comp-price">${comp.adr}€/nuit</span>
          <span class="comp-occupancy">${comp.occ}% occupation</span>
          <span class="comp-distance">${comp.dist}km</span>
        </div>
        ${comp.url ? `<a href="${comp.url}" target="_blank" class="comp-link">Voir l'annonce</a>` : ''}
      `;
      container.appendChild(compElement);
    });
  }

  /**
   * Affiche un message d'erreur
   * @param {string} message - Message d'erreur
   */
  showError(message) {
    const errorDiv = document.querySelector('[data-estimator="error"]');
    const form = document.querySelector('[data-estimator="form"]');
    
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
    
    if (form) {
      form.style.display = 'block';
    }
    
    // Cacher l'erreur après 5 secondes
    setTimeout(() => {
      if (errorDiv) errorDiv.style.display = 'none';
    }, 5000);
  }

  /**
   * Remet à zéro l'interface
   */
  reset() {
    const form = document.querySelector('[data-estimator="form"]');
    const results = document.querySelector('[data-estimator="results"]');
    const error = document.querySelector('[data-estimator="error"]');
    
    if (form) form.style.display = 'block';
    if (results) results.style.display = 'none';
    if (error) error.style.display = 'none';
  }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  const estimator = new AirbnbEstimator();
  
  // Gestionnaire de formulaire
  const form = document.querySelector('[data-estimator="form"]');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const params = {
        address: formData.get('address'),
        bedrooms: parseInt(formData.get('bedrooms')) || 2,
        currentPrice: parseFloat(formData.get('currentPrice')) || 0,
      };
      
      await estimator.estimateProperty(params);
    });
  }
  
  // Bouton de reset
  const resetBtn = document.querySelector('[data-estimator="reset"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      estimator.reset();
    });
  }
  
  // Exposer l'estimateur globalement pour usage externe
  window.AirbnbEstimator = estimator;
});

// Export pour utilisation en module (optionnel)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AirbnbEstimator;
}