// src/components/EstimatorForm.tsx
'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { EstimateParams } from '@/services/vdc-solutions'; // Keep type

// Validation Schema - Made currentPrice optional
const formSchema = z.object({
  airbnbUrl: z.string().url({ message: "Veuillez entrer une URL Airbnb valide." }).optional().or(z.literal('')),
  address: z.string().optional(),
  bedrooms: z.coerce.number().int().positive({ message: "Le nombre de chambres doit être positif." }).optional(),
  currentPrice: z.coerce.number().positive({ message: "Le tarif actuel doit être positif." }).optional(), // Made optional
}).refine(data => !!data.airbnbUrl || (!!data.address && !!data.bedrooms), {
  message: "⚠️ Merci de compléter les champs obligatoires.",
  path: ["airbnbUrl"], // Attach error message to airbnbUrl field visually, though it applies globally
});


type EstimatorFormValues = z.infer<typeof formSchema>;

interface EstimatorFormProps {
  // Use form values type directly, currentPrice is optional here
  onSubmit: (data: Omit<EstimateParams, 'currentPrice'> & { currentPrice?: number }) => void;
  isLoading: boolean; // Re-introduce isLoading prop
}

const EstimatorForm: React.FC<EstimatorFormProps> = ({ onSubmit, isLoading }) => { // Add isLoading back
  const form = useForm<EstimatorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      airbnbUrl: '',
      address: '',
      bedrooms: undefined,
      currentPrice: undefined, // Default remains undefined
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const watchAirbnbUrl = form.watch('airbnbUrl');
  const watchAddress = form.watch('address');
  const watchBedrooms = form.watch('bedrooms');

  const isAirbnbMode = !!watchAirbnbUrl;
  const isAddressMode = !!watchAddress || !!watchBedrooms;

  // Simplified submit handler - just calls the passed onSubmit
  const handleFormSubmit: SubmitHandler<EstimatorFormValues> = (data) => {
      onSubmit(data);
  };

  return (
     <div className="max-w-lg mx-auto bg-card rounded-lg shadow-md border border-border p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">

            <h2 className="text-2xl font-bold text-center mb-6 text-card-foreground">Estimer votre bien</h2>


            <FormField
              control={form.control}
              name="airbnbUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien de votre annonce Airbnb (facultatif)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.airbnb.fr/rooms/..."
                      {...field}
                      disabled={isAddressMode || isLoading} // Disable if address mode OR loading
                      aria-invalid={form.formState.errors.airbnbUrl ? "true" : "false"}
                      />
                  </FormControl>
                  <FormDescription>
                    Nous l'utilisons uniquement pour pré-remplir les infos du logement.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-xs text-muted-foreground font-semibold">OU</span>
              <div className="flex-grow border-t border-border"></div>
            </div>


            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse du logement (si vous n’avez pas de lien)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12 Rue de la Plage, Fort-de-France"
                      {...field}
                      disabled={isAirbnbMode || isLoading} // Disable if Airbnb mode OR loading
                      aria-invalid={form.formState.errors.address ? "true" : "false"}
                      />
                  </FormControl>
                   <FormDescription>
                     Ville ou quartier suffisent.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de chambres</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2"
                      min="1"
                      {...field}
                       // Handle potential null/undefined value from optional field
                       value={field.value ?? ''}
                       // Ensure value passed to onChange is number or undefined
                       onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)}
                      disabled={isAirbnbMode || isLoading} // Disable if Airbnb mode OR loading
                       aria-invalid={form.formState.errors.bedrooms ? "true" : "false"}
                     />
                  </FormControl>
                   <FormDescription>
                     Studio = 1 chambre.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <div className="border-t border-border my-4"></div>


            <FormField
              control={form.control}
              name="currentPrice"
              render={({ field }) => (
                <FormItem>
                  {/* Label updated */}
                  <FormLabel>Votre tarif actuel (€ / nuit) <span className="text-muted-foreground">(facultatif)</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="120" // Updated placeholder
                      min="1"
                      {...field}
                       value={field.value ?? ''} // Handle potential null/undefined value
                       // Ensure value passed to onChange is number or undefined
                       onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)}
                      disabled={isLoading} // Disable only when loading
                       aria-invalid={form.formState.errors.currentPrice ? "true" : "false"}
                      />
                  </FormControl>
                  <FormDescription>
                    Indiquez le prix que vous pratiquez aujourd’hui. {/* Updated help text */}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Display the global error message from refine */}
             {form.formState.errors.airbnbUrl?.message && !form.formState.errors.address && !form.formState.errors.bedrooms && (
                 <p className="text-sm font-medium text-destructive">{form.formState.errors.airbnbUrl.message}</p>
             )}

            <Button
              type="submit"
              variant="primary"
              className="w-full md:w-52 mt-4" // Adjusted width for desktop
              // Disable if form is invalid OR loading
              disabled={!form.formState.isValid || isLoading}
              aria-live="polite"
              aria-busy={isLoading} // Add aria-busy
              >
              {isLoading ? 'Calcul en cours...' : 'Simuler mes revenus'} {/* Update button text */}
            </Button>
          </form>
        </Form>
     </div>
  );
};

export default EstimatorForm;
