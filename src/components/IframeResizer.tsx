// src/components/IframeResizer.tsx
"use client";

import { useEffect } from "react";

export default function IframeResizer() {
  useEffect(() => {
    const sendHeight = () => {
      window.parent.postMessage(
        { type: "resizeEstimator", height: document.body.scrollHeight },
        "*"
      );
    };

    // envoie initial
    sendHeight();

    // observe toute mutation de taille
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  return null; // rien à afficher à l'écran
}
