import React from 'react';
import styles from './Editorial.module.css';

interface TerminalCardProps {
  title: string;
  status?: string;
  children: React.ReactNode;
  /** Tighter padding, title margin, and row gap — for content-dense grids
   *  (e.g. the homepage About/Services cards). Default keeps the roomy look. */
  dense?: boolean;
}

export function TerminalCard({ title, status, children, dense = false }: TerminalCardProps) {
  const gap = dense ? 'var(--tweak-card-row-gap, 0.85rem)' : 'var(--space-1_5)';
  return (
    <div className={`jp-web-card jp-web-card--term ${styles.terminalCard} ${dense ? styles.dense : ''}`.trim()}>
      <div className={styles.terminalCardContent} style={{ gap }}>
        <div className={styles.terminalTitle}>
          {status === 'active' && <span className={styles.terminalStatus} aria-hidden="true"></span>}
          {title}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
          {children}
        </div>
      </div>
    </div>
  );
}
