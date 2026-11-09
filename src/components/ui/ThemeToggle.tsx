'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const emptySubscribe = () => () => {};

interface ThemeToggleProps {
  labels?: {
    toggle_dark: string;
    toggle_light: string;
  };
}

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
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

export function ThemeToggle({ labels }: ThemeToggleProps = {}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) return <div className="jp-web-header__theme" aria-hidden="true" />;

  const isDark = resolvedTheme === 'dark';
  const label = isDark
    ? (labels?.toggle_light ?? 'Switch to light mode')
    : (labels?.toggle_dark ?? 'Switch to dark mode');

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      className="jp-web-header__theme"
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
          {isDark ? <MoonIcon /> : <SunIcon />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
