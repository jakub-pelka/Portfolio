import React from 'react';
import styles from './Editorial.module.css';

interface TerminalCardProps {
  title: string;
  status?: string;
  children: React.ReactNode;
}

export function TerminalCard({ title, status, children }: TerminalCardProps) {
  return (
    <div className={styles.terminalCard}>
      <div className={styles.halftoneBg} />
      
      <div className={styles.terminalCardContent}>
        <div className={styles.terminalTitle}>
          {status === 'active' && <span className={styles.terminalStatus}></span>}
          {title}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
