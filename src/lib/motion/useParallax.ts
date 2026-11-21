'use client';

import { useEffect, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Tryby paralaksy (wszystkie: tylko transform, scrub, bez zmiany układu):
 * - `pass`    — element przesuwa się od -distance/2 do +distance/2, gdy przechodzi przez ekran
 *               (w połowie przejścia leży dokładnie na swoim miejscu),
 * - `fromTop` — przesunięcie 0 -> wartość, liczone od początku strony przez całą wysokość najbliższej <section>
 *               (hero: gwiazdka, tytuł strony projektu),
 * - `reveal`  — wejście stopki: zawartość wsuwa się z -revealPercent % własnej wysokości do 0,
 *               kończąc dokładnie na końcu strony.
 *
 * Dodatnie przesunięcie przy przewijaniu w dół = element jedzie wolniej niż strona.
 */
export type ParallaxMode = 'pass' | 'fromTop' | 'reveal';

export interface ParallaxOptions {
  mode?: ParallaxMode;
  /** Całkowite przesunięcie w px (pass, fromTop). */
  distance?: number;
  /** Zamiast distance: ułamek wysokości strefy (fromTop), np. 0.45 = element przesuwa się o 0.45 przewiniętej drogi. */
  speed?: number;
  /** Mnożnik przesunięcia na telefonie (< 768 px). 0 wyłącza. */
  mobileFactor?: number;
  /** Tylko reveal: ile % wysokości zawartości jest schowane na początku. */
  revealPercent?: number;
}

let refreshHooked = false;
function hookRefresh() {
  if (refreshHooked) return;
  refreshHooked = true;
  const refresh = () => ScrollTrigger.refresh();
  // fonty zmieniają wysokości tekstu; po załadowaniu strony ScrollTrigger sam liczy jeszcze raz,
  // ale fonty (display: swap) potrafią dojechać później
  document.fonts?.ready.then(refresh).catch(() => {});
  if (document.readyState !== 'complete') window.addEventListener('load', refresh, { once: true });
  // wysokość dokumentu zmienia się też po nawigacji klienckiej (stopka żyje w layoucie) i po doładowaniu treści
  if (typeof ResizeObserver !== 'undefined') {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastHeight = document.documentElement.scrollHeight;
    new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (h === lastHeight) return;
      lastHeight = h;
      if (timer) clearTimeout(timer);
      timer = setTimeout(refresh, 150);
    }).observe(document.body);
  }
}

/**
 * `outer` — stały element (punkt odniesienia dla ScrollTrigger), `inner` — element, który się przesuwa.
 * Dwa elementy, bo trigger nie może sam się poruszać (pomiar pozycji by się rozjeżdżał).
 */
export function useParallax(
  outer: RefObject<HTMLElement | null>,
  inner: RefObject<HTMLElement | null>,
  { mode = 'pass', distance = 0, speed, mobileFactor = 0.5, revealPercent = 30 }: ParallaxOptions,
) {
  const pathname = usePathname();

  // zmiana trasy: nowa strona ma inną wysokość, więc przelicz pozycje po wyrenderowaniu
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const outerEl = outer.current;
    const innerEl = inner.current;
    if (!outerEl || !innerEl) return;

    hookRefresh();
    const mm = gsap.matchMedia();

    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 767px)' },
      (context) => {
        const { motion, mobile } = context.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const factor = mobile ? mobileFactor : 1;
        if (factor === 0) return;

        const common = {
          ease: 'none',
          force3D: true,
        };
        const toggleHint = (self: ScrollTrigger) => {
          innerEl.style.willChange = self.isActive ? 'transform' : 'auto';
        };

        if (mode === 'reveal') {
          gsap.fromTo(
            innerEl,
            {
              // zbyt wysoka stopka (telefon w poziomie, niskie okno): bez efektu, żeby góra stopki nie była schowana
              y: () => (innerEl.offsetHeight > window.innerHeight * 0.9 ? 0 : (-revealPercent / 100) * innerEl.offsetHeight),
            },
            {
              y: 0,
              ...common,
              scrollTrigger: {
                trigger: outerEl,
                start: 'top bottom',
                end: () => ScrollTrigger.maxScroll(window),
                scrub: 0.3,
                invalidateOnRefresh: true,
                onToggle: toggleHint,
              },
            },
          );
          return;
        }

        if (mode === 'fromTop') {
          const zone = (outerEl.closest('section') as HTMLElement | null) ?? outerEl.parentElement ?? outerEl;
          gsap.fromTo(
            innerEl,
            { y: 0 },
            {
              y: () => (speed !== undefined ? speed * zone.offsetHeight : distance) * factor,
              ...common,
              scrollTrigger: {
                trigger: zone,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.3,
                invalidateOnRefresh: true,
                onToggle: toggleHint,
              },
            },
          );
          return;
        }

        const half = (distance * factor) / 2;
        gsap.fromTo(
          innerEl,
          { y: -half },
          {
            y: half,
            ...common,
            scrollTrigger: {
              trigger: outerEl,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.3,
              invalidateOnRefresh: true,
              onToggle: toggleHint,
            },
          },
        );
      },
    );

    return () => {
      mm.revert();
      innerEl.style.willChange = '';
    };
  }, [outer, inner, mode, distance, speed, mobileFactor, revealPercent]);
}
