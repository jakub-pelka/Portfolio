'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// To ensure perfectly smooth SVG morphing in Framer Motion, 
// using the same command types (M and L) works best.
const PROJECT_PATHS = [
  // Icon 1: Lightning bolt (translated to pure L commands instead of H/V)
  "M6 0 L3 5 L5 5 L4 10 L8 4 L5.5 4 Z",
  // Icon 2: Diamond
  "M5 0 L10 5 L5 10 L0 5 Z",
  // Icon 3: Arrow/cursor
  "M1 0 L1 8 L3.5 5.5 L6 10 L7.5 9 L5 4.5 L8 4.5 Z",
];

// A basic square with extra anchor points on the edges 
// to give the morphing engine a smoother shape to distribute the nodes around.
const SQUARE_PATH = "M0 0 L5 0 L10 0 L10 5 L10 10 L5 10 L0 10 L0 5 Z";

// Shared sizes — single source of truth
const BUTTON_SIZE = 22;
const INNER_SIZE = 10;
const ICON_SIZE = 14;
const BORDER_WIDTH = 2;

function IndicatorRow({ scale, revealed, activeIndex, onSelect, speed = 1, rowId }: {
  scale: number;
  revealed: boolean;
  activeIndex: number;
  onSelect: (idx: number) => void;
  speed?: number;
  rowId: string;
}) {
  return (
    <div style={{ display: 'flex', gap: `calc(var(--space-3) * ${scale})`, alignItems: 'center' }}>
      {[0, 1, 2].map(idx => {
        const isActive = activeIndex === idx;

        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            style={{
              width: BUTTON_SIZE * scale,
              height: BUTTON_SIZE * scale,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text)'
            }}
          >
            {/* The MAGIC of Framer Motion: Floating Active Frame using layoutId */}
            {isActive && (
              <motion.div
                layoutId={`active-frame-${rowId}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: `${BORDER_WIDTH * scale}px solid var(--color-text)`,
                }}
                initial={false}
                animate={{ 
                  scale: 1, 
                  opacity: revealed ? 0 : 1 
                }}
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 400 * (1 / speed),
                    damping: 30 * (1 / speed)
                  },
                  scale: { duration: 0.3 * speed, ease: [0.34, 1.56, 0.64, 1] },
                  opacity: { duration: 0.3 * speed }
                }}
              />
            )}

            {/* Inactive frames just sit there shrunken */}
            {!isActive && (
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: `${BORDER_WIDTH * scale}px solid var(--color-text)`,
                }}
                initial={false}
                animate={{ 
                  scale: 0.55, 
                  opacity: revealed ? 0 : 1 
                }}
                transition={{ 
                  duration: 0.3 * speed, 
                  ease: [0.34, 1.56, 0.64, 1] 
                }}
              />
            )}

            {/* Organic Morphing: A single SVG that shifts both its width/height and internal 'd' path! */}
            <motion.svg
              viewBox="0 0 10 10"
              style={{
                position: 'absolute',
                // Keep dimensions fixed initially and let Framer animate changes natively via layout or direct properties
              }}
              initial={false}
              animate={{
                // Scale the container boundaries slightly from default square to the larger icon area
                width: revealed ? ICON_SIZE * scale : INNER_SIZE * scale,
                height: revealed ? ICON_SIZE * scale : INNER_SIZE * scale,
                rotate: revealed ? 360 : 0
              }}
              transition={{
                duration: 0.5 * speed, 
                ease: [0.34, 1.56, 0.64, 1],
                delay: revealed ? (idx * 0.08) * speed : 0
              }}
            >
              <motion.path
                fill="currentColor"
                initial={false}
                animate={{
                  // The actual shape morphs from a square to an icon
                  d: revealed ? PROJECT_PATHS[idx] : SQUARE_PATH
                }}
                transition={{
                  duration: 0.5 * speed, 
                  ease: [0.34, 1.56, 0.64, 1],
                  delay: revealed ? (idx * 0.08) * speed : 0
                }}
              />
            </motion.svg>
          </button>
        );
      })}
    </div>
  );
}

export function IndicatorMorph() {
  const [revealed, setRevealed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slow, setSlow] = useState(false);

  const speed = slow ? 3 : 1;

  // Easter egg trigger: reveal after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          className="font-vt"
          onClick={() => setRevealed(r => !r)}
          style={{
            fontSize: 'var(--text-micro)',
            opacity: 0.5,
            border: '1px solid var(--color-text)',
            padding: '2px 8px',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--color-text)'
          }}
        >
          [ {revealed ? 'RESET' : 'REVEAL'} ]
        </button>
        <button
          className="font-vt"
          onClick={() => { setSlow(s => !s); if (revealed) setRevealed(false); }}
          style={{
            fontSize: 'var(--text-micro)',
            opacity: slow ? 1 : 0.5,
            border: '1px solid var(--color-text)',
            padding: '2px 8px',
            cursor: 'pointer',
            background: slow ? 'var(--color-text)' : 'transparent',
            color: slow ? 'var(--color-bg)' : 'var(--color-text)'
          }}
        >
          [ SLOW ]
        </button>
      </div>

      {/* 1x original scale */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div className="font-vt" style={{ fontSize: 'var(--text-micro)', opacity: 0.4 }}>[ 1x ]</div>
        <IndicatorRow scale={1} revealed={revealed} activeIndex={activeIndex} onSelect={setActiveIndex} speed={speed} rowId="row1" />
      </div>

      {/* 3x zoomed */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div className="font-vt" style={{ fontSize: 'var(--text-micro)', opacity: 0.4 }}>[ 3x ]</div>
        <IndicatorRow scale={3} revealed={revealed} activeIndex={activeIndex} onSelect={setActiveIndex} speed={speed} rowId="row2" />
      </div>

      {/* State label */}
      <div className="font-vt" style={{ fontSize: 'var(--text-micro)', opacity: 0.4 }}>
        {revealed ? '[ ICONS_REVEALED ]' : '[ WAITING... ]'}{slow ? ' — SLOW MODE' : ''}
      </div>
    </div>
  );
}
