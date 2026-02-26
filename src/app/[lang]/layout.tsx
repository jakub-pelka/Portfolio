import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { locales, type Locale } from '@/i18n/config';
import '../../styles/globals.css';

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
  title: 'Jakub Pełka — Portfolio',
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
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${vt323.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
