import React from 'react';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { getProject, getAllProjectSlugs } from '@/lib/projects/loader';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ProjectHero } from '@/components/projects/ProjectHero';
import { SectionScroller } from '@/components/projects/SectionScroller';
import { globalMdxComponents } from '@/components/mdx';
import editorStyles from '@/components/mdx/Editorial.module.css';
import { SITE_URL } from '@/lib/seo/constants';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params as { lang: Locale; slug: string };

  let project;
  try {
    project = await getProject(slug, lang);
  } catch {
    notFound();
  }

  const { meta, content } = project;
  const canonical = `${SITE_URL}/${lang}/projects/${slug}`;
  const thumbnailFilename = meta.thumbnail.split('/').pop() ?? 'thumbnail.jpg';
  const thumbnailUrl = `${SITE_URL}/projects/${slug}/${thumbnailFilename}`;

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical,
      languages: {
        pl: `${SITE_URL}/pl/projects/${slug}`,
        en: `${SITE_URL}/en/projects/${slug}`,
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: canonical,
      type: 'article',
      images: [{ url: thumbnailUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [thumbnailUrl],
    },
  };
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
        <SectionScroller />
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
