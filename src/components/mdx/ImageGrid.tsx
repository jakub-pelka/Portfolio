import React from 'react';

interface ImageGridProps {
  images: string[];
  columns?: number;
}

export function ImageGrid({ images, columns = 3 }: ImageGridProps) {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-3';

  return (
    <div className={`grid ${gridClasses} gap-2 mb-8`}>
      {images.map((src, idx) => (
        <img 
          key={idx} 
          src={src} 
          alt={`Gallery image ${idx + 1}`} 
          className="aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-300 border border-[var(--color-border)]"
        />
      ))}
    </div>
  );
}
