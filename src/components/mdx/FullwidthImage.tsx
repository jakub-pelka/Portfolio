import styles from './Editorial.module.css';

interface FullwidthImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export function FullwidthImage({ src, alt, caption }: FullwidthImageProps) {
  return (
    <figure className={styles.fullwidthImage}>
      <img src={src} alt={alt} className={styles.fullwidthImageImg} />
      {caption && (
        <figcaption className={styles.fullwidthImageCaption}>{caption}</figcaption>
      )}
    </figure>
  );
}
