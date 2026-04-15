'use client';

import { useState, useEffect } from 'react';
import type { ProjectWithLocale } from '@/lib/types/project';
import styles from './CopyForAI.module.css';

interface CopyForAIProps {
  projects: ProjectWithLocale[];
}

function innerText(mdx: string): string {
  return mdx.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Strip MDX JSX tags and extract readable text content.
 *
 * Strategy:
 * 1. Convert meaningful components to markdown equivalents (SectionHeader,
 *    QuoteBlock, ProcessCard/Box, OutcomeBanner, CompareRow, CompareBlock).
 * 2. Unwrap pure layout containers (SplitLayout, ContentLeft, ContentRight,
 *    BoxGrid) — keep their children, drop the tags.
 * 3. Drop self-closing visual-only tags (FullwidthImage, ImageGrid, etc.).
 * 4. Strip any remaining unknown JSX open/close tags without touching content.
 */
function stripMdx(body: string): string {
  let t = body;

  // 1a. SectionHeader → ### heading
  t = t.replace(/<SectionHeader\b[^>]*\btitle="([^"]*)"[^/]*/g, '\n### $1\n');
  // clean up leftover /> that the above leaves
  t = t.replace(/\n### ([^\n]*)\s*\/>/g, '\n### $1\n');

  // 1b. QuoteBlock → blockquote
  t = t.replace(/<QuoteBlock[^>]*>([\s\S]*?)<\/QuoteBlock>/g,
    (_, inner) => `\n> ${innerText(inner)}\n`);

  // 1c. ProcessCard / ProcessBox → bold title + prose
  t = t.replace(/<Process(?:Card|Box)\b[^>]*\btitle="([^"]*)"[^>]*>([\s\S]*?)<\/Process(?:Card|Box)>/g,
    (_, title, inner) => `\n**${title}:** ${innerText(inner)}\n`);

  // 1d. OutcomeBanner → outcome paragraph
  t = t.replace(/<OutcomeBanner[^>]*>([\s\S]*?)<\/OutcomeBanner>/g,
    (_, inner) => `\n**OUTCOME:** ${innerText(inner)}\n`);

  // 1e. CompareBlock label → subheading, CompareRow → list item
  t = t.replace(/<CompareBlock\b[^>]*\bafterLabel="([^"]*)"[^>]*>/g,
    (_, after) => `\n**${after}:**\n`);
  t = t.replace(/<\/CompareBlock>/g, '');
  t = t.replace(/<CompareRow\b[^>]*\blabel="([^"]*)"[^>]*\bbefore="([^"]*)"[^>]*\bafter="([^"]*)"[^>]*\/>/g,
    (_, label, before, after) => `- ${label}: ~~${before}~~ → ${after}`);
  // handle attr order variant (after before label)
  t = t.replace(/<CompareRow\b[^>]*\/>/g, '');

  // 2. Unwrap layout containers — strip tags, keep children
  const UNWRAP = ['SplitLayout', 'ContentLeft', 'ContentRight', 'BoxGrid'];
  for (const tag of UNWRAP) {
    t = t.replace(new RegExp(`<${tag}\\b[^>]*>`, 'g'), '');
    t = t.replace(new RegExp(`<\\/${tag}>`, 'g'), '');
  }

  // 3. Drop self-closing visual tags entirely
  t = t.replace(/<[A-Z][A-Za-z]*\b[^>]*\/>/g, '');

  // 4. Strip remaining unknown open/close JSX tags (content already extracted above)
  t = t.replace(/<\/[A-Z][A-Za-z]*>/g, '');
  t = t.replace(/<[A-Z][A-Za-z]*\b[^>]*>/g, '');

  // Remove lines that are only whitespace (leftover from unwrapped layout tags)
  t = t.replace(/^[ \t]+$/gm, '');

  // Collapse excessive blank lines
  t = t.replace(/\n{3,}/g, '\n\n');

  return t.trim();
}

function buildMarkdown(projects: ProjectWithLocale[]): string {
  const lines: string[] = [
    '# Jakub Pełka — Portfolio',
    '',
    'Full-stack developer & designer. Building systems that solve real problems.',
    '',
    '## About',
    '',
    "I'm finishing a degree in digital economy in Katowice — somewhere between IT, business and project management. In my spare time I build tools that solve real problems — mine or someone I know. A fair description of my approach: \"the fact that I need to learn something new along the way doesn't stop me — even if that something is Rust\".",
    '',
    'Looking for a first job or internship in Silesia or remotely.',
    '',
    'My projects are solo — deliberately. Working alone forces full ownership of every decision. The flip side: I actively sought feedback from real users (prop masters, job seekers) and changed direction based on it — features were dropped, priorities shifted, assumptions were proven wrong.',
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

    // Facts
    if (content.facts.length > 0) {
      for (const fact of content.facts) {
        lines.push(`**${fact.label}:** ${fact.value}`);
      }
      lines.push('');
    }

    lines.push(`**Stack:** ${meta.tags.join(', ')}`);
    if (meta.links?.github) lines.push(`**GitHub:** ${meta.links.github}`);
    if (meta.links?.live) lines.push(`**Live:** ${meta.links.live}`);
    lines.push('');

    // Process entries from frontmatter (decision/insight/milestone/problem)
    if (content.process.length > 0) {
      lines.push('### Key decisions & insights');
      for (const entry of content.process) {
        lines.push(`- [${entry.type.toUpperCase()}] **${entry.title}:** ${entry.content}`);
      }
      lines.push('');
    }

    // Full MDX body — stripped to readable text
    const bodyText = stripMdx(content.body);
    if (bodyText) {
      lines.push('### Full project narrative');
      lines.push('');
      lines.push(bodyText);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

const BASE_BOTTOM = 32; // 2rem

export function CopyForAI({ projects }: CopyForAIProps) {
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
    const md = buildMarkdown(projects);
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
