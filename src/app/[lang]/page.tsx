import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { assertLocale } from '@/i18n/guard';
import { Hero } from '@/components/home/Hero';
import { ProjectTimeline } from '@/components/home/ProjectTimeline';
import { ServicesSection } from '@/components/home/ServicesSection';
import { AboutSection } from '@/components/home/AboutSection';
import { PortfolioLanyard } from '@/components/home/PortfolioLanyard';
import { DevTweak } from '@/components/dev/DevTweak';
import { getAllProjects } from '@/lib/projects/loader';
import { getDictionary } from '@/i18n/get-dictionary';
import { SITE_URL } from '@/lib/seo/constants';

const HOME_SEO = {
  pl: {
    title: 'Jakub Pełka — Full-stack & AI Developer',
    description:
      'Full-stack & AI Developer. Buduję strony, aplikacje webowe i automatyzacje AI dla firm — od zera, szybko i bez zbędnego długu technicznego.',
  },
  en: {
    title: 'Jakub Pełka — Full-stack & AI Developer',
    description:
      'Full-stack & AI Developer. I build websites, web apps, and AI automations for companies — from scratch, fast, and with zero lock-in.',
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
    title: {
      absolute: title,
    },
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
    <main style={{ position: 'relative' }}>
      <Hero dict={dict} />
      <ProjectTimeline lang={lang} projects={projects} />
      <ServicesSection lang={lang} />
      <AboutSection>
        <h2>{dict.about.heading}</h2>
        <p dangerouslySetInnerHTML={{ __html: dict.about.p1 }} />
        <p>{dict.about.p2}</p>
      </AboutSection>
      {/* Single, permanently-mounted lanyard card — see PortfolioLanyard.tsx
          for why this lives here rather than inside Hero/AboutSection. */}
      <PortfolioLanyard lang={lang} />
      <DevTweak />
    </main>
  );
}
