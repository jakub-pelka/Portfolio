import { ImageResponse } from 'next/og';
import type { Locale } from '@/i18n/config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TAGLINE: Record<Locale, string> = {
  pl: 'Fakty i proces za każdym projektem.',
  en: 'The facts and the process behind every project.',
};

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: '#0b0f0e',
          color: '#e7ece9',
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#55aaaa',
            marginBottom: 24,
          }}
        >
          jakubpelka.me
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 110,
            lineHeight: 1,
            color: '#e7ece9',
          }}
        >
          Jakub Pełka
        </div>
        <div
          style={{
            fontSize: 34,
            color: '#97a39e',
            marginTop: 28,
          }}
        >
          {TAGLINE[lang]}
        </div>
      </div>
    ),
    size
  );
}
