'use client';

import { useEffect, useMemo } from 'react';
import type { EstimateResult, EstimateParams } from '@/services/vdc-solutions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2 } from 'lucide-react';
import SimilarListings from './SimilarListings';

const fmt = (v:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v).replace(/\s/g,'\u00A0');

interface Props { results: EstimateResult; params: EstimateParams }

export default function ResultsCard({ results, params }: Props) {
  /* champs renvoyés par n8n */
  const { medianPrice, p75Price, annualRevenue, seasonality, comps } = results;
  const { currentPrice } = params;

  const hi  = Math.max(...seasonality);
  const low = Math.min(...seasonality);

  const diffPct = useMemo(()=>{
    if(!currentPrice) return 0;
    return Math.round(((currentPrice - medianPrice)/medianPrice)*100);
  },[currentPrice, medianPrice]);

  useEffect(()=>{
    window.parent.postMessage(
      { type:'resizeEstimator', height: document.body.scrollHeight },
      '*'
    );
  },[results]);

  return (
    <Card className="w-full max-w-lg mx-auto my-6 overflow-hidden border shadow-lg">
      <CardHeader className="bg-muted/50 p-4 border-b">
        <CardTitle className="text-xl font-bold">Vos revenus potentiels</CardTitle>
        <CardDescription className="text-sm">Données réelles Airbnb (rayon&nbsp;5&nbsp;km)</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {/* LISTINGS similaires */}
        <div className="p-4 border-b">
          <SimilarListings listings={comps} medianPrice={medianPrice} />
        </div>

        {/* KPIs */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b">
          <div className="p-3 border rounded bg-card">
            <p className="text-xs text-muted-foreground">CA estimé annuel</p>
            <p className="text-2xl font-black">{fmt(annualRevenue)}</p>
          </div>
          <div className="p-3 border rounded bg-card">
            <p className="text-xs text-muted-foreground">Haute saison €/nuit</p>
            <p className="text-2xl font-black">{fmt(hi)}</p>
          </div>
          <div className="p-3 border rounded bg-card">
            <p className="text-xs text-muted-foreground">Basse saison €/nuit</p>
            <p className="text-2xl font-black">{fmt(low)}</p>
          </div>
          <div className="p-3 border rounded bg-card sm:col-span-2">
            <p className="text-xs text-muted-foreground">Prix médian comparable</p>
            <p className="text-2xl font-black">{fmt(medianPrice)}</p>
          </div>
        </div>

        {/* Position tarif actuel */}
        {currentPrice ? (
          <div className="p-4 text-center space-y-2 border-b">
            <h3 className="text-lg font-semibold">Votre tarif actuel</h3>
            <p className="text-lg font-bold">{fmt(currentPrice)} / nuit</p>
            <Badge variant={diffPct>0?'destructive':'default'}>
              {diffPct===0
                ? 'dans la médiane'
                : diffPct>0
                  ? `${diffPct}% au-dessus`
                  : `${Math.abs(diffPct)}% en-dessous`}
            </Badge>
          </div>
        ):null}

        {/* Recommandations */}
        <div className="p-4 space-y-3 border-b">
          <h3 className="text-lg font-semibold">Actions recommandées</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Ajustez vos tarifs selon la saison.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Mettez en avant vos atouts uniques.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Proposez des promos en période creuse.</li>
          </ul>
        </div>

        {/* CTA PDF */}
        <div className="p-4 sticky bottom-0 bg-background/95 backdrop-blur-sm border-t">
          <Button variant="secondary" className="w-full" onClick={()=>alert('PDF bientôt')}>
            <Download className="h-4 w-4 mr-2" /> Recevoir mon rapport détaillé
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
