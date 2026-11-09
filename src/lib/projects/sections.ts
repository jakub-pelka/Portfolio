/**
 * Sekcje projektu wyliczane z treści MDX (komponenty <SectionHeader ... />).
 * Wspólna reguła kotwicy dla spisu sekcji i samego nagłówka sekcji.
 */
export interface ProjectSection {
  num: string;
  title: string;
  id: string;
}

export function sectionAnchorId(num: string, id?: string): string {
  return id && id.length > 0 ? id : `s${num}`;
}

export function extractSections(body: string): ProjectSection[] {
  const sections: ProjectSection[] = [];
  const tagRe = /<SectionHeader\b[^>]*?\/>/g;
  const attr = (tag: string, name: string): string | undefined =>
    tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

  for (const match of body.matchAll(tagRe)) {
    const tag = match[0];
    const num = attr(tag, 'num');
    const title = attr(tag, 'title');
    if (!num || !title) continue;
    sections.push({ num, title, id: sectionAnchorId(num, attr(tag, 'id')) });
  }
  return sections;
}
