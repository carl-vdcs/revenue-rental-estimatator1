import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="loader-overlay" aria-label="Calcul en cours…" role="status">
      <div className="loader-spinner"></div>
       <span className="ml-3 text-muted-foreground">Calcul en cours…</span>
    </div>
  );
};

export default Loader;
