import React from 'react';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { assertLocale } from '@/i18n/guard';
import Link from 'next/link';
import { getProject, getAllProjectSlugs, getAllProjects } from '@/lib/projects/loader';
import { getDictionary } from '@/i18n/get-dictionary';
import { extractSections } from '@/lib/projects/sections';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ProjectHero } from '@/components/projects/ProjectHero';
import { SectionScroller } from '@/components/projects/SectionScroller';
import { SectionNav } from '@/components/projects/SectionNav';
import { OutcomeBanner } from '@/components/mdx/OutcomeBanner';
import { ProcessCard } from '@/components/mdx/ProcessCard';
import { globalMdxComponents } from '@/components/mdx';
import editorStyles from '@/components/mdx/Editorial.module.css';
import styles from './page.module.css';
import { SITE_URL } from '@/lib/seo/constants';

export const dynamicParams = false;

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
  const { lang: rawLang, slug } = await params;
  assertLocale(rawLang);
  const lang = rawLang;

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
  const { lang: rawLang, slug } = await params;
  assertLocale(rawLang);
  const lang = rawLang;

  let project: Awaited<ReturnType<typeof getProject>>;
  let allProjects: Awaited<ReturnType<typeof getAllProjects>>;
  let dict: Awaited<ReturnType<typeof getDictionary>>;
  let projectComponents: Record<string, unknown> = {};
  try {
    // 1. Zaciągnij projekt (z nowym konfigiem i frontmatterem)
    [project, allProjects, dict] = await Promise.all([
      getProject(slug, lang),
      getAllProjects(lang),
      getDictionary(lang),
    ]);

    // 2. Pobierz ewentualne komponenty per projekt
    try {
      projectComponents = await import(`@/../content/projects/${slug}/components/index.ts`);
    } catch {
      // Brak per-projekt komponentów — ok
    }
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
  const labels = dict.projects;

  // Komponenty MDX, którym strona dostarcza tłumaczenia z słownika
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const localized = {
    OutcomeBanner: (props: any) => <OutcomeBanner {...props} label={labels.outcome_label} />,
    ProcessCard: (props: any) => <ProcessCard {...props} typeLabels={labels.process_types} />,
  };
  const mergedComponents = { ...globalMdxComponents, ...localized, ...projectComponents };

  // Pozycja w kolejności (meta.order), sąsiedzi do nawigacji dolnej
  const index = allProjects.findIndex((p) => p.meta.slug === slug);
  const prev = index > 0 ? allProjects[index - 1] : null;
  const next = index >= 0 && index < allProjects.length - 1 ? allProjects[index + 1] : null;
  const sections = extractSections(project.content.body);

  return (
    <>
      <SectionScroller />
      <main className={styles.main}>
        <ProjectHero
          project={project}
          lang={lang}
          labels={{ status: labels.status, project_count: labels.project_count }}
          position={index >= 0 ? index + 1 : 1}
          total={allProjects.length}
        />

        <section className={styles.content}>
          <div className="jp-web-section__inner">
            <div className={styles.layout}>
              <SectionNav sections={sections} label={labels.toc} ariaLabel={labels.toc_aria} />

              {/* MDX Body - Tu dzieje się magia komponentowa */}
              <div className={`${editorStyles.projectBody} ${styles.body}`}>
                <MDXRemote
                  source={project.content.body}
                  components={mergedComponents as any}
                  // next-mdx-remote@6 strips JSX expression attributes (e.g.
                  // columns={2}, images={[...]}) by default and silently falls
                  // back to the component's own default — no error anywhere, the
                  // prop is just gone. Safe to disable here: this MDX is
                  // author-only project content, never visitor input.
                  // blockDangerousJS stays at its default (true), so eval/
                  // Function/process/require are still blocked.
                  options={{ blockJS: false }}
                />
              </div>
            </div>
          </div>
        </section>

        {(prev || next) && (
          <nav className={styles.projectNav} aria-label={labels.other_projects_aria}>
            <div className="jp-web-section__inner">
              <div className={styles.projectNavGrid}>
                {prev && (
                  <Link href={`/${lang}/projects/${prev.meta.slug}`} className={`jp-web-card ${styles.projectNavCard}`}>
                    <span className="jp-web-card__label">{labels.prev}</span>
                    <span className={styles.projectNavTitle}>{prev.content.title}</span>
                  </Link>
                )}
                {next && (
                  <Link
                    href={`/${lang}/projects/${next.meta.slug}`}
                    className={`jp-web-card ${styles.projectNavCard} ${styles.projectNavNext}`}
                  >
                    <span className="jp-web-card__label">{labels.next}</span>
                    <span className={styles.projectNavTitle}>{next.content.title}</span>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </main>
    </>
  );
}
