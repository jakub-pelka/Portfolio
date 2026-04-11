import styles from './Editorial.module.css';

interface FullwidthImageProps {
  src: string;
  alt: string;
  caption?: string;
  frame?: boolean;
}

export function FullwidthImage({ src, alt, caption, frame = true }: FullwidthImageProps) {
  return (
    <figure className={styles.fullwidthImage}>
      <img src={src} alt={alt} className={styles.fullwidthImageImg} data-frame={frame} />
      {caption && (
        <figcaption className={styles.fullwidthImageCaption}>{caption}</figcaption>
      )}
    </figure>
  );
}
