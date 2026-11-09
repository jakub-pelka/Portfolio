import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getAllProjects } from '@/lib/projects/loader';
import { getDictionary } from '@/i18n/get-dictionary';
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
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jakub Pełka — Full-stack & AI Developer',
    template: '%s — Jakub Pełka',
  },
  description: 'Full-stack & AI Developer — strony, aplikacje i automatyzacje AI.',
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

  const [projects, dict] = await Promise.all([
    getAllProjects(lang),
    getDictionary(lang),
  ]);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${vt323.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        {/* Przed pierwszym malowaniem: na stronie głównej bez przewinięcia i bez reduced motion ukryj nagłówek do końca
            animacji startowej (Hero zdejmuje atrybut). Bez JS nagłówek zostaje widoczny. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,p=location.pathname.replace(/[/]$/,'');var n=performance.getEntriesByType('navigation')[0];if(/^[/](pl|en)$/.test(p)&&!location.hash&&window.scrollY<2&&!(n&&n.type==='back_forward')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-intro','running')}}catch(e){}})()`,
          }}
        />
        <ThemeProvider>
          <SiteHeader lang={lang} themeLabels={dict.theme} nav={dict.nav} />
          {children}
          <SiteFooter lang={lang} projects={projects} />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
