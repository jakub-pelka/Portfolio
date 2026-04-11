'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SunIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
  </svg>
);

const iconVariants = {
  enter: (isDark: boolean) => ({
    opacity: 0,
    rotate: isDark ? -90 : 90,
    scale: 0.5,
  }),
  center: {
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  exit: (isDark: boolean) => ({
    opacity: 0,
    rotate: isDark ? 90 : -90,
    scale: 0.5,
  }),
};

function ToggleButton({ size }: { size: number }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: size, height: size }} />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'currentColor',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
        transition: 'opacity 150ms ease',
        position: 'relative',
        width: size + 8,
        height: size + 8,
        overflow: 'hidden',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" custom={isDark}>
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          custom={isDark}
          variants={iconVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isDark ? <MoonIcon size={size} /> : <SunIcon size={size} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

export function ThemeTogglePreview() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ fontFamily: 'var(--font-vt323)', opacity: 0.5, fontSize: '0.75rem' }}>
        [ TOGGLE — {mounted ? (resolvedTheme === 'dark' ? 'DARK' : 'LIGHT') : '...'} ]
      </div>

      {/* Sam przycisk — duży */}
      <ToggleButton size={24} />

      {/* Podgląd w kontekście headera */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '1px solid var(--color-border)',
        padding: '0.5rem 1rem',
        fontFamily: 'var(--font-ibm-plex-mono)',
        fontSize: '0.75rem',
      }}>
        <span style={{ opacity: 0.5 }}>← BACK</span>
        <span style={{ flex: 1, textAlign: 'center', opacity: 0.4 }}>JP</span>
        <span style={{ opacity: 0.5 }}>PL / EN</span>
        <ToggleButton size={14} />
      </div>
    </div>
  );
}
