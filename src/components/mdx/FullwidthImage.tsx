import styles from './Editorial.module.css';

interface FullwidthImageProps {
  src: string;
  alt: string;
  caption?: string;
  frame?: boolean | string;
}

export function FullwidthImage(props: FullwidthImageProps) {
  console.log('[FullwidthImage] raw props:', JSON.stringify(props));
  const { src, alt, caption, frame = false } = props;
  const hasFrame = frame !== false && frame !== 'false';
  return (
    <figure className={styles.fullwidthImage}>
      <img src={src} alt={alt} className={styles.fullwidthImageImg} data-frame={hasFrame ? 'true' : 'false'} />
      {caption && (
        <figcaption className={styles.fullwidthImageCaption}>{caption}</figcaption>
      )}
    </figure>
  );
}
