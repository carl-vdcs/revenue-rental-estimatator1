'use client';

import { useState } from 'react';
import EstimatorForm from '@/components/EstimatorForm';
import ResultsCard from '@/components/ResultsCard';
import type { EstimateParams, EstimateResult } from '@/services/vdc-solutions';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/Loader';

export default function Home() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EstimateResult | null>(null);
  const [params, setParams]   = useState<EstimateParams | null>(null);

  const handleSubmit = async (
    v: Omit<EstimateParams, 'currentPrice'> & { currentPrice?: number },
  ) => {
    setLoading(true);
    setResults(null);

    const p: EstimateParams = { ...v, currentPrice: v.currentPrice ?? 0 };
    setParams(p);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE!;
      const qs   = new URLSearchParams({
        address  : p.address  ?? '',
        bedrooms : p.bedrooms ? String(p.bedrooms) : '',
        price    : p.currentPrice ? String(p.currentPrice) : '',
      });
      const res  = await fetch(`${base}/estimate?${qs}`, { cache:'no-store' });
      if (!res.ok) throw new Error(`API ${res.status}`);

      const json: EstimateResult = await res.json();
      if (!json.comps?.length) {
        toast({ title:'Pas de comparables', variant:'destructive' });
      } else {
        setResults(json);
      }
    } catch (e:any) {
      toast({ title:'Erreur API', description:e.message, variant:'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen">
      {!results && !loading && (
        <EstimatorForm onSubmit={handleSubmit} isLoading={loading} />
      )}
      {loading && <Loader />}
      {results && !loading && params && (
        <ResultsCard results={results} params={params} />
      )}
    </main>
  );
}
