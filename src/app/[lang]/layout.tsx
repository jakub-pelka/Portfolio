import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { CopyForAI } from '@/components/ui/CopyForAI';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getAllProjects } from '@/lib/projects/loader';
import { locales } from '@/i18n/config';
import { assertLocale } from '@/i18n/guard';
import { SITE_URL } from '@/lib/seo/constants';
import '@/styles/globals.css';

const vt323 = localFont({
  src: [
    {
      path: '../../fonts/VT323-latin.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/VT323-latin-ext.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-vt323',
  display: 'swap',
  declarations: [{ prop: 'size-adjust', value: '130%' }],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jakub Pełka — Portfolio',
    template: '%s — Jakub Pełka',
  },
  description: 'Portfolio projektanta i developera — fakty i proces.',
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  assertLocale(rawLang);
  const lang = rawLang;

  const projects = await getAllProjects(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${vt323.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <ThemeProvider>
          <SiteHeader lang={lang} />
          <CopyForAI projects={projects} />
          {children}
          <SiteFooter lang={lang} projects={projects} />
        </ThemeProvider>
      </body>
    </html>
  );
}
