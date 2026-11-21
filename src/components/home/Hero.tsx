'use client';

import { useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { Parallax } from '@/components/ui/Parallax';
import { INTRO_DURATION, INTRO_TEXT_START, type StarHandle } from './heroIntroConfig';
import styles from './Hero.module.css';

// Three.js ładuje się dopiero po stronie klienta i nie blokuje pierwszego renderu.
const HeroStar = dynamic(() => import('./HeroStar').then((m) => m.HeroStar), { ssr: false });

interface HeroProps {
  dict: {
    hero: {
      greeting: string;
      intro: string;
      name_first: string;
      name_last: string;
      cta_projects: string;
      [key: string]: unknown;
    };
  };
  scrollLabel?: string;
}

/**
 * Intro startuje tylko przy wejściu na stronę (pełne ładowanie), gdy inline script w layoucie ustawił
 * html[data-intro="running"] (bez przewinięcia, hasha, „wstecz”, reduced motion). Decyzję zapamiętujemy na
 * czas życia strony; kolejne montowania (nawigacja kliencka, np. klik w logo) dostają stan końcowy od razu.
 * Strict Mode montuje efekt dwa razy w tej samej turze, więc reset jest opóźniony i anulowany przy ponownym starcie.
 */
let entryEligible: boolean | null = null;
let entryResetTimer: number | null = null;

/** Maksymalny czas oczekiwania na gwiazdkę przed startem osi czasu (gdy np. wolna sieć). */
const STAR_WAIT_MS = 2000;

/**
 * Pochylenie „Hey”: wjazd z pędem, prostowanie, odbicie od „ściany” i osiadanie w -15°.
 * Czysta funkcja czasu (tau od startu wejścia), dzięki czemu oś czasu można przewijać.
 */
function heySkew(tau: number) {
  const REST = -15;
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const prog = (t: number, start: number, dur: number) => Math.min(1, Math.max(0, (t - start) / dur));
  if (tau < 0) return 0;
  if (tau < 0.5) return 14 * Math.pow(1 - tau / 0.6, 3);
  const s0 = 14 * Math.pow(1 - 0.5 / 0.6, 3);
  if (tau < 0.75) return lerp(s0, REST, Math.pow(prog(tau, 0.5, 0.25), 2));
  if (tau < 0.95) return lerp(REST, REST * 0.5, 1 - Math.pow(1 - prog(tau, 0.75, 0.2), 2));
  return lerp(REST * 0.5, REST, Math.pow(prog(tau, 0.95, 0.25), 2));
}

export function Hero({ dict, scrollLabel: propScrollLabel }: HeroProps) {
  const scrollLabel = propScrollLabel ?? dict.hero.cta_projects;
  const heyRef = useRef<HTMLDivElement>(null);
  const nameContainerRef = useRef<HTMLDivElement>(null);
  const itsRef = useRef<HTMLSpanElement>(null);
  const firstNameRef = useRef<HTMLHeadingElement>(null);
  const lastNameRef = useRef<HTMLHeadingElement>(null);
  const portfolioRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);

  // Stan wspólny z gwiazdką ASCII (ładowaną asynchronicznie)
  const starHandle = useRef<StarHandle | null>(null);
  const clockT = useRef(0); // ostatni czas osi (s)
  const finished = useRef(false); // oś doszła do końca (lub pominięta)
  const loopAllowed = useRef(true); // false przy prefers-reduced-motion
  const onStarReadyRef = useRef<(() => void) | null>(null);
  const starSettled = useRef(false);

  const handleStar = useCallback((h: StarHandle | null) => {
    starHandle.current = h;
    if (h) {
      h.render(clockT.current);
      if (finished.current && loopAllowed.current) h.startLoop(clockT.current);
    }
    // gwiazdka gotowa (albo niedostępna) -> można startować oś czasu
    starSettled.current = true;
    onStarReadyRef.current?.();
  }, []);

  function scrollToTimeline() {
    document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    if (
      !heyRef.current ||
      !nameContainerRef.current ||
      !itsRef.current ||
      !firstNameRef.current ||
      !lastNameRef.current ||
      !portfolioRef.current ||
      !arrowRef.current
    )
      return;

    const hey = heyRef.current;
    const nameContainer = nameContainerRef.current;
    const portfolio = portfolioRef.current;
    const arrow = arrowRef.current;
    const root = document.documentElement;
    const T = INTRO_TEXT_START;

    if (entryResetTimer !== null) {
      window.clearTimeout(entryResetTimer);
      entryResetTimer = null;
    }
    if (entryEligible === null) entryEligible = root.dataset.intro === 'running';
    const introEligible = entryEligible;
    // znacznik dla CSS: JS działa, awaryjne odsłonięcie napisów (Hero.module.css) nie jest potrzebne
    root.dataset.heroReady = '';
    const leave = () => {
      delete root.dataset.heroReady;
      entryResetTimer = window.setTimeout(() => {
        entryEligible = false;
        entryResetTimer = null;
      }, 0);
    };

    // Stan końcowy bez animacji: wszystko, czego inline script nie uznał za wejście na stronę
    // (reduced motion, przewinięcie, hash, „wstecz”) oraz nawigacja kliencka
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skipIntro = !introEligible;

    loopAllowed.current = !reduced;

    if (skipIntro) {
      gsap.set(hey, { opacity: 1, xPercent: 0, skewX: -15, transformOrigin: 'bottom center' });
      gsap.set(nameContainer, { opacity: 1 });
      gsap.set([portfolio, arrow], { autoAlpha: 1 });
      if (!reduced) arrow.classList.add(styles.bounce);
      clockT.current = INTRO_DURATION;
      finished.current = true;
      root.dataset.intro = 'done';
      // gwiazdka (jeśli już gotowa) rysuje stan końcowy; pętla tylko bez reduced motion
      starHandle.current?.render(INTRO_DURATION);
      if (!reduced) starHandle.current?.startLoop(INTRO_DURATION);
      return () => {
        starHandle.current?.stopLoop();
        delete root.dataset.intro;
        leave();
      };
    }

    // Podział napisów na litery (SplitType) — bez zmian względem poprzedniej wersji
    const splitIts = new SplitType(itsRef.current, { types: 'chars' });
    const splitFirst = new SplitType(firstNameRef.current, { types: 'chars' });
    const splitLast = new SplitType(lastNameRef.current, { types: 'chars' });
    const charsIts = splitIts.chars || [];
    const charsFirst = splitFirst.chars || [];
    const charsLast = splitLast.chars || [];
    const lastChar = charsLast.length > 0 ? charsLast[charsLast.length - 1] : null;
    const allChars = [...charsIts, ...charsFirst, ...charsLast];
    const allCharsButLast = [...charsIts, ...charsFirst, ...charsLast.slice(0, -1)];

    const split = () => {
      splitIts.revert();
      splitFirst.revert();
      splitLast.revert();
    };

    // ---- oś czasu zgodna z prototypem (DUR = 6 s, napisy od T = 2,2 s) ----
    root.dataset.intro = 'running';
    finished.current = false;
    clockT.current = 0;

    gsap.set(hey, { opacity: 0, xPercent: 100, skewX: 0, transformOrigin: 'bottom center' });
    gsap.set(nameContainer, { opacity: 1 });
    gsap.set(allChars, { yPercent: 120, opacity: 0 });
    gsap.set([portfolio, arrow], { autoAlpha: 0 });

    const clock = { t: 0 };
    const skew = { tau: 0 };
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        finished.current = true;
        starHandle.current?.startLoop(INTRO_DURATION);
        ScrollTrigger.refresh();
      },
    });

    // zegar osi: steruje gwiazdką (gwiazdka rysuje klatkę dla t)
    tl.to(
      clock,
      {
        t: INTRO_DURATION,
        duration: INTRO_DURATION,
        ease: 'none',
        onUpdate: () => {
          clockT.current = clock.t;
          starHandle.current?.render(clock.t, true);
        },
      },
      0,
    );

    // interfejs strony (nagłówek) wchodzi razem z napisami — reguła CSS na html[data-intro]
    tl.call(() => {
      root.dataset.intro = 'done';
    }, undefined, T);

    // „Hey”: wjazd z prawej + pochylenie
    tl.to(hey, { opacity: 1, duration: 0.2, ease: 'none' }, T)
      .to(hey, { xPercent: 0, duration: 0.6, ease: 'power3.out' }, T)
      .to(
        skew,
        {
          tau: 1.2,
          duration: 1.2,
          ease: 'none',
          onUpdate: () => {
            gsap.set(hey, { skewX: heySkew(skew.tau) });
          },
        },
        T,
      );

    // Litery: kolejno od dołu, ostatnie „a” wolniej
    tl.fromTo(
      allCharsButLast,
      { yPercent: 120, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'expo.out' },
      T + 0.4,
    );
    if (lastChar) {
      tl.fromTo(
        lastChar,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.5, ease: 'expo.out' },
        T + 0.9,
      );
    }

    // PORTFOLIO, strzałka, gwiazdka-link
    tl.fromTo(portfolio, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, T + 0.1)
      .fromTo(arrow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, T + 0.2)
      .call(() => arrow.classList.add(styles.bounce), undefined, T + 1.0);

    // Odtwarzanie wstrzymane poza ekranem i w karcie w tle (wznawia od miejsca pauzy)
    let started = false;
    let inView = true;
    let manual = false; // dev: ręczne przewijanie osi
    const sync = () => {
      if (manual || !started || finished.current) return;
      tl.paused(!inView || document.visibilityState !== 'visible');
    };
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(hey.closest('section') ?? hey);
    document.addEventListener('visibilitychange', sync);

    const start = () => {
      if (started) return;
      started = true;
      sync();
    };
    onStarReadyRef.current = start;
    const waitTimer = window.setTimeout(start, STAR_WAIT_MS);
    if (starSettled.current) start();

    // Dev: przewijanie osi do wybranej chwili (zrzuty ekranu / testy)
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as { __heroIntro?: unknown }).__heroIntro = {
        seek: (t: number) => {
          manual = true;
          tl.pause();
          starHandle.current?.stopLoop();
          tl.time(Math.min(t, INTRO_DURATION), false);
          root.dataset.intro = t >= T ? 'done' : 'running';
          clockT.current = t;
          starHandle.current?.stopLoop(); // onComplete mogło ruszyć pętlę
          starHandle.current?.render(t);
        },
      };
    }

    return () => {
      window.clearTimeout(waitTimer);
      onStarReadyRef.current = null;
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      tl.kill();
      starHandle.current?.stopLoop();
      delete root.dataset.intro;
      split();
      leave();
    };
  }, []);

  return (
    <section className={styles.hero}>
      {/* Paralaksa: gwiazdka jedzie wolniej niż napisy. Osobny wrapper, żeby nie dotykać elementów animowanych w intro. */}
      <Parallax mode="fromTop" speed={0.45} mobileFactor={0.5} className={styles.starLayer} innerClassName={styles.starLayerInner}>
        <HeroStar onReady={handleStar} />
      </Parallax>
      <div className={styles.stage}>
        <div className={styles.stageBox}>
          <div className={styles.content}>
            <div className={styles.hey} ref={heyRef}>
              {dict.hero.greeting}
            </div>
            <div className={styles.nameContainer} ref={nameContainerRef}>
              <span className={`${styles.its} ${styles.maskWrapper}`}>
                <span ref={itsRef} aria-label={dict.hero.intro}>{dict.hero.intro}</span>
              </span>
              <div className={styles.nameGroup}>
                <div className={styles.maskWrapper}>
                  <h1 className={styles.firstName} ref={firstNameRef} aria-label={dict.hero.name_first}>
                    {dict.hero.name_first}
                  </h1>
                </div>
                <div className={styles.maskWrapper}>
                  <h2 className={styles.lastName} ref={lastNameRef} aria-label={dict.hero.name_last}>
                    {dict.hero.name_last}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottomTokens}>
        <button type="button" className={styles.portfolio} ref={portfolioRef} onClick={scrollToTimeline}>
          {scrollLabel}
        </button>
        <button
          type="button"
          className={styles.arrowDown}
          ref={arrowRef}
          onClick={scrollToTimeline}
          aria-label={scrollLabel}
        >
          <svg width="21" height="12" viewBox="0 0 21 12" aria-hidden="true" className={styles.arrowSvg}>
            <path
              d="M0 0h3v3H0z M3 3h3v3H3z M6 6h3v3H6z M9 9h3v3H9z M12 6h3v3h-3z M15 3h3v3h-3z M18 0h3v3h-3z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <noscript>
        <style>{`.${styles.hey},.${styles.nameContainer},.${styles.portfolio},.${styles.arrowDown}{opacity:1!important;visibility:visible!important}`}</style>
      </noscript>
    </section>
  );
}
