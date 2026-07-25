'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './HeroLanyard.module.css';

const LanyardReactBits = dynamic(
  () => import('@/components/_experiments/lanyard/LanyardReactBits'),
  { ssr: false }
);

// When the card mounts, measured from page load. The Hero intro (Hero.tsx)
// runs a GSAP timeline with a 1s start delay + ~3.5s of animation ≈ 4.5s
// total; this is roughly its midpoint, so the card appears (and starts its
// own drop-in) while the name is still animating rather than after everything
// settles. next/dynamic still code-splits the heavy r3f/rapier/GLB chunk, so
// it's fetched lazily regardless of when we flip this on.
const HERO_ANIM_MIDPOINT_MS = 2250;

export function HeroLanyard({ lang }: { lang: string }) {
  // Start false unconditionally: the server has no timers and renders null, so
  // the client's first (hydration) render must also be null to match. The
  // timer below only ever flips it to true later, on the client.
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), HERO_ANIM_MIDPOINT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={styles.wrap}>
      {/* dragCeilingFraction matches .wrap's --tweak-lanyard-y default (-15%,
          see HeroLanyard.module.css) — keep the two in sync if either changes. */}
      <LanyardReactBits
        backImage="/lanyard/face-photo.jpg"
        dragCeilingFraction={0.15}
        lang={lang === 'en' ? 'en' : 'pl'}
      />
    </div>
  );
}
