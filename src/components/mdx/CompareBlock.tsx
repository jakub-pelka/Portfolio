'use client';

import styles from './Editorial.module.css';
import React, { createContext, useContext } from 'react';

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

const CompareContext = createContext({ beforeLabel: 'BEFORE', afterLabel: 'AFTER' });

export function CompareBlock({
  children,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
}: CompareBlockProps) {
  return (
    <CompareContext.Provider value={{ beforeLabel, afterLabel }}>
      <div className={styles.compareBlock}>
        <div className={styles.compareHeader}>
          <span className={styles.compareHeaderLabel} />
          <span className={styles.compareHeaderBefore}>{beforeLabel}</span>
          <span className={styles.compareHeaderAfter}>{afterLabel}</span>
        </div>
        {children}
      </div>
    </CompareContext.Provider>
  );
}

export function CompareRow({ label, before, after }: CompareRowProps) {
  const { beforeLabel, afterLabel } = useContext(CompareContext);
  return (
    <div className={styles.compareRow}>
      <span className={styles.compareRowLabel}>{label}</span>
      <span className={styles.compareRowBefore} data-before-label={beforeLabel}>{before}</span>
      <span className={styles.compareRowAfter} data-after-label={afterLabel}>{after}</span>
    </div>
  );
}
