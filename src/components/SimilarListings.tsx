/* src/components/SimilarListings.tsx */
'use client';

import Image from 'next/image';

/** type minimal pour un listing */
export interface Listing {
  name: string;
  adr?: number; // Made optional - individual price if available
  occ: number;
  dist: number;
  src: string;
  img: string;
}

interface Props {
  listings: Listing[];
  medianPrice?: number; // Optional fallback price from global data
}

export default function SimilarListings({ listings, medianPrice }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary">
        Listings similaires dans votre secteur
      </h3>

      {listings.map((l, i) => (
        <div key={i} className="flex items-start gap-3 p-3 border rounded bg-card">
          <Image
            src={l.img}
            alt={l.name}
            width={96}
            height={64}
            className="rounded object-cover object-center shrink-0"
            unoptimized
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="flex-1 min-w-0 font-semibold text-sm leading-snug line-clamp-2">
              {l.name}
            </span>
            <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-x-3">
              <span>
                {l.adr 
                  ? `${l.adr} €/nuit` 
                  : medianPrice 
                    ? `≈${medianPrice} €/nuit*` 
                    : 'Prix non disponible/nuit'
                }
              </span>
              <span>{l.occ}% occupé</span>
              <span>~{l.dist} km</span>
            </div>
          </div>
        </div>
      ))}

      {!listings.length && (
        <p className="text-sm text-muted-foreground">Aucun comparable disponible.</p>
      )}
      
      {medianPrice && !listings.some(l => l.adr) && (
        <p className="text-xs text-muted-foreground italic">
          *Prix estimé basé sur la médiane locale
        </p>
      )}
    </div>
  );
}
