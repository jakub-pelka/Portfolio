'use client';

import { useRef, type ReactNode } from 'react';
import { useParallax, type ParallaxOptions } from '@/lib/motion/useParallax';

interface ParallaxProps extends ParallaxOptions {
  children: ReactNode;
  /** Id stałego elementu zewnętrznego (np. cel kotwicy, który się nie przesuwa). */
  id?: string;
  /** Klasa stałego elementu zewnętrznego (punkt odniesienia). */
  className?: string;
  /** Klasa przesuwanego elementu wewnętrznego. */
  innerClassName?: string;
}

/**
 * Mały klient opakowujący dzieci (mogą być serwerowe) delikatną paralaksą ze scrolla.
 * Szczegóły trybów i wartości: `useParallax`.
 */
export function Parallax({ children, id, className, innerClassName, ...options }: ParallaxProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useParallax(outer, inner, options);
  return (
    <div ref={outer} id={id} className={className}>
      <div ref={inner} className={innerClassName}>
        {children}
      </div>
    </div>
  );
}
