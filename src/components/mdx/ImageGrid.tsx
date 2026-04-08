import React from 'react';
import styles from './Editorial.module.css';

interface ImageGridProps {
  images: string[];
  columns?: number;
}

export function ImageGrid({ images = [], columns = 3 }: ImageGridProps) {
  return (
    <div className={styles.imageGrid} data-cols={columns}>
      {images.map((src, idx) => (
        <img 
          key={idx} 
          src={src} 
          alt={`Gallery image ${idx + 1}`} 
          className={styles.imageItem}
        />
      ))}
    </div>
  );
}
