'use client';

import { useEffect, useState } from 'react';

/**
 * State persistant dans sessionStorage (ou localStorage si tu préfères).
 */
export function useSessionState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {/* quota exceeded */}
  }, [key, state]);

  return [state, setState] as const;
}
