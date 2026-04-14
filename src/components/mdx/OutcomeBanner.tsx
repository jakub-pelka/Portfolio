import React from 'react';
import styles from './Editorial.module.css';

interface OutcomeBannerProps {
  statusTag?: string;
  title?: string;
  githubUrl?: string;
  liveUrl?: string;
  children: React.ReactNode;
}

export function OutcomeBanner({ statusTag, title = 'Outcome', githubUrl, liveUrl, children }: OutcomeBannerProps) {
  return (
    <div className={styles.outcomeBanner}>
      <div className={styles.halftoneBg} />

      <div className={styles.outcomeContent}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 className={styles.outcomeTitle}>{title}</h2>
            <div className={styles.outcomeText}>
              {children}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {statusTag && (
            <span className={styles.outcomeLabel}>
              {statusTag}
            </span>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.outcomeLink}
            >
              [ GITHUB → ]
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.outcomeLink}
            >
              [ LAUNCH_PROJECT → ]
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
