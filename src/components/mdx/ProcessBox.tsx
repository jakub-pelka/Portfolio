import React from 'react';

export function BoxGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      {children}
    </div>
  );
}

export function ProcessBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-border)] opacity-90">
      <h4 className="font-ibm font-bold text-xs mb-2 uppercase">{title}</h4>
      <p className="text-sm opacity-80 leading-relaxed font-body">
        {children}
      </p>
    </div>
  );
}
