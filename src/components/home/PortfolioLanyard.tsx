'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import styles from './PortfolioLanyard.module.css';

gsap.registerPlugin(ScrollToPlugin);

const LanyardReactBits = dynamic(
  () => import('@/components/_experiments/lanyard/LanyardReactBits'),
  { ssr: false }
);

// Same "half the animation" timing HeroLanyard used to use — see Hero.tsx's
// GSAP timeline (1s start delay + ~3.5s ≈ 4.5s total).
const HERO_ANIM_MIDPOINT_MS = 2250;
const SCROLL_DURATION = 1.8;
// Backstop for the transit flag below. If the tween ever ended without firing
// either of its callbacks, a stuck flag would leave the card frozen on screen
// for the rest of the visit — by far the worst failure mode here, and cheap
// enough to rule out with a timer.
const TRANSIT_TIMEOUT_MS = SCROLL_DURATION * 1000 + 600;
// Hides the top 15% of the card's own box — the "hangs from above the fold"
// look HeroLanyard.module.css used to get for free from .hero's
// overflow:hidden. Self-contained on the card's own box (rather than relying
// on an ancestor's overflow) since this single instance can end up living
// outside Hero's DOM subtree once it rests in About.
const HERO_CLIP = 'inset(15% 0 0 0)';

type RenderState = 'restingHero' | 'transit' | 'restingAbout';

// Single, permanently-mounted lanyard instance for the whole page (see the
// architecture note in PortfolioLanyard.module.css). Hero.tsx and
// AboutSection.tsx each render an empty placeholder div (#hero-lanyard-slot /
// #about-lanyard-slot) that serves purely as a position reference.
//
// The card has two "homes" and is at rest — position:absolute, scrolling with
// the page like ordinary content — in one of them at any time:
// - Hero: hanging from above the fold, cropped by HERO_CLIP.
// - About: hanging off the divider line above the section (the placeholder
//   there is anchored to that border; see AboutSection.module.css).
// It switches homes at a scroll position where both are comfortably off-screen
// (see `handoff` below), so the card simply scrolls out of Hero and later
// scrolls back into view in About, with the swap never visible. Nothing is
// pinned or animated: scroll past About and it just keeps scrolling away.
//
// The one exception is the click: the card switches to position:fixed and
// rides the scroll down to About, X held constant (Hero and About share the
// same --tweak-lanyard-x, so it's already correct) while Y eases from Hero's
// click-time spot to About's resting spot over the same duration as the
// scroll itself — the two homes sit at slightly different heights by design
// (Hero's is lower, to look right on an otherwise-empty page; About's sits
// right at the divider line), so animating Y avoids a pop at the end.
export function PortfolioLanyard({ lang }: { lang: string }) {
  const [mounted, setMounted] = useState(false);
  const [renderState, setRenderState] = useState<RenderState>('restingHero');
  const renderStateRef = useRef<RenderState>('restingHero');
  // How much of the box's own top (in its local, pre-transform pixels) sits
  // above the About divider line — the box is free to be tuned (via the
  // --tweak-about-lanyard-y offset) well above that line so the card lands at
  // a nice height, but nothing should render above the line itself. Kept in
  // state (rather than set imperatively) so it can't be clobbered by a React
  // re-render resetting the clipPath style between updates.
  const [aboutClip, setAboutClip] = useState(0);
  const aboutClipRef = useRef(0);
  const mountRef = useRef<HTMLDivElement>(null);
  const transiting = useRef(false);
  const clickFixedPos = useRef({ x: 0, y: 0 });
  const transitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lets the click handler (which lives outside the effect, since it's passed
  // down as a prop) drive the same positioning logic the scroll listener uses.
  const applyPositionRef = useRef<((force?: boolean) => void) | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), HERO_ANIM_MIDPOINT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = mountRef.current;
    const main = document.querySelector('main');
    if (!el || !main) return;

    const setRenderStateIfChanged = (next: RenderState) => {
      if (renderStateRef.current !== next) {
        renderStateRef.current = next;
        setRenderState(next);
      }
    };

    const restAt = (slotId: string) => {
      const slot = document.getElementById(slotId);
      if (!slot) return;
      const slotRect = slot.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      el.style.position = 'absolute';
      el.style.top = `${slotRect.top - mainRect.top}px`;
      el.style.left = `${slotRect.left - mainRect.left}px`;
      el.style.width = `${slotRect.width}px`;
      el.style.height = `${slotRect.height}px`;

      // The About slot is free-floated well above the section (see
      // AboutSection.module.css) so the card itself can land at a nice height,
      // but the strap above it would then run past the divider line into
      // whatever section is above. Clip exactly the slice of the box that
      // lies above that line — both rects are read in the same tick so
      // scroll position cancels out, and this stays correct across live
      // DevTweak edits to the y-offset since it's re-measured, not computed
      // from the offset value itself.
      if (slotId === 'about-lanyard-slot') {
        const section = document.getElementById('about');
        const lineTop = section ? section.getBoundingClientRect().top : slotRect.top;
        const clip = Math.max(0, Math.round(lineTop - slotRect.top));
        if (aboutClipRef.current !== clip) {
          aboutClipRef.current = clip;
          setAboutClip(clip);
        }
      }
    };

    // Scroll position at which the card swaps homes. Picked so that neither
    // home is on screen at that moment: the About box is still one full
    // viewport below, and Hero's is far above (two whole sections separate
    // them, so there's a wide window to choose from). The Math.max keeps that
    // true on absurdly tall viewports, where a viewport-height lead time would
    // otherwise reach back up into Hero while its card is still visible.
    const handoffPoint = () => {
      const aboutSlot = document.getElementById('about-lanyard-slot');
      const heroSlot = document.getElementById('hero-lanyard-slot');
      if (!aboutSlot || !heroSlot) return null;
      const scrollY = window.scrollY;
      const aboutTop = aboutSlot.getBoundingClientRect().top + scrollY;
      const heroRect = heroSlot.getBoundingClientRect();
      const heroBottom = heroRect.bottom + scrollY;
      return Math.max(aboutTop - window.innerHeight, heroBottom);
    };

    let handoff = handoffPoint();

    // `force` re-reads the anchors and repositions even when the state hasn't
    // changed — for resizes and live DevTweak edits. Plain scroll ticks skip
    // that: a resting card is positioned in document coordinates, so it needs
    // no per-frame work, only the boundary check.
    const applyPosition = (force = false) => {
      if (force) handoff = handoffPoint();

      if (transiting.current) {
        setRenderStateIfChanged('transit');
        el.style.position = 'fixed';
        el.style.left = `${clickFixedPos.current.x}px`;
        // top is intentionally left alone here — the Y-tween in handleClick
        // owns it exclusively for the duration of the transit.
        return;
      }

      if (handoff === null) return;
      const next: RenderState =
        window.scrollY < handoff ? 'restingHero' : 'restingAbout';
      const changed = renderStateRef.current !== next;
      setRenderStateIfChanged(next);
      if (changed || force) {
        restAt(next === 'restingHero' ? 'hero-lanyard-slot' : 'about-lanyard-slot');
      }
    };

    applyPositionRef.current = applyPosition;
    applyPosition(true);

    const onScroll = () => applyPosition();
    const onResize = () => applyPosition(true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const devInterval =
      process.env.NODE_ENV !== 'production'
        ? setInterval(() => applyPosition(true), 500)
        : null;
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (devInterval) clearInterval(devInterval);
      if (transitTimer.current) clearTimeout(transitTimer.current);
      applyPositionRef.current = null;
    };
  }, [mounted]);

  const handleClick = () => {
    // Clicking the card once it's in About (or mid-transit) is just a flip —
    // only the Hero-side click takes you anywhere.
    if (transiting.current || renderStateRef.current !== 'restingHero') return;

    const el = mountRef.current;
    const about = document.getElementById('about');
    const aboutSlot = document.getElementById('about-lanyard-slot');
    if (!el || !about || !aboutSlot) return;

    const rect = el.getBoundingClientRect();
    // Where the card should be on screen once the scroll below finishes.
    // aboutSlot's rect relative to about's own rect is scroll-invariant (both
    // read in the same tick), and the scroll always ends with about's top at
    // exactly 0 (offsetY:0, see below) — so that delta already *is* the final
    // on-screen Y, without needing to wait for the scroll to actually land.
    const targetY = aboutSlot.getBoundingClientRect().top - about.getBoundingClientRect().top;

    clickFixedPos.current = { x: rect.left, y: rect.top };
    el.style.top = `${rect.top}px`;
    transiting.current = true;
    // Pin to the current screen spot before the scroll starts, so the card
    // doesn't drift for even one frame; top stays under the Y-tween's control
    // below, not this call's (see the transit branch in applyPosition).
    applyPositionRef.current?.();

    const yState = { y: rect.top };

    const endTransit = () => {
      if (transitTimer.current) {
        clearTimeout(transitTimer.current);
        transitTimer.current = null;
      }
      transiting.current = false;
      yTween.kill();
      // Drops the card into its About home (position:absolute, document
      // coordinates) — the Y-tween above only ever drove an on-screen
      // approximation of that, so this also settles any rounding drift.
      applyPositionRef.current?.(true);
    };

    transitTimer.current = setTimeout(endTransit, TRANSIT_TIMEOUT_MS);

    // Two independent tweens sharing duration+ease rather than one timeline —
    // GSAP's ticker updates both in the same animation frame regardless, so
    // they stay in lockstep either way, and autoKill below only ever needs to
    // reach into the scrollTo tween.
    const yTween = gsap.to(yState, {
      y: targetY,
      duration: SCROLL_DURATION,
      ease: 'power2.inOut',
      onUpdate: () => {
        el.style.top = `${yState.y}px`;
      },
    });

    gsap.to(window, {
      // offsetY:0 — the header (position:fixed) hides itself on scroll-down
      // (see SiteHeader), so by the time this lands there's nothing to
      // reserve room for; the section's top border ends up flush with the
      // viewport's top edge rather than short of it.
      scrollTo: { y: about, autoKill: true },
      duration: SCROLL_DURATION,
      ease: 'power2.inOut',
      onComplete: endTransit,
      // autoKill fires this when the visitor takes the scroll back mid-flight.
      onInterrupt: endTransit,
    });
  };

  if (!mounted) return null;

  return (
    <div
      ref={mountRef}
      className={styles.mount}
      style={{
        // The transit holds Hero's exact screen position, so it keeps Hero's
        // crop too — the cut line stays put at the top of the viewport. In
        // About, aboutClip hides whatever slice of the box sits above the
        // divider line (see restAt) instead of a flat fraction like Hero's.
        clipPath: renderState === 'restingAbout' ? `inset(${aboutClip}px 0 0 0)` : HERO_CLIP,
        // 1 at rest, above AboutSection's own content (which has no z-index of
        // its own) — the card hangs in front of the bio text and tech grid
        // alike, like a physical object would. 50 only during the transit, so
        // it visibly passes over ProjectTimeline/ServicesSection content too.
        zIndex: renderState === 'transit' ? 50 : 1,
        // Only blocked while passing over other sections' content — dragging
        // and flipping stay available at rest in either home.
        pointerEvents: renderState === 'transit' ? 'none' : 'auto',
      }}
    >
      <LanyardReactBits
        backImage="/lanyard/face-photo.jpg"
        dragCeilingFraction={0.15}
        lang={lang === 'en' ? 'en' : 'pl'}
        onFlipClick={handleClick}
      />
    </div>
  );
}
