'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Locale } from '@/i18n/config';
import styles from './SiteHeader.module.css';

interface SiteHeaderProps {
  lang: Locale;
  themeLabels?: {
    toggle_dark: string;
    toggle_light: string;
  };
  /** Dictionary `nav` section: role, contact_button, all_projects, *_aria */
  nav?: {
    role?: string;
    contact_button?: string;
    all_projects?: string;
    all_projects_aria?: string;
    home_aria?: string;
    lang_aria?: string;
  };
}

export function SiteHeader({ lang, themeLabels, nav }: SiteHeaderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [overHero, setOverHero] = useState(true);
  const lastScrollY = useRef(0);
  const isHome = pathname === `/${lang}` || pathname === '/';

  // Switch to the other language keeping the same path
  const otherLang: Locale = lang === 'pl' ? 'en' : 'pl';
  const switchedPath = pathname.replace(`/${lang}`, `/${otherLang}`);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      // Na stronie głównej nagłówek jest przezroczysty, dopóki leży nad hero.
      setOverHero(currentY < window.innerHeight - 64);
      const delta = currentY - lastScrollY.current;

      if (delta > 8 && currentY > 60) {
        setVisible(false);
      } else if (delta < -8) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const contactLabel = nav?.contact_button ?? (lang === 'pl' ? '[ KONTAKT → ]' : '[ CONTACT → ]');
  const allProjectsLabel = nav?.all_projects ?? (lang === 'pl' ? '[ ← WSZYSTKIE PROJEKTY ]' : '[ ← ALL PROJECTS ]');
  const allProjectsAria = nav?.all_projects_aria ?? (lang === 'pl' ? 'Wszystkie projekty' : 'All projects');

  return (
    <header
      className={`jp-web-header ${isHome ? 'jp-web-header--home' : 'jp-web-header--project'} ${styles.header} ${visible ? styles.visible : styles.hidden}`}
      data-header-visible={visible ? 'true' : 'false'}
      data-over-hero={isHome && overHero ? 'true' : undefined}
    >
      <div className="jp-web-header__inner">
        <div className="jp-web-header__left">
          {isHome ? (
            nav?.role && <p className="jp-web-header__role">{nav.role}</p>
          ) : (
            <Link
              href={`/${lang}#timeline`}
              className="jp-web-btn jp-web-btn--link jp-web-header__back"
              aria-label={allProjectsAria}
            >
              <span className="jp-web-header__back-full" aria-hidden="true">{allProjectsLabel}</span>
              <span className="jp-web-header__back-short" aria-hidden="true">←</span>
            </Link>
          )}
        </div>

        {!isHome && (
          <Link href={`/${lang}`} className="jp-web-header__brand" aria-label={nav?.home_aria ?? 'Home'}>
            JP<span className="jp-web-header__cursor" aria-hidden="true">_</span>
          </Link>
        )}

        <div className="jp-web-header__actions">
          <Link href="#contact" className="jp-web-btn jp-web-btn--outline">
            {contactLabel}
          </Link>
          <Link
            href={switchedPath}
            className="jp-web-header__lang"
            lang={otherLang}
            hrefLang={otherLang}
            aria-label={nav?.lang_aria ?? otherLang.toUpperCase()}
          >
            {otherLang.toUpperCase()}
          </Link>
          <ThemeToggle labels={themeLabels} />
        </div>
      </div>
    </header>
  );
}
