'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { MotionConfig } from 'framer-motion';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
    >
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </NextThemesProvider>
  );
}
