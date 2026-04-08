import React from 'react';
import Link, { LinkProps } from 'next/link';

type BaseProps = {
  /**
   * Wariant systemu przycisków na podstawie klas z globals.css
   * - 'default': standardowy ghost button 1px border
   * - 'v2': wariant z inset shadow i przyciemnieniem tła
   * - 'v3': wąskie zaciskające się nawiasy bez bordera
   * - 'v4': szerokie zaciskające się nawiasy bez bordera
   */
  variant?: 'default' | 'v2' | 'v3' | 'v4';
  /**
   * Czysty tekst przycisku, na podstawie którego system sam
   * nałoży dublowaną warstwę tekstu (bold) oraz nawiasy (w CSS)
   */
  children: string;
  className?: string;
  /**
   * W przypadku wariantów default i v2, CSS nie dodaje nawiasów z automatu.
   * Ustaw na true, jeśli sam w stringu podajesz nawiasy (np. "[ KLIKNIJ ]")
   * dla v3 i v4 jest to ignorowane.
   */
  rawText?: boolean;
};

type ButtonAsButton = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
  href?: never;
};

type ButtonAsLink = BaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & LinkProps & {
  href: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Ujednolicony przycisk systemowy posiadający wbudowaną animację 
 * i wyostrzenie (duplikacja warstwy textowej) bez layout-shiftu.
 */
export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ variant = 'v3', rawText = false, className = '', children, ...props }, ref) => {
    // Konstruujemy klasę (uwzględniamy wariant)
    const combinedClassName = `btn-system ${variant !== 'default' ? variant : ''} ${className}`.trim();
    
    // System V3 i V4 dokłada nawiasy automatycznie w CSS (::before/::after).
    // Dla wariantów default i v2, jeśli chcesz nawiasy, możesz opakować tekst,
    // o ile programista nie przekazał "rawText" z własnymi nawiasami [ ].
    const needsManualBrackets = (variant === 'default' || variant === 'v2') && !rawText;
    const finalContent = needsManualBrackets ? `[ ${children} ]` : children;

    // Generujemy dual-layer content - co zapobiega skakaniu szerokości na hover
    const content = (
      <>
        <span className="btn-label">{finalContent}</span>
        <span className="btn-label-bold" aria-hidden="true">{finalContent}</span>
      </>
    );

    // Renderujemy Link z Next.js
    if ('href' in props && props.href) {
      return (
        <Link 
          {...(props as ButtonAsLink)} 
          className={combinedClassName} 
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        >
          {content}
        </Link>
      );
    }

    // Albo standardowy button
    return (
      <button 
        {...(props as ButtonAsButton)} 
        className={combinedClassName} 
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
