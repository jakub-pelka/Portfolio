import React from 'react';

interface TerminalCardProps {
  title: string;
  status?: string;
  children: React.ReactNode;
}

export function TerminalCard({ title, status, children }: TerminalCardProps) {
  return (
    <div className="p-8 bg-[var(--color-bg-secondary)] relative overflow-hidden h-full">
      {/* Halftone background effect via global class or SVG */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '8px 8px', opacity: 0.05 }} />
      
      <div className="relative z-10">
        <h3 className="font-ibm font-bold text-sm mb-6 flex items-center gap-2 uppercase">
          {status === 'active' && <span className="w-2 h-2 bg-[#55AAAA] animate-pulse" />}
          {title}
        </h3>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
