// src/components/IframeResizer.tsx
"use client";

import { useEffect } from "react";

export default function IframeResizer() {
  useEffect(() => {
    const sendHeight = () =>
      window.parent.postMessage(
        { type: "resizeEstimator", height: document.body.scrollHeight },
        "*"
      );

    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    window.addEventListener("load", sendHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", sendHeight);
    };
  }, []);

  return null; // rien à afficher à l'écran
}
