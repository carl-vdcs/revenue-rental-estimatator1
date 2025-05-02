// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import EstimatorForm from '@/components/EstimatorForm';
import type { EstimateParams, EstimateResult } from '@/services/vdc-solutions'; // Import types
import { useToast } from "@/hooks/use-toast"; // Import useToast for error handling
import Loader from '@/components/Loader'; // Import Loader

// Dynamically import ResultsCard with ssr disabled as it might use client-side features
const ResultsCard = dynamic(() => import('@/components/ResultsCard'), {
  ssr: false,
  loading: () => <Loader />, // Show loader while ResultsCard is loading
});

// Mock result data for UI validation
const mockResults: EstimateResult = {
  medianPrice: 110,
  p75Price: 145,
  annualRevenue: 28500,
  highSeasonAverage: 150,
  lowSeasonAverage: 90,
  latitude: 14.641528, // Example coordinates for Martinique
  longitude: -61.024174,
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<EstimateResult | null>(null);
  const [estimateParams, setEstimateParams] = useState<EstimateParams | null>(null); // Store params for ResultsCard
  const { toast } = useToast();

  const handleFormSubmit = (data: Omit<EstimateParams, 'currentPrice'> & { currentPrice?: number }) => {
    console.log('Form submitted:', data);
    setIsLoading(true);
    setResults(null); // Clear previous results

    // Ensure currentPrice is a number, default to 0 if undefined (as it's optional now)
    const paramsWithPrice: EstimateParams = {
        ...data,
        currentPrice: data.currentPrice ?? 0, // Use 0 if undefined
    };
    setEstimateParams(paramsWithPrice); // Store params including currentPrice

    // Simulate API call delay
    setTimeout(() => {
      // Simulate "no comps" scenario for testing UI
      if (data.address && data.address.toLowerCase().includes("inconnu")) {
        setResults(null); // No results
        toast({
          title: "Erreur d'estimation",
          description: "Pas assez d'annonces comparables dans un rayon de 5 km. Essayez avec une autre adresse.",
          variant: "destructive",
        });
      }
      // Simulate API error for testing UI
      else if (data.address && data.address.toLowerCase().includes("erreur")) {
         setResults(null); // No results
         toast({
            title: "Erreur API",
            description: "Impossible de récupérer les données. Veuillez réessayer plus tard.",
            variant: "destructive",
         });
      }
      else {
        // Simulate successful API response
        setResults(mockResults);
      }
      setIsLoading(false); // Hide loader
    }, 1500); // 1.5 second delay
  };

  return (
    <main className="container mx-auto px-2 py-8 flex flex-col items-center min-h-screen">
      {/* Header Section Removed - Will be handled in Webflow */}

      {!results && !isLoading && ( // Only show form if not loading and no results yet
        <EstimatorForm
          onSubmit={handleFormSubmit}
          isLoading={isLoading} // Pass loading state
        />
      )}

      {isLoading && <Loader />}

      {results && !isLoading && estimateParams && ( // Show results only when loaded and results exist
        <>
          <ResultsCard results={results} params={estimateParams} />
          {/* Redundant Disclaimer and Autopilot CTA removed, they are inside ResultsCard now */}
        </>
      )}
    </main>
  );
}
