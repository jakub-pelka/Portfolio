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

// VT323 jest podzielony na dwa pliki (latin / latin-ext). Każdy ma własne
// unicode-range (dokładnie to, co zawiera plik), więc przeglądarka pobiera
// latin-ext dopiero, gdy pojawi się znak spoza latin (np. ł, ę, ś). To dwie
// rodziny (next/font wymaga literałów w declarations); --font-pixel w tokens.css łączy je w jeden stos. size-adjust 130%
// jak wcześniej (identyczny rozmiar na ekranie).
const vt323 = localFont({
  src: [
    {
      path: '../../fonts/VT323-latin.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-vt323',
  display: 'swap',
  declarations: [
    { prop: 'size-adjust', value: '130%' },
    { prop: 'unicode-range', value: 'U+000D, U+0020-007E, U+00A0-00FF, U+0131, U+0152-0153, U+02BC, U+02C6, U+02DA, U+02DC, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+2013-2014, U+2018-201A, U+201C-201E, U+2022, U+2026, U+2039-203A, U+2044, U+20AC, U+2122, U+2212, U+2215' },
  ],
});

const vt323Ext = localFont({
  src: [
    {
      path: '../../fonts/VT323-latin-ext.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-vt323-ext',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'size-adjust', value: '130%' },
    { prop: 'unicode-range', value: 'U+0100-0130, U+0132-0151, U+0154-017E, U+018F, U+0192, U+01A0-01A1, U+01AF-01B0, U+01C4-01CC, U+01E6-01E7, U+01EA-01EB, U+01FA-021B, U+022A-022D, U+0230-0233, U+0237, U+0259, U+02C7, U+02C9, U+02DD, U+1E80-1E85, U+1E9E, U+1EF2-1EF9, U+2020, U+20A1, U+20A3-20A4, U+20A6-20A7, U+20A9, U+20AB, U+20AD, U+20B1-20B2, U+20B5, U+20B9-20BA, U+20BC-20BD' },
  ],
});

// Warianty z preload (wszystko, co widać od pierwszej klatki): 400 i 700 normal.
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '700'],
  style: 'normal',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

// Pozostałe warianty tej samej rodziny (ta sama nazwa @font-face, więc
// przeglądarka je łączy), bez preload: italic 400 (hero „To/It's”) i 500
// (tekst rysowany na canvasie karty 3D).
const ibmPlexMonoItalic = IBM_Plex_Mono({ weight: '400', style: 'italic', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false });
const ibmPlexMonoMedium = IBM_Plex_Mono({ weight: '500', style: 'normal', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false });
// Same wywołania służą tylko do wygenerowania @font-face (bez klas na elementach).
void ibmPlexMonoItalic;
void ibmPlexMonoMedium;

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
      className={`${vt323.variable} ${vt323Ext.variable} ${ibmPlexMono.variable}`}
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
