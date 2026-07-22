'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import gsap from 'gsap';
import styles from './LanyardCssCard.module.css';

const STAGE_WIDTH = 360;
const ANCHOR_Y = 26;
const ROPE_LENGTH = 210;
const MAX_ROTATE_Y = 34;
const MAX_ROTATE_X = 20;
const MAX_ROTATE_Z = 26;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

interface DragState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface LanyardCssCardProps {
  imageUrl?: string;
  label?: string;
}

export function LanyardCssCard({ imageUrl, label = 'PLACEHOLDER' }: LanyardCssCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<SVGPathElement>(null);
  const dragging = useRef(false);
  const state = useRef<DragState>({ x: 0, y: 0, vx: 0, vy: 0 });
  const lastSample = useRef({ x: 0, y: 0, t: 0 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const applyTransform = useCallback(() => {
    const card = cardRef.current;
    const rope = ropeRef.current;
    const { x, y, vx, vy } = state.current;

    const rotateY = dragging.current
      ? clamp(vx * 0.045, -MAX_ROTATE_Y, MAX_ROTATE_Y)
      : clamp(x * 0.12, -MAX_ROTATE_Y, MAX_ROTATE_Y);
    const rotateX = dragging.current
      ? clamp(-vy * 0.03, -MAX_ROTATE_X, MAX_ROTATE_X)
      : clamp(-y * 0.05, -MAX_ROTATE_X, MAX_ROTATE_X);
    const rotateZ = clamp(x * 0.09, -MAX_ROTATE_Z, MAX_ROTATE_Z);

    if (card) {
      gsap.set(card, { x, y, rotateX, rotateY, rotateZ });
    }

    if (rope) {
      const anchorX = STAGE_WIDTH / 2;
      const attachX = anchorX + x;
      const attachY = ANCHOR_Y + ROPE_LENGTH + y;
      const midX = (anchorX + attachX) / 2;
      const midY = (ANCHOR_Y + attachY) / 2;
      const sag = Math.max(6, 22 - Math.abs(x) * 0.25);
      rope.setAttribute('d', `M ${anchorX} ${ANCHOR_Y} Q ${midX} ${midY + sag} ${attachX} ${attachY}`);
    }
  }, []);

  useEffect(() => {
    applyTransform();
  }, [applyTransform]);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      tweenRef.current?.kill();
      dragging.current = true;
      lastSample.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      if (cardRef.current) cardRef.current.style.cursor = 'grabbing';
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const now = performance.now();
      const dt = Math.max((now - lastSample.current.t) / 1000, 1 / 144);
      const dx = e.clientX - lastSample.current.x;
      const dy = e.clientY - lastSample.current.y;

      state.current.x += dx;
      state.current.y += dy;
      state.current.vx = dx / dt;
      state.current.vy = dy / dt;

      lastSample.current = { x: e.clientX, y: e.clientY, t: now };
      applyTransform();
    },
    [applyTransform]
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      (e.target as Element).releasePointerCapture(e.pointerId);
      dragging.current = false;
      if (cardRef.current) cardRef.current.style.cursor = 'grab';

      const speed = Math.hypot(state.current.vx, state.current.vy);
      const amplitude = clamp(1 + speed / 900, 1, 2.4);
      const period = clamp(0.42 - speed / 6000, 0.16, 0.42);

      tweenRef.current = gsap.to(state.current, {
        x: 0,
        y: 0,
        duration: 1.3,
        ease: `elastic.out(${amplitude}, ${period})`,
        onUpdate: applyTransform,
        onComplete: () => {
          state.current.vx = 0;
          state.current.vy = 0;
          applyTransform();
        },
      });
    },
    [applyTransform]
  );

  return (
    <div className={styles.stage}>
      <svg className={styles.rope} viewBox={`0 0 ${STAGE_WIDTH} 480`}>
        <path ref={ropeRef} stroke="var(--color-text)" strokeWidth={2} fill="none" opacity={0.55} />
      </svg>
      <div className={styles.clip} />
      <div
        ref={cardRef}
        className={styles.card}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className={styles.cardFace}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.cardImage} src={imageUrl} alt="" draggable={false} />
          ) : (
            <>
              <span className={styles.placeholderLabel}>[ {label} ]</span>
              <span className={styles.placeholderHint}>SWAP VIA imageUrl PROP</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
