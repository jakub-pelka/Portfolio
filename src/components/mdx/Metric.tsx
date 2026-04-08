import React from 'react';
import styles from './Editorial.module.css';

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.metricGrid}>
      {children}
    </div>
  );
}

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  );
}
