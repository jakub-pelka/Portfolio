'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './AboutLanyard.module.css';

const LanyardReactBits = dynamic(
  () => import('@/components/_experiments/lanyard/LanyardReactBits'),
  { ssr: false }
);

/**
 * Second lanyard instance for the About Me section. Independent of the Hero
 * one: its own CSS-var controls (--tweak-about-lanyard-*) and its own mount
 * gate. It mounts (and only then fetches the heavy r3f/rapier/GLB chunk) when
 * the section scrolls near the viewport, so it costs nothing until reached.
 * LanyardReactBits' own IntersectionObserver then unmounts whichever scene is
 * off-screen, so the Hero and About canvases don't run at the same time.
 */
export function AboutLanyard({ lang }: { lang: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.wrap}>
      {show && (
        <LanyardReactBits backImage="/lanyard/face-photo.jpg" lang={lang === 'en' ? 'en' : 'pl'} />
      )}
    </div>
  );
}
