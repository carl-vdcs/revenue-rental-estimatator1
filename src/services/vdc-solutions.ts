/**
 * Represents the parameters for estimating a property's value.
 */
export interface EstimateParams {
  /**
   * The Airbnb URL of the property.
   * Mutually exclusive with address and bedrooms.
   */
  airbnbUrl?: string;
  /**
   * The address of the property. Required if airbnbUrl is not provided.
   */
  address?: string;
  /**
   * The number of bedrooms in the property. Required if airbnbUrl is not provided.
   */
  bedrooms?: number;
  /**
   * The current price per night of the property.
   */
  currentPrice: number;
}

/**
 * Response format from Cloudflare API
 */
interface CloudflareApiResponse {
  address: string;
  adults: number;
  medianPrice: number;
  p75Price: number;
  annualRevenue: number;
  comps: Array<{
    name: string;
    adr: number;
    occ: number;
    dist: number;
    src: string;
    amenities: string[];
    url: string;
  }>;
}

/**
 * Represents the estimation results for a property.
 */
export interface EstimateResult {
  seasonality: number[];
  comps: any[];
  /**
   * The median price per night of comparable properties.
   */
  medianPrice: number;
  /**
   * The 75th percentile price per night of comparable properties.
   */
  p75Price: number;
  /**
   * The estimated annual revenue of the property.
   */
  annualRevenue: number;
   /**
   * The estimated average nightly rate during high season.
   */
  highSeasonAverage?: number;
   /**
   * The estimated average nightly rate during low season.
   */
  lowSeasonAverage?: number;
  /**
   * The latitude of the property.
   */
  latitude: number;
  /**
   * The longitude of the property.
   */
  longitude: number;
}

/**
 * Asynchronously estimates the value and revenue of a property by calling the Cloudflare API.
 *
 * @param params The parameters used for estimation.
 * @returns A promise that resolves to an EstimateResult object, or null if no comparable properties are found.
 */
export async function estimateProperty(params: EstimateParams): Promise<EstimateResult | null> {
  console.log('Calling estimateProperty with params:', params);

  try {
    // Construire l'URL de l'API Cloudflare
    const apiUrl = new URL('https://estimate-api.carl-659.workers.dev/estimate');
    
    // Ajouter les paramètres requis
    if (params.address) {
      apiUrl.searchParams.set('address', params.address);
    } else {
      throw new Error('Address is required');
    }
    
    // Convertir bedrooms en adults pour l'API (estimation approximative)
    const adults = params.bedrooms ? Math.max(2, params.bedrooms * 2) : 2;
    apiUrl.searchParams.set('adults', adults.toString());

    console.log('Calling Cloudflare API:', apiUrl.toString());

    // Appel à l'API Cloudflare
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: CloudflareApiResponse = await response.json();

    // Vérifier qu'il y a des comparables
    if (!data.comps || data.comps.length === 0) {
      console.log('No comparable properties found');
      return null;
    }

    // Transformer les données pour correspondre au format attendu
    const result: EstimateResult = {
      medianPrice: data.medianPrice,
      p75Price: data.p75Price,
      annualRevenue: data.annualRevenue,
      comps: data.comps.map(comp => ({
        ...comp,
        // Mapper les champs si nécessaire pour la compatibilité
        price: comp.adr,
        occupancy: comp.occ,
        distance: comp.dist,
        source: comp.src,
      })),
      // Générer des données de saisonnalité basées sur les prix des comparables
      seasonality: generateSeasonalityData(data.medianPrice, data.p75Price),
      // Estimer les coordonnées par défaut (Martinique)
      latitude: 14.641528,
      longitude: -61.024174,
      // Calculer les moyennes saisonnières
      highSeasonAverage: Math.round(data.p75Price * 1.1),
      lowSeasonAverage: Math.round(data.medianPrice * 0.8),
    };

    console.log('API call successful, returning result:', result);
    return result;

  } catch (error) {
    console.error('Error calling Cloudflare API:', error);
    throw error;
  }
}

/**
 * Génère des données de saisonnalité simulées basées sur les prix médians et P75
 */
function generateSeasonalityData(medianPrice: number, p75Price: number): number[] {
  // Simulation de 12 mois de données saisonnières
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
