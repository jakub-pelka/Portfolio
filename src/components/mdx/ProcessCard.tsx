import React from 'react';

interface ProcessCardProps {
  title: string;
  type: 'INSIGHT' | 'DECISION' | 'PROBLEM';
  children: React.ReactNode;
}

export function ProcessCard({ title, type, children }: ProcessCardProps) {
  // Oparty na nowym designie, "INSIGHT" ma mocną ramkę (np. highlight/primary), DECISION np. szarą/surface-variant
  const isInsight = type === 'INSIGHT';
  const borderColorValue = isInsight ? 'var(--project-highlight)' : 'var(--color-border)';
  const labelBgValue = isInsight ? 'var(--project-highlight)' : 'var(--color-bg-secondary)';

  return (
    <div className="pl-8 py-4 mb-4" style={{ borderLeft: `4px solid ${borderColorValue}` }}>
      <div className="flex items-center gap-3 mb-6">
        <span 
          className="font-ibm font-bold text-xs px-2 py-1 uppercase"
          style={{ backgroundColor: `color-mix(in srgb, ${labelBgValue} 20%, transparent)` }}
        >
          [ {type.toUpperCase()} ]
        </span>
        <span className="font-ibm font-bold text-sm tracking-widest uppercase">{title}</span>
      </div>
      
      <div className="text-sm opacity-90 leading-relaxed font-body">
        {children}
      </div>
    </div>
  );
}
