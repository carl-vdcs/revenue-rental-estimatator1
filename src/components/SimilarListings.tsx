/* src/components/SimilarListings.tsx */
'use client';

import { Badge } from '@/components/ui/badge';
import type { ComparableListing } from '@/services/vdc-solutions';

interface Props {
  listings: ComparableListing[];
  medianPrice?: number; // Optional fallback price from global data
}

export default function SimilarListings({ listings, medianPrice }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary">
        Listings similaires dans votre secteur
      </h3>

      {listings.map((l, i) => (
        <div key={i} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
          {/* Header avec nom et lien */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="font-semibold text-sm leading-snug flex-1 line-clamp-2">
              {l.name}
            </h4>
            {l.url && (
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex-shrink-0 text-xs"
                title="Voir sur Airbnb"
              >
                🔗 Voir
              </a>
            )}
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm">
                <span className="font-semibold">
                  {l.adr 
                    ? `${l.adr}€` 
                    : medianPrice 
                      ? `≈${medianPrice}€*` 
                      : 'Prix non disponible'
                  }
                </span>
                <span className="text-muted-foreground">/nuit</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">👥</span>
              <span className="text-sm">
                <span className="font-semibold">{l.occ}%</span>
                <span className="text-muted-foreground"> occupé</span>
              </span>
            </div>
          </div>

          {/* Distance et source */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-blue-500">📍</span>
              <span className="text-xs text-muted-foreground">
                {l.dist.toFixed(1).replace('.', ',')} km
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {l.src}
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

<<<<<<< HEAD
              {!listings.length && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-4xl mb-2">🏠</p>
            <p className="text-sm">Aucun comparable disponible dans cette zone.</p>
          </div>
        )}
=======
      {!listings.length && (
        <p className="text-sm text-muted-foreground">Aucun comparable disponible.</p>
      )}
      
      {medianPrice && !listings.some(l => l.adr) && (
        <p className="text-xs text-muted-foreground italic">
          *Prix estimé basé sur la médiane locale
        </p>
      )}
>>>>>>> origin/cursor/debug-backend-price-retrieval-for-saint-luce-d677
    </div>
  );
}
