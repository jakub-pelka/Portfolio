import React from 'react';
import styles from './Editorial.module.css';

interface ProcessCardProps {
  title: string;
  type: 'INSIGHT' | 'DECISION' | 'PROBLEM';
  children: React.ReactNode;
}

export function ProcessCard({ title, type, children }: ProcessCardProps) {
  // Border is tied to primary highlight or plain border based on type.
  const isInsight = type === 'INSIGHT';
  const borderColorValue = isInsight ? 'var(--project-highlight)' : 'var(--color-border)';
  const labelBgValue = isInsight ? 'var(--project-highlight)' : 'var(--color-bg-secondary)';

  return (
    <div className={styles.processCard} style={{ borderLeft: `4px solid ${borderColorValue}` }}>
      <div className={styles.processCardHeader}>
        <span 
          className={styles.processCardType}
          style={{ backgroundColor: `color-mix(in srgb, ${labelBgValue} 20%, transparent)` }}
        >
          [ {type} ]
        </span>
        <span className={styles.processCardTitle}>{title}</span>
      </div>
      
      <div className={styles.processCardBody}>
        {children}
      </div>
    </div>
  );
}
