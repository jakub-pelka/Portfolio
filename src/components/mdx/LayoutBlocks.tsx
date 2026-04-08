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

export function ReadingFooter({ nextProject, link }: { nextProject: string; link: string }) {
  return (
    <section className={styles.readingFooter}>
      <span className={styles.readingFooterLabel}>CONTINUE_READING</span>
      <a href={link} className={styles.readingFooterTitle}>
        _{nextProject}
      </a>
      <span className={styles.readingFooterHint}>[ CLICK TO NAVIGATE ]</span>
    </section>
  );
}
