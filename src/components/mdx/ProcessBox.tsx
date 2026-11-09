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
    <div className="jp-web-card">
      <h3 className="jp-web-card__title">{title}</h3>
      <div className={`jp-web-card__text ${styles.cardText}`}>{children}</div>
    </div>
  );
}
