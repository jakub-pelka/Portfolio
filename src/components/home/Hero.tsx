'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import SplitType from 'split-type';
import styles from './Hero.module.css';


export function Hero() {
  const pathname = usePathname();
  const lang = pathname.split('/')[1] || 'pl';
  const heyRef = useRef<HTMLDivElement>(null);
  const nameContainerRef = useRef<HTMLDivElement>(null);
  const itsRef = useRef<HTMLSpanElement>(null);
  const firstNameRef = useRef<HTMLHeadingElement>(null);
  const lastNameRef = useRef<HTMLHeadingElement>(null);
  const starRef = useRef<HTMLAnchorElement>(null);
  const portfolioRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  function scrollToTimeline() {
    document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    if (!heyRef.current || !nameContainerRef.current || !itsRef.current || !firstNameRef.current || !lastNameRef.current || !starRef.current || !portfolioRef.current || !arrowRef.current) return;

    // Split text into characters for "Jakub", "Pełka", and "It's"
    // Using split-type. SplitType creates wrapper divs, and we'll animate the characters.
    const splitIts = new SplitType(itsRef.current, { types: 'chars' });
    const splitFirst = new SplitType(firstNameRef.current, { types: 'chars' });
    const splitLast = new SplitType(lastNameRef.current, { types: 'chars' });

    // Jeśli user wrócił na stronę i jest już poniżej Hero — pokaż końcowy stan bez animacji
    const isScrolledPast = window.scrollY > window.innerHeight * 0.3;
    if (isScrolledPast) {
      gsap.set(heyRef.current, { opacity: 1, x: 0, y: 0, skewX: -15, transformOrigin: 'bottom center' });
      gsap.set(nameContainerRef.current, { opacity: 1 });
      gsap.set([...(splitIts.chars || []), ...(splitFirst.chars || []), ...(splitLast.chars || [])], { yPercent: 0, opacity: 1 });
      gsap.set([starRef.current, portfolioRef.current, arrowRef.current], { opacity: 1 });
      return () => { splitIts.revert(); splitFirst.revert(); splitLast.revert(); };
    }

    // Set initial state for 'Hey'
    const heyRect = heyRef.current.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const elementCenterX = heyRect.left + heyRect.width / 2;
    const elementCenterY = heyRect.top + heyRect.height / 2;

    const distanceToCenterX = centerX - elementCenterX;
    const distanceToCenterY = centerY - elementCenterY;

    // Start perfectly in the center of the screen
    gsap.set(heyRef.current, { 
      opacity: 1, 
      x: distanceToCenterX,
      y: distanceToCenterY,
      transformOrigin: "bottom center" // Kotwiczymy spód litery, żeby przy gwałtownym pochyleniu środek nie uciekał do tyłu
    });

    // Make the name container visible now that splitting is done
    // and characters are ready to be pushed down
    gsap.set(nameContainerRef.current, { opacity: 1 });

    // Initially position the split characters down out of their clipping masks
    // We add the .maskWrapper class dynamically to the parent lines or words
    // However, splitType defaults creating `char` divs. We need to clip them.
    // Instead of complex nesting, we rely on the line-height clipping them if overflow hidden, 
    // or we just animate their y position and opacity for a sharp reveal.
    const allChars = [
      ...(splitIts.chars || []), 
      ...(splitFirst.chars || []), 
      ...(splitLast.chars || [])
    ];
    
    // Extract the very last character of "Pełka" for unique animation
    const charsLast = splitLast.chars || [];
    const lastChar = charsLast.length > 0 ? charsLast[charsLast.length - 1] : null;
    const allCharsButLast = [
      ...(splitIts.chars || []), 
      ...(splitFirst.chars || []), 
      ...charsLast.slice(0, -1)
    ];

    // Set all chars initially shifted down a bit more to clear paddings
    gsap.set(allChars, { yPercent: 120, opacity: 0 });

    // Set initial state for star, portfolio, and arrow (invisible)
    gsap.set([starRef.current, portfolioRef.current, arrowRef.current], { opacity: 0 });

    const tl = gsap.timeline({ delay: 1 }); // Wait 1 second at the absolute center

    // 1. "Hey" moves UP to its current row
    tl.to(heyRef.current, {
      y: 0,
      duration: .5,
      ease: "power4.inOut",
    });

    // --- Velocity-driven horizontal slide with natural skew ---
    const RESTING_SKEW = -15;
    const SKEW_SENSITIVITY = 0.4;
    const hey = heyRef.current;
    let prevX: number | null = null;

    const slideLabel = "slide";
    tl.addLabel(slideLabel);

    // Phase 1: Slide left with velocity-driven lean < (momentum)
    tl.to(hey, {
      x: 0,
      duration: 0.6,
      ease: "power3.out",
      onStart: function () {
        prevX = gsap.getProperty(hey, "x") as number;
      },
      onUpdate: function () {
        const currentX = gsap.getProperty(hey, "x") as number;
        if (prevX === null) { prevX = currentX; return; }

        const dx = currentX - prevX;
        prevX = currentX;

        const progress = this.progress();
        // Velocity lean: moving left → lean backward <
        const velocitySkew = -dx * SKEW_SENSITIVITY;
        // Only blend toward neutral (0), not resting angle — phases 2-5 handle the rest
        const skew = velocitySkew * (1 - progress);

        gsap.set(hey, { skewX: skew });
      },
    }, slideLabel);

    // Phase 2: Decelerated → straightens up |  (already ~0 from onUpdate fading out)
    // Phase 3: Inertia overshoot → leans right > (top swings past vertical)
    tl.to(hey, {
      skewX: RESTING_SKEW,
      duration: 0.25,
      ease: "power2.in",
    }, `${slideLabel}+=0.50`);

    // Phase 4: "y" corner hits the wall → rebound to halfway between wall lean and upright
    tl.to(hey, {
      skewX: RESTING_SKEW * 0.5,
      duration: 0.2,
      ease: "power2.out",
    }, `${slideLabel}+=0.75`);

    // Phase 5: Settles back onto the wall → final italic >
    tl.to(hey, {
      skewX: RESTING_SKEW,
      duration: 0.25,
      ease: "power2.in",
    }, `${slideLabel}+=0.95`);

    // 3. Chars slide up one by one (staggered) EXCEPT the last 'a'
    tl.to(allCharsButLast, {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.04,
      ease: "expo.out",
    }, `${slideLabel}+=0.4`)
    // Last character 'a' slides up slower
    .to(lastChar, {
      yPercent: 0,
      opacity: 1,
      duration: 1.5,
      ease: "expo.out",
    }, "<0.5")
    // 4. Fade in star, portfolio, and arrow after main animation completes
    .to([starRef.current, portfolioRef.current, arrowRef.current], {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.1,
    }, `${slideLabel}+=2.0`); // Start after last 'a' finishes (~2s from slideLabel)

    // Cleanup split on unmount
    return () => {
      splitIts.revert();
      splitFirst.revert();
      splitLast.revert();
    };
  }, []);

  return (
    <section className={styles.hero}>
      <a href={`/${lang}/playground`} className={styles.star} ref={starRef} title="?">*</a>
      <div className={styles.content}>
        <div className={styles.hey} ref={heyRef}>Hey</div>
        <div className={styles.nameContainer} ref={nameContainerRef}>
          <span className={`${styles.its} ${styles.maskWrapper}`}>
            <span ref={itsRef}>It's</span>
          </span>
          <div className={styles.nameGroup}>
            <div className={styles.maskWrapper}>
              <h1 className={styles.firstName} ref={firstNameRef}>Jakub</h1>
            </div>
            <div className={styles.maskWrapper}>
              <h2 className={styles.lastName} ref={lastNameRef}>Pełka</h2>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottomTokens}>
        <span
          className={styles.portfolio}
          ref={portfolioRef}
          onClick={scrollToTimeline}
          style={{ cursor: 'pointer' }}
        >
          Portfolio
        </span>
        <div
          className={styles.arrowDown}
          ref={arrowRef}
          onClick={scrollToTimeline}
          style={{ cursor: 'pointer' }}
        >
          <svg width="21" height="12" viewBox="0 0 21 12" fill="currentColor">
            <rect x="0" y="0" width="3" height="3" />
            <rect x="3" y="3" width="3" height="3" />
            <rect x="6" y="6" width="3" height="3" />
            <rect x="9" y="9" width="3" height="3" />
            <rect x="12" y="6" width="3" height="3" />
            <rect x="15" y="3" width="3" height="3" />
            <rect x="18" y="0" width="3" height="3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
