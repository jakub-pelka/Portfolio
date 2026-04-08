import React from 'react';

export function QuoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-[var(--color-bg-dark)] dark:border-[var(--color-bg-light)] pl-6 py-2 mb-8">
      <p className="text-lg leading-relaxed italic opacity-80">
        {children}
      </p>
    </div>
  );
}
