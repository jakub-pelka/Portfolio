'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import styles from './NotFoundContent.module.css';

interface NotFoundTexts {
  code: string;
  title: string;
  description: string;
  cta_home: string;
}

interface NotFoundContentProps {
  texts: Record<string, NotFoundTexts>;
}

export function NotFoundContent({ texts }: NotFoundContentProps) {
  const pathname = usePathname();
  const segment = pathname.split('/')[1] as Locale;
  const lang = locales.includes(segment) ? segment : defaultLocale;
  const t = texts[lang];

  return (
    <main className={styles.main}>
      <div className={styles.code}>{t.code}</div>
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.description}>{t.description}</p>
      <Button variant="v3" href={`/${lang}`}>
        {t.cta_home}
      </Button>
    </main>
  );
}
