'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import styles from './Hero.module.css';


export function Hero() {
  const heyRef = useRef<HTMLDivElement>(null);
  const nameContainerRef = useRef<HTMLDivElement>(null);
  const itsRef = useRef<HTMLSpanElement>(null);
  const firstNameRef = useRef<HTMLHeadingElement>(null);
  const lastNameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!heyRef.current || !nameContainerRef.current || !itsRef.current || !firstNameRef.current || !lastNameRef.current) return;

    // Split text into characters for "Jakub", "Pełka", and "It's"
    // Using split-type. SplitType creates wrapper divs, and we'll animate the characters.
    const splitIts = new SplitType(itsRef.current, { types: 'chars' });
    const splitFirst = new SplitType(firstNameRef.current, { types: 'chars' });
    const splitLast = new SplitType(lastNameRef.current, { types: 'chars' });

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

    const tl = gsap.timeline({ delay: 1 }); // Wait 1 second at the absolute center

    // 1. "Hey" moves UP to its current row
    tl.to(heyRef.current, {
      y: 0,
      duration: .5,
      ease: "power4.inOut",
    })
    // We group the horizontal movement and the two skew phases into one exact timeframe
    const horizontalStartTime = tl.duration(); // The exact time right after the first tween finishes

    // 2b. Simulate momentum: DEFORMATION starts FIRST due to static friction
    // Phase 1 (Tension): pull back, happens exactly at horizontal start
    tl.to(heyRef.current, {
      skewX: 15,
      duration: 0.35,
      ease: "sine.in",
    }, horizontalStartTime)

    // 2. "Hey" breaks friction and starts moving slightly AFTER deformation begins
    tl.to(heyRef.current, {
      x: 0,
      duration: .5,
      ease: "power1.inOut",
    }, horizontalStartTime + 0.1) // 0.1s delay for tension build-up
    
    // Phase 2: shift to final lean during movement (Total end time: 0.15 + 0.45 = 0.6s, matches 0.1 + 0.5 = 0.6s)
    tl.to(heyRef.current, {
      skewX: -15,
      duration: 0.45, // Extended slightly to finish exactly when the horizontal movement finishes
      ease: "sine.out",
    }, horizontalStartTime + 0.15)

    // 3. Chars slide up one by one (staggered) EXCEPT the last 'a'
    .to(allCharsButLast, {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.04,
      ease: "expo.out",
    }, "-=0.2") // Start slightly before "Hey" finishes its journey
    // 3. Last character 'a' slides up slower
    .to(lastChar, {
      yPercent: 0,
      opacity: 1,
      duration: 1.5, // much slower
      ease: "expo.out",
    }, "<0.5"); // Starts 0.5s after the PREVIOUS animation starts (so it trails behind nicely)

    // Cleanup split on unmount
    return () => {
      splitIts.revert();
      splitFirst.revert();
      splitLast.revert();
    };
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.star}>*</div>
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
        <span className={styles.portfolio}>Portfolio</span>
        <div className={styles.arrowDown}>
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
