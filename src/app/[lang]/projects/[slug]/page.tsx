import React from 'react';
import type { Locale } from '@/i18n/config';
import { getProject, getAllProjectSlugs } from '@/lib/projects/loader';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
// import styles from './page.module.css'; // Przestajemy używać starych CSS Modules jeśli nie są potrzebne na tym etapie, choć możemy użyć "page-container" 
import { ProjectHero } from '@/components/mdx/ProjectHero';
import { globalMdxComponents } from '@/components/mdx';

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

    // 2. Pobierz ewentualne komponenty per projekt (jak istniały to tak zostawmy)
    let projectComponents: Record<string, React.ComponentType | any> = {};
    try {
      const mod = await import(`@/../content/projects/${slug}/components/index.ts`);
      projectComponents = mod;
    } catch {
      // Ignoruj, brak customowych
    }

    // Łączymy bazowe z customowymi
    const mergedComponents = { ...globalMdxComponents, ...projectComponents };

    // Set theme variables na main kontener
    const styleVariables = {
      '--project-bg': project.config.theme?.background || 'var(--color-bg-light)',
      '--project-highlight': project.config.theme?.highlight || '#55AAAA',
      '--project-text': project.config.theme?.primaryText || 'var(--color-bg-dark)',
    } as React.CSSProperties;

    return (
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto" style={styleVariables}>
        {/* Wstecz */}
        <div className="mb-12">
          <a href={`/${lang}/projects`} className="font-ibm text-xs font-bold hover:opacity-70 transition-colors flex items-center gap-2 uppercase">
            ← PROJECTS
          </a>
        </div>

        {/* Hero */}
        <ProjectHero project={project as any} lang={lang} />

        {/* MDX Body - Tu dzieje się magia komponentowa */}
        <div className="project-body-mdx">
          <MDXRemote source={project.content.body} components={mergedComponents as any} />
        </div>
        
      </main>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
}
