import React from 'react';
import styles from './Editorial.module.css';

export function SplitLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.splitLayout}>{children}</div>;
}

export function ContentLeft({ children }: { children: React.ReactNode }) {
  return <div className={styles.mainColumn}>{children}</div>;
}

export function ContentRight({ children }: { children: React.ReactNode }) {
  return <div className={styles.sideColumn}>{children}</div>;
}
