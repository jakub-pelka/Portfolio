'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

// How close (px) to a section before it snaps to it
const SNAP_THRESHOLD = 240;

export function SectionScroller() {
  const isAnimating = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const getSections = (): HTMLElement[] =>
      Array.from(document.querySelectorAll('[data-snap-section]'));

    const snapIfClose = () => {
      if (isAnimating.current) return;

      const sections = getSections();
      if (sections.length === 0) return;

      const scrollY = window.scrollY;

      for (const section of sections) {
        const sectionTop = section.offsetTop - 96; // account for offsetY (header height)
        const dist = sectionTop - scrollY; // signed: negative = scrolled past, positive = approaching

        if (Math.abs(dist) < SNAP_THRESHOLD && Math.abs(dist) > 12) {
          isAnimating.current = true;
          gsap.to(window, {
            scrollTo: { y: section, offsetY: 96, autoKill: true },
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => { isAnimating.current = false; },
            onInterrupt: () => { isAnimating.current = false; },
          });
          break;
        }
      }
    };

    const onScroll = () => {
      if (isAnimating.current) return;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(snapIfClose, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return null;
}
