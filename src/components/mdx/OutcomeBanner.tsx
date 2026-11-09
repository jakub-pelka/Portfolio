import React from 'react';
import styles from './Editorial.module.css';

interface OutcomeBannerProps {
  statusTag?: string;
  /** Etykieta karty (np. "$ EFEKT"); strona projektu podaje wersję językową. */
  label?: string;
  /** Zachowane dla zgodności z MDX; gdy podane, zastępuje etykietę. */
  title?: string;
  githubUrl?: string;
  liveUrl?: string;
  children: React.ReactNode;
}

export function OutcomeBanner({ statusTag, label = '$ OUTCOME', title, githubUrl, liveUrl, children }: OutcomeBannerProps) {
  return (
    <div className={`jp-web-card jp-web-card--term ${styles.outcomeBanner}`}>
      <div className={styles.outcomeMain}>
        <span className="jp-web-card__label">{title ?? label}</span>
        <div className={styles.outcomeText}>{children}</div>
      </div>

      {(statusTag || githubUrl || liveUrl) && (
        <div className={styles.outcomeFooter}>
          {statusTag && <span className={styles.outcomeStatus}>[ {statusTag} ]</span>}
          <div className={styles.outcomeLinks}>
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={styles.outcomeLink}>
                [ GITHUB → ]
              </a>
            )}
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={styles.outcomeLink}>
                [ LAUNCH_PROJECT → ]
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
