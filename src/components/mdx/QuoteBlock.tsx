import React from 'react';
import styles from './Editorial.module.css';

export function QuoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className={styles.quoteBlock}>
      <span className={styles.quoteMark} aria-hidden="true">*</span>
      {children}
    </blockquote>
  );
}
