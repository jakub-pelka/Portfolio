import React from 'react';
import styles from './Editorial.module.css';

interface OutcomeBannerProps {
  statusTag?: string;
  children: React.ReactNode;
}

export function OutcomeBanner({ statusTag, children }: OutcomeBannerProps) {
  return (
    <div className={styles.outcomeBanner}>
      <div className={styles.halftoneBg} />
      
      <div className={styles.outcomeContent}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ maxWidth: '48rem' }}>
            <h2 className={styles.outcomeTitle}>Outcome</h2>
            <div className={styles.outcomeText}>
              {children}
            </div>
          </div>
        </div>

        {statusTag && (
          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-start' }}>
            <div className={styles.outcomeTag}>
              <span aria-hidden="true">✓</span>
              {statusTag}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
