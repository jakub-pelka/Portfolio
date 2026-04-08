import React from 'react';

export function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-ibm font-bold text-lg">
        {num} // [ {title.toUpperCase()} ]
      </h2>
    </div>
  );
}
