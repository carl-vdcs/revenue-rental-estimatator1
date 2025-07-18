'use client';

import { useState } from 'react';
import { useSessionState } from '@/hooks/useSessionState';
import EstimatorForm from '@/components/EstimatorForm';
import ResultsCard from '@/components/ResultsCard';
import type { EstimateParams, EstimateResult } from '@/services/vdc-solutions';
import { estimateProperty } from '@/services/vdc-solutions';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/Loader';

export default function Home() {
  const { toast } = useToast();
  const [loading, setLoading]  = useState(false);
  const [results, setResults]  = useSessionState<EstimateResult | null>('estim-result', null);
  const [params,  setParams]   = useSessionState<EstimateParams  | null>('estim-params', null);

  const clearAllData = () => {
    // Vider sessionStorage
    sessionStorage.clear();
    // Réinitialiser les états
    setResults(null);
    setParams(null);
    // Feedback utilisateur
    toast({ 
      title: '✅ Données effacées', 
      description: 'SessionStorage vidé, vous pouvez refaire un test.' 
    });
  };

  const handleSubmit = async (
    v: Omit<EstimateParams, 'currentPrice'> & { currentPrice?: number },
  ) => {
    setLoading(true);
    setResults(null);

    const p: EstimateParams = { ...v, currentPrice: v.currentPrice ?? 0 };
    setParams(p);

    try {
      // Appel direct au service qui utilise maintenant l'API Cloudflare
      const result = await estimateProperty(p);
      
      if (!result || !result.comps?.length) {
        toast({ 
          title: 'Pas de comparables', 
          description: 'Aucune propriété comparable trouvée dans cette zone.',
          variant: 'destructive' 
        });
      } else {
        setResults(result);
        toast({
          title: 'Estimation réussie',
          description: `${result.comps.length} propriétés comparables trouvées.`,
        });
      }
    } catch (error: any) {
      console.error('Estimation error:', error);
      toast({ 
        title: 'Erreur d\'estimation', 
        description: error.message || 'Une erreur est survenue lors de l\'estimation.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen relative">
      {!results && !loading && (
        <EstimatorForm onSubmit={handleSubmit} isLoading={loading} />
      )}
      {loading && <Loader />}
      {results && !loading && params && (
        <ResultsCard results={results} params={params} />
      )}
      
      {/* Bouton clear data - Position fixe en bas à droite */}
      <button
        onClick={clearAllData}
        className="fixed bottom-4 right-4 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-full shadow-lg transition-colors text-xs font-medium border border-red-200"
        title="Vider les données en cache pour retester"
      >
        🗑️ Clear Cache
      </button>
    </main>
  );
}
