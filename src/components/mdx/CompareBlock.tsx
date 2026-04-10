import styles from './Editorial.module.css';
import React from 'react';

interface CompareBlockProps {
  children: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}

interface CompareRowProps {
  label: string;
  before: string;
  after: string;
}

export function CompareBlock({
  children,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
}: CompareBlockProps) {
  return (
    <div className={styles.compareBlock}>
      <div className={styles.compareHeader}>
        <span className={styles.compareHeaderLabel} />
        <span className={styles.compareHeaderBefore}>{beforeLabel}</span>
        <span className={styles.compareHeaderAfter}>{afterLabel}</span>
      </div>
      {children}
    </div>
  );
}

export function CompareRow({ label, before, after }: CompareRowProps) {
  return (
    <div className={styles.compareRow}>
      <span className={styles.compareRowLabel}>{label}</span>
      <span className={styles.compareRowBefore}>{before}</span>
      <span className={styles.compareRowAfter}>{after}</span>
    </div>
  );
}
