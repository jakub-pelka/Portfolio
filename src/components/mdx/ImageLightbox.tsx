'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import styles from './ImageLightbox.module.css';

// matches the longest exit transition (background darkening) in ImageLightbox.module.css
const TRANSITION_MS = 520;

interface ImageLightboxProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  frame?: boolean;
}

export function ImageLightbox({
  src,
  alt,
  width,
  height,
  className,
  style,
  frame,
}: ImageLightboxProps) {
  const [rendered, setRendered] = useState(false);
  const [open, setOpen] = useState(false);

  const show = () => {
    setRendered(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  };

  const hide = () => {
    setOpen(false);
    window.setTimeout(() => setRendered(false), TRANSITION_MS);
  };

  useEffect(() => {
    if (!rendered) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [rendered]);

  return (
    <>
      <button
        type="button"
        onClick={show}
        className={styles.trigger}
        aria-label={`Zoom: ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={style}
          data-frame={frame ? 'true' : 'false'}
        />
      </button>

      {rendered && (
        <div
          className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={hide}
        >
          <div className={styles.closeButtonWrap}>
            <Button variant="v3" onClick={hide}>
              X
            </Button>
          </div>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="92vw"
            className={styles.zoomedImage}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
