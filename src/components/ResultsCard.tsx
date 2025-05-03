// src/components/ResultsCard.tsx
'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import type { EstimateResult, EstimateParams } from '@/services/vdc-solutions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimilarListings from './SimilarListings'; // Import the new component

// Conditional imports for Leaflet only on the client-side (Commented out for now)
/*
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
*/

/*
let L: any = null; // To hold Leaflet instance

if (typeof window !== 'undefined') {
  // Import Leaflet only on the client
  import('leaflet').then(leaflet => {
    L = leaflet;
    // Fix for default icon issue with Webpack
    if (L && L.Icon?.Default?.prototype) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }
  }).catch(error => {
    console.error("Error loading Leaflet:", error);
  });
}
*/


// Helper function to format currency
const formatCurrency = (value: number): string => {
  // Ensure value is a number, default to 0 if not
  const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numValue).replace(/\s/g, '\u00A0'); // Non-breaking space
};

interface ResultsCardProps {
  results: EstimateResult;
  params: EstimateParams;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ results, params }) => {
  const [isClient, setIsClient] = useState(false);
  // const mapContainerRef = useRef<HTMLDivElement>(null); // Ref for map container
  // const mapInstanceRef = useRef<any>(null); // Ref for map instance

  useEffect(() => {
    setIsClient(true); // Set client flag on mount
    // Cleanup logic removed as map is disabled
    /*
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          console.log("Map instance removed.");
        } catch (e) {
          console.error("Error removing map instance:", e);
        }
      }
       // Force clear the container content if map wasn't removed cleanly
       if (mapContainerRef.current) {
           mapContainerRef.current.innerHTML = '<div class="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">Carte désactivée</div>'; // Placeholder
       }
    };
    */
  }, []);

  useEffect(() => {
    window.parent.postMessage(
      { type: "resizeEstimator", height: document.body.scrollHeight },
      "*"
    );
  }, [results]);

  const { medianPrice, p75Price, annualRevenue, highSeasonAverage, lowSeasonAverage, latitude, longitude } = results;
  const { currentPrice } = params;
  const position: [number, number] = [latitude, longitude]; // Keep position logic even if map is disabled

  const priceDifferencePercentage = useMemo(() => {
      const effectiveCurrentPrice = currentPrice ?? 0;
      if (!medianPrice || medianPrice === 0 || effectiveCurrentPrice <= 0) return 0; // Handle zero median or no current price
      return Math.round(((effectiveCurrentPrice - medianPrice) / medianPrice) * 100);
  }, [currentPrice, medianPrice]);

  const pricePositionText = useMemo(() => {
      if (currentPrice === undefined || currentPrice === null || currentPrice <= 0) {
          return "indisponible (tarif actuel non fourni)";
      }
      const diff = priceDifferencePercentage;
      if (diff === 0) {
          return "dans la médiane locale";
      } else if (diff > 0) {
          return `${diff}% au-dessus de la médiane locale`;
      } else {
          return `${Math.abs(diff)}% en-dessous de la médiane locale`;
      }
  }, [currentPrice, priceDifferencePercentage]); // Removed medianPrice dependency as it's included via priceDifferencePercentage

  const handleDownloadReport = () => {
    alert("La fonctionnalité de rapport PDF par e-mail n'est pas encore implémentée.");
  };


  return (
    <Card className="w-full max-w-lg mx-auto my-6 overflow-hidden shadow-lg rounded-sm border border-border">
       {/* Subtitle contrast adjusted via text-muted-foreground */}
       <CardHeader className="bg-muted/50 p-4 border-b border-border">
         <CardTitle className="text-xl font-bold text-primary">Vos revenus potentiels</CardTitle>
         {/* Disclaimer updated and contrast adjusted */}
         <CardDescription className="text-sm text-muted-foreground">
            Basé sur les prix et taux d'occupation réels.<br/>
            Aucune estimation de valeur immobilière.
         </CardDescription>
       </CardHeader>
       <CardContent className="p-0 relative"> {/* Add relative for sticky positioning context */}
         <Tabs defaultValue="listings" className="w-full">
            {/* Active tab styling updated in ui/tabs.tsx */}
           <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border">
             <TabsTrigger value="listings">Listings similaires</TabsTrigger>
             <TabsTrigger value="map">Carte & Quartier</TabsTrigger>
           </TabsList>

           {/* Tab 1: Similar Listings */}
           <TabsContent value="listings" className="p-4 md:p-6 space-y-6 mt-0 border-b border-border">
             <SimilarListings />
           </TabsContent>

           {/* Tab 2: Map (Disabled) */}
           <TabsContent value="map" className="p-4 md:p-6 space-y-6 mt-0 border-b border-border">
                {/* Map Container Ref removed */}
                <div className="h-[400px] w-full rounded-sm overflow-hidden border border-border flex items-center justify-center bg-muted text-muted-foreground">
                   {/* Map component rendering commented out */}
                   {/* {isClient && MapContainer && TileLayer && Marker && Circle ? (
                      <MapContainer
                         center={position}
                         zoom={11}
                         scrollWheelZoom={false}
                         style={{ height: '100%', width: '100%' }}
                         whenCreated={(map: any) => {
                           // mapInstanceRef.current = map; // Store map instance
                           console.log("Map instance created:", map);
                         }}
                      >
                         <TileLayer
                           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                         />
                         <Marker position={position}></Marker>
                         <Circle center={position} radius={5000} pathOptions={{ color: 'hsl(var(--accent))', fillColor: 'hsl(var(--accent))', fillOpacity: 0.1 }} />
                      </MapContainer>
                   ) : ( */}
                      <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">Carte désactivée temporairement</div>
                   {/* )} */}
                </div>
               {/* Neighborhood info could go here */}
               <p className="text-sm text-muted-foreground text-center">Informations sur le quartier bientôt disponibles.</p>
           </TabsContent>
         </Tabs>

         {/* Key Indicators Section - Moved below Tabs */}
         {/* Removed duplicate title */}
         <div className="p-4 md:p-6 space-y-4 border-b border-border">
              {/* Styling adjustments for grid items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {/* Added height and flex alignment */}
                 <div className="p-3 border border-border rounded-sm bg-card h-24 flex flex-col justify-center">
                     {/* Adjusted text size and color */}
                     <p className="text-xs text-muted-foreground">Revenu estimé (an)</p>
                     {/* Adjusted text size and weight */}
                     <p className="text-2xl font-black text-foreground">{formatCurrency(annualRevenue)}</p>
                 </div>
                  {/* Added height and flex alignment */}
                 <div className="p-3 border border-border rounded-sm bg-card h-24 flex flex-col justify-center">
                     <p className="text-xs text-muted-foreground">Moyenne haute saison (€/nuit)</p>
                     <p className="text-2xl font-black text-foreground">{formatCurrency(highSeasonAverage || 0)}</p>
                 </div>
                  {/* Added height and flex alignment */}
                  <div className="p-3 border border-border rounded-sm bg-card h-24 flex flex-col justify-center">
                     <p className="text-xs text-muted-foreground">Moyenne basse saison (€/nuit)</p>
                     <p className="text-2xl font-black text-foreground">{formatCurrency(lowSeasonAverage || 0)}</p>
                 </div>
                  {/* Added height and flex alignment, kept span 2 */}
                 <div className="p-3 border border-border rounded-sm bg-card sm:col-span-2 h-24 flex flex-col justify-center">
                     <p className="text-xs text-muted-foreground">Prix médian comparable (€/nuit)</p>
                     <p className="text-2xl font-black text-foreground">{formatCurrency(medianPrice)}</p>
                 </div>
              </div>
          </div>

          {/* Current Price Positioning - Moved below Indicators */}
          {(currentPrice !== undefined && currentPrice !== null && currentPrice > 0) && (
               <div className="p-4 md:p-6 text-center space-y-2 border-b border-border">
                   <h3 className="text-lg font-semibold text-secondary">Positionnement de votre tarif actuel</h3>
                   <p className="text-lg font-bold text-foreground">{formatCurrency(currentPrice)} / nuit</p>
                   <Badge
                       variant={priceDifferencePercentage >= 0 ? 'destructive' : 'default'} // Treat 0 as neutral/destructive for now
                       className={`text-sm font-semibold px-3 py-1 ${priceDifferencePercentage < 0 ? 'bg-custom-success text-white' : ''} ${priceDifferencePercentage === 0 ? 'bg-secondary text-secondary-foreground' : ''}`}
                   >
                        {/* Badge text updated */}
                       Votre tarif est {pricePositionText}
                   </Badge>
               </div>
           )}

          {/* Recommended Actions - Moved below Positioning */}
          <div className="p-4 md:p-6 space-y-3 border-b border-border">
              <h3 className="text-lg font-semibold text-secondary">Actions recommandées</h3>
              {/* Using ul without list-disc for custom icons */}
              <ul className="text-sm text-muted-foreground space-y-1">
                  {/* Added icon and shortened text */}
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Ajustez votre tarif selon la saison.
                  </li>
                   {/* Added icon */}
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Mettez en valeur les points forts uniques de votre logement.
                  </li>
                   {/* Added icon and shortened text */}
                   <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Envisagez des promotions pour les périodes creuses.
                   </li>
              </ul>
          </div>

          {/* Download Report Button - Moved to the bottom, attempt sticky */}
          {/* Wrapper for sticky positioning */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 md:p-6 text-center border-t border-border">
               <Button
                   onClick={handleDownloadReport}
                   variant="secondary"
                   className="btn btn-secondary w-full md:w-auto" // Allow natural width on desktop
               >
                   <Download className="mr-2 h-4 w-4" />
                    {/* Button text updated */}
                   Recevoir mon rapport détaillé
               </Button>
          </div>

       </CardContent>

        {/* Autopilot CTA outside CardContent, styled */}
        <div className="bg-accent/10 py-4 px-4 md:px-6 mt-0 border-t border-border">
           <button
             className="text-sm text-primary hover:underline flex items-center gap-2 justify-center w-full"
             onClick={() => alert('Activation Auto-Pilot non implémentée')}
           >
              🚀 Prêt·e à optimiser vos tarifs ? Activez le mode Auto-Pilot 30 jours gratuits →
           </button>
         </div>

         {/* Disclaimer outside CardContent, styled */}
         <div className="p-4 text-center">
            <p className="text-xs leading-tight text-muted-foreground opacity-70 max-w-md mx-auto">
              📌 Note : Simulation indicative de revenus. Ne constitue pas un conseil financier ni une évaluation immobilière.
            </p>
         </div>
     </Card>
  );
};

export default ResultsCard;
