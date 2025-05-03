// src/components/SimilarListings.tsx
import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for similar listings with distance
const mockListings = [
  {
    id: 1,
    name: 'Villa Paradis Vert au Soleil Levant avec vue imprenable', // Longer name example
    source: 'Airbnb',
    imageUrl: 'https://picsum.photos/seed/villa1/100/80',
    imageHint: 'tropical villa',
    avgPrice: 135,
    lowSeasonPrice: 110,
    highSeasonPrice: 160,
    occupancy: 75, // Percentage
    distance: 1.2, // km
  },
  {
    id: 2,
    name: 'Bungalow Les Flots Bleus',
    source: 'Booking.com',
    imageUrl: 'https://picsum.photos/seed/bungalow1/100/80',
    imageHint: 'beach bungalow',
    avgPrice: 95,
    lowSeasonPrice: 75,
    highSeasonPrice: 120,
    occupancy: 68,
    distance: 2.5, // km
  },
  {
    id: 3,
    name: 'Appartement Vue Mer Caraïbes',
    source: 'Airbnb',
    imageUrl: 'https://picsum.photos/seed/apt1/100/80',
    imageHint: 'ocean view apartment',
    avgPrice: 115,
    lowSeasonPrice: 90,
    highSeasonPrice: 140,
    occupancy: 72,
    distance: 0.8, // km
  },
    {
    id: 4,
    name: 'Studio Cosy Centre Ville',
    source: 'Abritel', // Example different source
    imageUrl: 'https://picsum.photos/seed/studio1/100/80',
    imageHint: 'city studio',
    avgPrice: 80,
    lowSeasonPrice: 65,
    highSeasonPrice: 95,
    occupancy: 80,
    distance: 3.1, // km
  },
];

const FALLBACK_IMG = "https://source.unsplash.com/96x64/?house";

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value).replace(/\s/g, '\u00A0');
};

const getSourceBadgeVariant = (source: string): 'secondary' | 'default' | 'destructive' | 'outline' => {
  switch (source.toLowerCase()) {
    case 'airbnb':
      return 'destructive'; // Using destructive for Airbnb
    case 'booking.com':
      return 'default'; // Using default (primary) for Booking
    case 'abritel':
      return 'secondary'; // Using secondary for Abritel
    default:
      return 'outline'; // Using outline for others
  }
}

// Helper function to format distance
const formatDistance = (distance: number): string => {
    return `${distance.toFixed(1).replace('.', ',')} km`;
}

const SimilarListings: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary">Listings similaires dans votre secteur</h3>
      {mockListings.map((listing, index) => (
        <Card
            key={listing.id}
            // Add border-bottom, remove on last item
            className={`flex items-start space-x-4 p-3 border-border bg-card shadow-sm ${index < mockListings.length - 1 ? 'border-b' : ''}`}
        >
          <div className="flex-shrink-0">
            <Image
              src={listing.imageUrl || FALLBACK_IMG}
              alt={`Image de ${listing.name}`}
              width={96}
              height={64}
              className="rounded object-cover object-center shrink-0 aspect-[3/2] bg-gray-100"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              data-ai-hint={listing.imageHint}
            />
          </div>
          <div className="flex-grow overflow-hidden"> {/* Added overflow-hidden */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{listing.name}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0 sm:ml-4 text-xs text-right sm:text-left">
                <span>Prix moy.: {formatCurrency(listing.avgPrice)}</span>
                <span>Remplissage: {listing.occupancy}%</span>
                <span>Distance: {formatDistance(listing.distance)}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground mt-2">
        BS : Basse Saison, HS : Haute Saison. Les prix sont indicatifs.
      </p>
    </div>
  );
};

export default SimilarListings;
