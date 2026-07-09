import path from 'path';
import { imageSizeFromFile } from 'image-size/fromFile';
import { ImageLightbox } from './ImageLightbox';
import styles from './Editorial.module.css';

interface FullwidthImageProps {
  src: string;
  alt: string;
  caption?: string;
  frame?: boolean | string;
}

export async function FullwidthImage(props: FullwidthImageProps) {
  const { src, alt, caption, frame = false } = props;
  const hasFrame = frame !== false && frame !== 'false';

  const { width, height } = await imageSizeFromFile(
    path.join(process.cwd(), 'public', src)
  );

  return (
    <figure className={styles.fullwidthImage}>
      <ImageLightbox
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto' }}
        className={styles.fullwidthImageImg}
        frame={hasFrame}
      />
      {caption && (
        <figcaption className={styles.fullwidthImageCaption}>{caption}</figcaption>
      )}
    </figure>
  );
}
