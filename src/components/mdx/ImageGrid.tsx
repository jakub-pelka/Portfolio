import path from 'path';
import { imageSizeFromFile } from 'image-size/fromFile';
import { ImageLightbox } from './ImageLightbox';
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

export async function ImageGrid({ images = [], columns = 3, frame = true }: ImageGridProps) {
  const hasFrame = frame !== false && frame !== 'false';

  const sizedImages = await Promise.all(
    images.map(async ({ src, alt }) => {
      const { width, height } = await imageSizeFromFile(
        path.join(process.cwd(), 'public', src)
      );
      return { src, alt, width, height };
    })
  );

  return (
    <div className={styles.imageGrid} data-cols={columns}>
      {sizedImages.map(({ src, alt, width, height }, idx) => (
        <ImageLightbox
          key={idx}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={styles.imageItem}
          frame={hasFrame}
        />
      ))}
    </div>
  );
}
