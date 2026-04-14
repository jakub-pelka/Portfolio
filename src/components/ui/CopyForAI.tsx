'use client';

import { useState, useEffect } from 'react';
import type { ProjectWithLocale } from '@/lib/types/project';
import type { Locale } from '@/i18n/config';
import styles from './CopyForAI.module.css';

interface CopyForAIProps {
  projects: ProjectWithLocale[];
  lang: Locale;
}

function buildMarkdown(projects: ProjectWithLocale[], lang: Locale): string {
  const lines: string[] = [
    '# Jakub Pełka — Portfolio',
    '',
    'Full-stack developer & designer. Building systems that solve real problems.',
    '',
    '---',
    '',
  ];

  for (const { meta, content } of projects) {
    const year = new Date(meta.date).getFullYear();
    lines.push(`## ${content.title} (${year})`);
    lines.push('');
    lines.push(content.description);
    lines.push('');
    lines.push(`**Stack:** ${meta.tags.join(', ')}`);
    lines.push(`**Status:** ${meta.status}`);

    if (content.process.length > 0) {
      lines.push('');
      lines.push('**Key moments:**');
      for (const entry of content.process) {
        lines.push(`- [${entry.type.toUpperCase()}] ${entry.title}: ${entry.content}`);
      }
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

const BASE_BOTTOM = 32; // 2rem

export function CopyForAI({ projects, lang }: CopyForAIProps) {
  const [copied, setCopied] = useState(false);
  const [bottom, setBottom] = useState(BASE_BOTTOM);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const update = () => {
      const footerRect = footer.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // How many px of footer are visible from the bottom of the viewport
      const overlap = viewportH - footerRect.top;
      if (overlap > 0) {
        setBottom(BASE_BOTTOM + overlap);
      } else {
        setBottom(BASE_BOTTOM);
      }
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleCopy = async () => {
    const md = buildMarkdown(projects, lang);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={styles.btn}
      style={{ bottom }}
      onClick={handleCopy}
      title="Copy portfolio data for AI"
    >
      {copied ? '[ COPIED ✓ ]' : '[ COPY FOR AI ]'}
    </button>
  );
}
