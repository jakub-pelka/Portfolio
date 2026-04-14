'use client';

import { useState } from 'react';
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

export function CopyForAI({ projects, lang }: CopyForAIProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const md = buildMarkdown(projects, lang);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        onClick={handleCopy}
        title="Copy portfolio data for AI"
      >
        {copied ? '[ COPIED ✓ ]' : '[ COPY FOR AI ]'}
      </button>
    </div>
  );
}
