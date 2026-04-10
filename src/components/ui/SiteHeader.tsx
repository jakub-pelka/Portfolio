'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/i18n/config';
import styles from './SiteHeader.module.css';

interface SiteHeaderProps {
  lang: Locale;
}

export function SiteHeader({ lang }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isHome = pathname === `/${lang}` || pathname === '/';

  // Switch to the other language keeping the same path
  const otherLang: Locale = lang === 'pl' ? 'en' : 'pl';
  const switchedPath = pathname.replace(`/${lang}`, `/${otherLang}`);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (delta > 8 && currentY > 60) {
        setVisible(false);
      } else if (delta < -8) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`${styles.header} ${visible ? styles.visible : styles.hidden}`}
      data-header-visible={visible ? 'true' : 'false'}
    >
      <div className={styles.inner}>
        {/* Back — visible outside home */}
        <div className={styles.left}>
          {!isHome && (
            <Button variant="v3" onClick={() => router.back()}>
              ← BACK
            </Button>
          )}
        </div>

        {/* Logo / home link — hidden on home */}
        {!isHome ? (
          <Link href={`/${lang}`} className={styles.logo}>
            JP
          </Link>
        ) : (
          <span />
        )}

        {/* Lang switcher */}
        <div className={styles.right}>
          <Button variant="v3" href={switchedPath} rawText>
            {otherLang.toUpperCase()}
          </Button>
        </div>
      </div>
    </header>
  );
}
