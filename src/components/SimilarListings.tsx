/* ----------------------------------------------------------------
   SimilarListings.tsx
   ---------------------------------------------------------------- */
   "use client";

   import React from "react";
   import Image from "next/image";
   import { Card, CardContent } from "@/components/ui/card";
   import { Badge } from "@/components/ui/badge";
   
   /* ---------- MOCK DATA (démo) ----------------------------------- */
   const mockListings = [
     {
       id: 1,
       name: "Villa Paradis Vert au Soleil Levant avec vue imprenable",
       source: "Airbnb",
       imageUrl: "https://picsum.photos/seed/villa1/100/80",
       imageHint: "tropical villa",
       avgPrice: 135,
       occupancy: 75,
       distance: 1.2,
     },
     {
       id: 2,
       name: "Bungalow Les Flots Bleus",
       source: "Booking.com",
       imageUrl: "https://picsum.photos/seed/bungalow1/100/80",
       imageHint: "beach bungalow",
       avgPrice: 95,
       occupancy: 68,
       distance: 2.5,
     },
     {
       id: 3,
       name: "Appartement Vue Mer Caraïbes",
       source: "Airbnb",
       imageUrl: "https://picsum.photos/seed/apt1/100/80",
       imageHint: "ocean view apartment",
       avgPrice: 115,
       occupancy: 72,
       distance: 0.8,
     },
     {
       id: 4,
       name: "Studio Cosy Centre Ville",
       source: "Abritel",
       imageUrl: "https://picsum.photos/seed/studio1/100/80",
       imageHint: "city studio",
       avgPrice: 80,
       occupancy: 80,
       distance: 3.1,
     },
   ];
   
   /* ---------- helpers ------------------------------------------- */
   const FALLBACK_IMG = "/placeholder.jpg"; // -> place 96×64 dans /public
   
   const formatCurrency = (value: number) =>
     new Intl.NumberFormat("fr-FR", {
       style: "currency",
       currency: "EUR",
       maximumFractionDigits: 0,
     })
       .format(value)
       .replace(/\s/g, "\u00A0");
   
   const formatDistance = (dist: number) =>
     `${dist.toFixed(1).replace(".", ",")} km`;
   
   const badgeVariant = (src: string): "secondary" | "destructive" | "default" => {
     switch (src.toLowerCase()) {
       case "airbnb":
         return "destructive";
       case "booking.com":
         return "default";
       case "abritel":
         return "secondary";
       default:
         return "secondary";
     }
   };
   
   /* ---------- component ----------------------------------------- */
   export default function SimilarListings() {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary">
          Listings similaires dans votre secteur
        </h3>
  
        {mockListings.map((l, idx) => (
          <Card
            key={l.id}
            className={`flex items-start gap-3 p-3 bg-card shadow-sm ${
              idx < mockListings.length - 1 ? "border-b border-border" : ""
            }`}
          >
            {/* vignette */}
            <div className="relative w-[96px] h-[64px] flex-shrink-0 overflow-hidden rounded bg-gray-100">
              <Image … />
            </div>
  
            {/* détails */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* titre + badge */}
              <div className="flex items-start gap-2">
                <span className="flex-1 min-w-0 font-semibold text-sm leading-snug line-clamp-2">
                  {l.name}
                </span>
                <Badge variant={badgeVariant(l.source)} className="shrink-0">
                  {l.source}
                </Badge>
              </div>
  
              {/* metrics */}
              <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-x-3">
                <span>Prix moy. : {formatCurrency(l.avgPrice)}</span>
                <span>Remplissage : {l.occupancy}%</span>
                <span>Distance : {formatDistance(l.distance)}</span>
              </div>
            </div>
          </Card>
        ))}
   
         <p className="text-xs text-muted-foreground">
           Données indicatives sur les 12 derniers mois.
         </p>
       </div>
     );
   }
   