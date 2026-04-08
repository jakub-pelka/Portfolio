import React from 'react';

interface OutcomeBannerProps {
  statusTag?: string;
  children: React.ReactNode;
}

export function OutcomeBanner({ statusTag, children }: OutcomeBannerProps) {
  return (
    <div 
      className="relative p-12 overflow-hidden bg-[var(--color-bg-secondary)] my-32" 
      style={{ borderLeft: '12px solid var(--project-highlight)' }}
    >
      {/* Halftone backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', 
          backgroundSize: '8px 8px', 
          opacity: 0.05 
        }} 
      />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="font-ibm font-bold text-4xl mb-6 uppercase">Outcome</h2>
            <div className="text-2xl font-ibm leading-tight text-[var(--project-text)] opacity-90">
              {children}
            </div>
          </div>
          {/* Tu można wstrzykiwać metryki przez props, albo zostawić do obsługi przez dzieci */}
        </div>

        {statusTag && (
          <div className="mt-12 flex justify-start">
            <div className="inline-flex items-center gap-4 bg-[var(--project-text)] text-[var(--color-bg-light)] px-6 py-4 font-ibm font-bold text-sm uppercase">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
              {statusTag}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
