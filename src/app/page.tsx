'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import EstimatorForm from '@/components/EstimatorForm';
import type { EstimateParams, EstimateResult } from '@/services/vdc-solutions';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/Loader';

/* ------------- Lazy-load ResultsCard (no SSR) ------------------ */
const ResultsCard = dynamic(() => import('@/components/ResultsCard'), {
  ssr: false,
  loading: () => <Loader />,
});

/* ------------- Helper pour construire la query ----------------- */
const buildQuery = (p: EstimateParams) =>
  new URLSearchParams({
    address: p.address ?? '',
    bedrooms: p.bedrooms ? String(p.bedrooms) : '',
    price: p.currentPrice ? String(p.currentPrice) : '',
  }).toString();

/* ------------- Main Page Component ----------------------------- */
export default function Home() {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<EstimateResult | null>(null);
  const [estimateParams, setEstimateParams] = useState<EstimateParams | null>(
    null,
  );

  /* --------- handleSubmit déclenché par EstimatorForm ---------- */
  const handleSubmit = async (
    data: Omit<EstimateParams, 'currentPrice'> & { currentPrice?: number },
  ) => {
    setIsLoading(true);
    setResults(null);

    // stocke les paramètres (le champ currentPrice est optionnel)
    const params: EstimateParams = {
      ...data,
      currentPrice: data.currentPrice ?? 0,
    };
    setEstimateParams(params);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE;
      if (!base) throw new Error('NEXT_PUBLIC_API_BASE non défini');

      const res = await fetch(`${base}/estimate?` + buildQuery(params), {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`API ${res.status}`);

      const json: EstimateResult = await res.json();

      // Vérifie qu'il y a bien des comparables
      if (!json.comps || json.comps.length === 0) {
        toast({
          title: 'Pas de comparables',
          description:
            'Pas assez d’annonces à moins de 5 km. Essayez une autre adresse.',
          variant: 'destructive',
        });
      } else {
        setResults(json);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Erreur API',
        description:
          err.message ?? 'Impossible de récupérer les données pour le moment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen">
      {!results && !isLoading && (
        <EstimatorForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}

      {isLoading && <Loader />}

      {results && !isLoading && estimateParams && (
        <ResultsCard results={results} params={estimateParams} />
      )}
    </main>
  );
}
