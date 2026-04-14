import styles from './Editorial.module.css';

interface ImageGridProps {
  images: string[];
  columns?: number;
  frame?: boolean | string;
}

export function ImageGrid({ images = [], columns = 3, frame = true }: ImageGridProps) {
  const hasFrame = frame !== false && frame !== 'false';
  return (
    <div className={styles.imageGrid} data-cols={columns}>
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`Gallery image ${idx + 1}`}
          className={styles.imageItem}
          data-frame={hasFrame ? 'true' : 'false'}
        />
      ))}
    </div>
  );
}
