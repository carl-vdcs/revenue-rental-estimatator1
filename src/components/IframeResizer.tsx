// src/components/IframeResizer.tsx
"use client";

import { useEffect } from "react";

export default function IframeResizer() {
  useEffect(() => {
    const handleResize = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'resizeEstimator', height, background: 'transparent' }, '*');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return null; // rien à afficher à l'écran
}
