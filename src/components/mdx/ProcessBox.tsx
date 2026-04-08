import React from 'react';
import styles from './Editorial.module.css';

export function BoxGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.boxGrid}>
      {children}
    </div>
  );
}

export function ProcessBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.processBox}>
      <h4>{title}</h4>
      <div className={styles.processBoxContent}>{children}</div>
    </div>
  );
}
