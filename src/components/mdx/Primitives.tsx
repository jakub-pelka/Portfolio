import React from 'react';
import styles from './Editorial.module.css';

/** Single technology/category tag */
export function Tag({ children }: { children: string }) {
  return (
    <span className={styles.tagItem}>{children}</span>
  );
}

/** Horizontal list of tags */
export function TagList({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.tagList}>{children}</div>
  );
}

/** Label + value row — used inside TerminalCard or standalone */
export function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={styles.metaLabel}>{label}</span>
      <div className={styles.metaRowValue}>{children}</div>
    </div>
  );
}
