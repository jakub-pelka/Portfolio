import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { assertLocale } from '@/i18n/guard';
import { Hero } from '@/components/home/Hero';
import { ProjectTimeline } from '@/components/home/ProjectTimeline';
import { ServicesSection } from '@/components/home/ServicesSection';
import { AboutSection } from '@/components/home/AboutSection';
import { getAllProjects } from '@/lib/projects/loader';
import { getDictionary } from '@/i18n/get-dictionary';
import { SITE_URL } from '@/lib/seo/constants';

const HOME_SEO = {
  pl: {
    title: 'Portfolio',
    description:
      'Portfolio projektanta i developera — fakty i proces za każdym projektem, bez lania wody.',
  },
  en: {
    title: 'Portfolio',
    description:
      'Design & developer portfolio — the facts and the process behind every project.',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  assertLocale(rawLang);
  const lang: Locale = rawLang;
  const { title, description } = HOME_SEO[lang];
  const canonical = `${SITE_URL}/${lang}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        pl: `${SITE_URL}/pl`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/pl`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale: lang === 'pl' ? 'pl_PL' : 'en_US',
      siteName: 'Jakub Pełka — Portfolio',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  assertLocale(rawLang);
  const lang: Locale = rawLang;
  const [projects, dict] = await Promise.all([
    getAllProjects(lang),
    getDictionary(lang),
  ]);

  return (
    <main>
      <Hero scrollLabel={dict.hero.cta_projects} />
      <ProjectTimeline lang={lang} projects={projects} />
      <ServicesSection lang={lang} />
      <AboutSection>
        <h2>{dict.about.heading}</h2>
        <p dangerouslySetInnerHTML={{ __html: dict.about.p1 }} />
        <p>{dict.about.p2}</p>
      </AboutSection>
    </main>
  );
}
