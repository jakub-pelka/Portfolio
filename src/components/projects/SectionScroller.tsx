'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

// How close (px) to a section before it snaps to it
const SNAP_THRESHOLD = 240;
// Breathing room when header is hidden
const NO_HEADER_MARGIN = 24;

function getHeaderHeight(): number {
  const header = document.querySelector<HTMLElement>('[data-header-visible]');
  if (!header) return 0;
  return header.getBoundingClientRect().height;
}

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
      const headerHeight = getHeaderHeight();

      for (const section of sections) {
        // Use header height as reference for distance calculation
        const sectionTop = section.offsetTop - headerHeight;
        const dist = sectionTop - scrollY; // negative = scrolled past, positive = not yet reached

        if (Math.abs(dist) < SNAP_THRESHOLD && Math.abs(dist) > 12) {
          // If dist < 0 we're scrolling up — header will appear on arrival
          // If dist > 0 we're scrolling down — header stays hidden
          const scrollingUp = dist < 0;
          const offsetY = scrollingUp ? headerHeight : NO_HEADER_MARGIN;

          isAnimating.current = true;
          gsap.to(window, {
            scrollTo: { y: section, offsetY, autoKill: true },
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
