'use client';

import { useEffect, useState } from 'react';
import type { ProjectSection } from '@/lib/projects/sections';
import styles from './SectionNav.module.css';

interface SectionNavProps {
  sections: ProjectSection[];
  label: string;
  ariaLabel: string;
}

/** Spis sekcji projektu: kotwice do <SectionHeader>, podświetla sekcję w widoku. */
export function SectionNav({ sections, label, ariaLabel }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    if (sections.length === 0) return;
    const update = () => {
      const threshold = window.innerHeight * 0.35;
      let current = sections[0].id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= threshold) current = section.id;
      }
      setActiveId(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      <div className={styles.label}>{label}</div>
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`${styles.link} ${active ? styles.active : ''}`}
            aria-current={active ? 'location' : undefined}
          >
            <span className={styles.tick} aria-hidden="true" />
            <span>{section.num} {section.title}</span>
          </a>
        );
      })}
    </nav>
  );
}
