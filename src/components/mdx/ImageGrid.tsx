import Image from 'next/image';
import styles from './Editorial.module.css';

interface ImageGridItem {
  src: string;
  alt: string;
}

interface ImageGridProps {
  images: ImageGridItem[];
  columns?: number;
  frame?: boolean | string;
}

export function ImageGrid({ images = [], columns = 3, frame = true }: ImageGridProps) {
  const hasFrame = frame !== false && frame !== 'false';
  return (
    <div className={styles.imageGrid} data-cols={columns}>
      {images.map(({ src, alt }, idx) => (
        <Image
          key={idx}
          src={src}
          alt={alt}
          width={600}
          height={600}
          className={styles.imageItem}
          data-frame={hasFrame ? 'true' : 'false'}
        />
      ))}
    </div>
  );
}
