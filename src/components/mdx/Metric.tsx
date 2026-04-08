import React from 'react';

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-16 mb-12">
      {children}
    </div>
  );
}

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className="text-6xl font-ibm font-bold text-[#55AAAA] dark:text-[#80d4d4]">{value}</span>
      <span className="block font-vt text-xs mt-2 uppercase opacity-80 tracking-widest">{label}</span>
    </div>
  );
}
