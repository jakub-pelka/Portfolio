import type { ProjectWithLocale } from '@/lib/types/project';

/**
 * Markdown „skopiuj stronę dla AI”. Budowany po stronie serwera (SiteFooter),
 * do przeglądarki trafia tylko gotowy tekst — a nie pełne MDX wszystkich projektów.
 */

interface CopyDict {
  nav: { role: string };
  about: { heading: string; p1_before: string; p1_bold: string; p1_after: string; p2: string };
  footer: {
    md_title: string;
    md_outcome: string;
    md_stack: string;
    md_github: string;
    md_live: string;
    md_decisions: string;
    md_narrative: string;
  };
  projects: { process_types: Record<string, string> };
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
function stripMdx(body: string, outcomeLabel: string): string {
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
    (_, inner) => `\n**${outcomeLabel}:** ${innerText(inner)}\n`);

  // 1e. CompareBlock label → subheading, CompareRow → list item
  t = t.replace(/<CompareBlock\b[^>]*\bafterLabel="([^"]*)"[^>]*>/g,
    (_, after) => `\n**${after}:**\n`);
  t = t.replace(/<\/CompareBlock>/g, '');
  t = t.replace(/<CompareRow\b[^>]*\blabel="([^"]*)"[^>]*\bbefore="([^"]*)"[^>]*\bafter="([^"]*)"[^>]*\/>/g,
    (_, label, before, after) => `- ${label}: ~~${before}~~ → ${after}`);
  // handle attr order variant (after before label)
  t = t.replace(/<CompareRow\b[^>]*\/>/g, '');

  // 1f. MetaRow label="X" → "- **X:** treść"
  t = t.replace(/<MetaRow\b[^>]*\blabel="([^"]*)"[^>]*>([\s\S]*?)<\/MetaRow>/g,
    (_, label, inner) => `\n- **${label}:** ${innerText(inner)}\n`);

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

export function buildCopyMarkdown(projects: ProjectWithLocale[], dict: CopyDict): string {
  const f = dict.footer;
  const lines: string[] = [
    `# ${f.md_title}`,
    '',
    dict.nav.role,
    '',
    `## ${dict.about.heading}`,
    '',
    `${dict.about.p1_before}${dict.about.p1_bold}${dict.about.p1_after}`,
    '',
    dict.about.p2,
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

    lines.push(`**${f.md_stack}:** ${meta.tags.join(', ')}`);
    if (meta.links?.github) lines.push(`**${f.md_github}:** ${meta.links.github}`);
    if (meta.links?.live) lines.push(`**${f.md_live}:** ${meta.links.live}`);
    lines.push('');

    // Process entries from frontmatter (decision/insight/milestone/problem)
    if (content.process.length > 0) {
      lines.push(`### ${f.md_decisions}`);
      for (const entry of content.process) {
        const type = dict.projects.process_types[entry.type] ?? entry.type.toUpperCase();
        lines.push(`- [${type}] **${entry.title}:** ${entry.content}`);
      }
      lines.push('');
    }

    // Full MDX body — stripped to readable text
    const bodyText = stripMdx(content.body, f.md_outcome);
    if (bodyText) {
      lines.push(`### ${f.md_narrative}`);
      lines.push('');
      lines.push(bodyText);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
