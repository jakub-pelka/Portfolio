import React from 'react';
import styles from './Editorial.module.css';

export function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.metaLabel} style={{ marginBottom: "0.5rem" }}>
        [ {num} ]
      </span>
      <h2>{title}</h2>
    </div>
  );
}
