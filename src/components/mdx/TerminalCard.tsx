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
  return (
    <div className={dense ? `${styles.terminalCard} ${styles.dense}` : styles.terminalCard}>
      <div className={styles.halftoneBg} />

      <div
        className={styles.terminalCardContent}
        style={{ display: 'flex', flexDirection: 'column', gap: dense ? 'var(--tweak-card-row-gap, 0.85rem)' : '1.5rem' }}
      >
        <div className={styles.terminalTitle}>
          {status === 'active' && <span className={styles.terminalStatus}></span>}
          {title}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: dense ? 'var(--tweak-card-row-gap, 0.85rem)' : '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
