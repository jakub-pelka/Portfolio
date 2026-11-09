'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './PortfolioLanyard.module.css';

const LanyardReactBits = dynamic(
  () => import('@/components/_experiments/lanyard/LanyardReactBits'),
  { ssr: false }
);

// Karta nie jest potrzebna od pierwszej klatki (sekcja O mnie leży pod hero),
// więc ciężki R3F/Rapier ładuje się dopiero po tym czasie, żeby nie rywalizować
// z animacją hero.
const MOUNT_DELAY_MS = 2250;

// Jedna, na stałe zamontowana instancja karty na smyczy. AboutSection renderuje
// pusty slot (#about-lanyard-slot), który służy tylko za punkt odniesienia.
// Karta jest position:absolute względem <main> i przewija się razem ze stroną,
// wisząc na linii nad sekcją O mnie. Część boxa, która wystaje nad tę linię,
// jest przycinana (clip-path), żeby pasek nie wchodził w hero.
export function PortfolioLanyard({ lang }: { lang: string }) {
  const [mounted, setMounted] = useState(false);
  // Ile pikseli boxa (w jego lokalnych współrzędnych) leży nad linią sekcji.
  // Trzymane w state, żeby re-render Reacta nie nadpisał clipPath.
  const [aboutClip, setAboutClip] = useState(0);
  const aboutClipRef = useRef(0);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), MOUNT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = mountRef.current;
    const main = document.querySelector('main');
    if (!el || !main) return;

    const place = () => {
      const slot = document.getElementById('about-lanyard-slot');
      if (!slot) return;
      const slotRect = slot.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      el.style.position = 'absolute';
      el.style.top = `${slotRect.top - mainRect.top}px`;
      el.style.left = `${slotRect.left - mainRect.left}px`;
      el.style.width = `${slotRect.width}px`;
      el.style.height = `${slotRect.height}px`;

      // Slot jest wyniesiony ponad linię sekcji, żeby sama karta wylądowała na
      // dobrej wysokości; wszystko nad linią przycinamy. Oba rect-y czytane w
      // tym samym ticku, więc przewinięcie się skraca.
      const section = document.getElementById('about');
      const lineTop = section ? section.getBoundingClientRect().top : slotRect.top;
      const clip = Math.max(0, Math.round(lineTop - slotRect.top));
      if (aboutClipRef.current !== clip) {
        aboutClipRef.current = clip;
        setAboutClip(clip);
      }
    };

    place();
    window.addEventListener('resize', place);
    // Zmiana wysokości treści nad slotem (fonty, obrazy) przesuwa sekcję bez
    // zdarzenia resize.
    const observer = new ResizeObserver(place);
    observer.observe(main);
    const devInterval =
      process.env.NODE_ENV !== 'production' ? setInterval(place, 500) : null;
    return () => {
      window.removeEventListener('resize', place);
      observer.disconnect();
      if (devInterval) clearInterval(devInterval);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={mountRef}
      className={styles.mount}
      aria-hidden="true"
      style={{
        clipPath: `inset(${aboutClip}px 0 0 0)`,
        // Nad treścią sekcji O mnie (bez własnego z-index): karta wisi przed
        // tekstem jak fizyczny obiekt.
        zIndex: 1,
      }}
    >
      <LanyardReactBits
        backImage="/lanyard/face-photo.jpg"
        dragCeilingFraction={0.15}
        lang={lang === 'en' ? 'en' : 'pl'}
      />
    </div>
  );
}
