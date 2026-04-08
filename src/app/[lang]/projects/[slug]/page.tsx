import React from 'react';
import type { Locale } from '@/i18n/config';
import { getProject, getAllProjectSlugs } from '@/lib/projects/loader';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
// import styles from './page.module.css'; // Przestajemy używać starych CSS Modules jeśli nie są potrzebne na tym etapie, choć możemy użyć "page-container" 
import { ProjectHero } from '@/components/mdx/ProjectHero';
import { globalMdxComponents } from '@/components/mdx';
import editorStyles from '@/components/mdx/Editorial.module.css';

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  const locales: Locale[] = ['pl', 'en'];

  return slugs.flatMap((slug) =>
    locales.map((lang) => ({
      lang,
      slug,
    }))
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params as { lang: Locale; slug: string };

  try {
    // 1. Zaciągnij projekt (z nowym konfigiem i frontmatterem)
    const project = await getProject(slug, lang);

    // 2. Pobierz ewentualne komponenty per projekt
    let projectComponents: Record<string, unknown> = {};
    try {
      projectComponents = await import(`@/../content/projects/${slug}/components/index.ts`);
    } catch {
      // Brak per-projekt komponentów — ok
    }

    const mergedComponents = { ...globalMdxComponents, ...projectComponents };

    // Set theme variables na main kontener
    // --project-text NIE wstrzykujemy z config — jest zależny od motywu (dark/light)
    // używamy --color-text który jest theme-aware przez tokens.css
    const styleVariables = {
      '--project-highlight': project.config.theme?.highlight || '#55AAAA',
    } as React.CSSProperties;

    return (
      <div style={styleVariables}>
        <main className={editorStyles.mainContainer}>
          {/* Hero */}
          <ProjectHero project={project} lang={lang} />

          {/* MDX Body - Tu dzieje się magia komponentowa */}
          <div className={editorStyles.projectBody}>
            <MDXRemote source={project.content.body} components={mergedComponents as any} />
          </div>
          
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
}
