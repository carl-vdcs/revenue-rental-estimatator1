/* src/components/SimilarListings.tsx */
'use client';

import { Badge } from '@/components/ui/badge';
import type { ComparableListing } from '@/services/vdc-solutions';

interface Props {
  listings: ComparableListing[];
}

export default function SimilarListings({ listings }: Props) {
  // Debug pour voir les données reçues
  console.log('SimilarListings - données reçues:', listings);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary">
        Listings similaires dans votre secteur ({listings.length} trouvés)
      </h3>
      
      {/* Debug info temporaire */}
      {listings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-xs text-blue-800">
            🔧 <strong>Debug :</strong> {listings.length} comparables trouvés. 
            Premier listing : {JSON.stringify(listings[0], null, 2).substring(0, 100)}...
          </p>
        </div>
      )}
      
      {/* Disclaimer occupation */}
      {listings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
          <p className="text-xs text-amber-800">
            ⚠️ <strong>Note :</strong> Les taux d'occupation affichés sont des estimations préliminaires. 
            Nous travaillons sur des calculs plus précis basés sur les données de marché.
          </p>
        </div>
      )}

      {listings.map((l, i) => (
        <div key={i} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
          {/* Header avec nom et lien */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="font-semibold text-sm leading-snug flex-1 line-clamp-2">
              {l.name || `Logement ${i + 1}`}
            </h4>
            {l.url ? (
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex-shrink-0 text-xs bg-blue-50 px-2 py-1 rounded"
                title="Voir sur Airbnb"
              >
                🔗 Voir sur Airbnb
              </a>
            ) : (
              <span className="text-gray-400 text-xs">Lien non disponible</span>
            )}
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm">
                <span className="font-semibold">
                  {l.adr ? `${l.adr}€` : 'Prix non disponible'}
                </span>
                <span className="text-muted-foreground">/nuit</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">👥</span>
              <span className="text-sm">
                <span className="font-semibold">
                  {l.occ ? `${l.occ}%` : '60%'}
                </span>
                <span className="text-muted-foreground"> occupé*</span>
              </span>
            </div>
          </div>

          {/* Distance et source */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-blue-500">📍</span>
              <span className="text-xs text-muted-foreground">
                {l.dist ? `${l.dist.toFixed(1).replace('.', ',')} km` : '~5 km'}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {l.src || 'Airbnb'}
            </Badge>
          </div>

          {/* Équipements (si disponibles) */}
          {l.amenities && l.amenities.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                🏠 Équipements principaux
              </span>
              <div className="flex flex-wrap gap-1">
                {l.amenities.slice(0, 4).map((amenity, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs py-0.5 px-2"
                  >
                    {amenity}
                  </Badge>
                ))}
                {l.amenities.length > 4 && (
                  <Badge variant="outline" className="text-xs py-0.5 px-2">
                    +{l.amenities.length - 4} autres
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

              {!listings.length && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-4xl mb-2">🏠</p>
            <p className="text-sm">Aucun comparable disponible dans cette zone.</p>
          </div>
        )}
    </div>
  );
}
