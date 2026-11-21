import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { ProjectWithLocale } from '@/lib/types/project';
import { getDictionary } from '@/i18n/get-dictionary';
import { CopyForAI } from '@/components/ui/CopyForAI';
import { CONTACT_EMAIL } from '@/lib/contact';
import { Parallax } from '@/components/ui/Parallax';
import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  lang: Locale;
  projects: ProjectWithLocale[];
}

export async function SiteFooter({ lang, projects }: SiteFooterProps) {
  const dict = await getDictionary(lang);
  const f = dict.footer;
  const year = new Date().getFullYear();
  const mailHref = `mailto:${CONTACT_EMAIL}?body=${encodeURIComponent(f.mail_body)}`;
  const ctaMailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(f.contact_cta_subject)}&body=${encodeURIComponent(f.contact_cta_body)}`;

  return (
    <footer className={`jp-web-footer ${styles.footer}`}>
      {/* Odsłanianie: zawartość wsuwa się pod górną krawędź stopki (efekt wyłączony przy reduced motion i gdy stopka jest wyższa niż okno) */}
      <Parallax mode="reveal" revealPercent={30} mobileFactor={1}>
      <div className="jp-web-footer__inner">
        <div id="contact" className={styles.contact}>
          <p className="jp-web-footer__label">{f.label}</p>
          <h2 className="jp-web-footer__heading">{f.heading}</h2>
          <a className="jp-web-footer__mail" href={mailHref}>{CONTACT_EMAIL}</a>
          <div className="jp-web-footer__actions">
            <a className="jp-web-btn jp-web-btn--solid" href={ctaMailtoHref}>{f.contact_cta_label}</a>
            <a
              className="jp-web-btn jp-web-btn--outline"
              href={`/Jakub_Pelka_CV_Fullstack_AI_${lang === 'pl' ? 'PL' : 'EN'}.pdf`}
              download
            >
              {f.cv_download}
            </a>
          </div>
        </div>

        <div className="jp-web-footer__cols">
          <div>
            <h3 className="jp-web-footer__colhead">{f.projects}</h3>
            <ul className="jp-web-footer__list jp-web-footer__list--2">
              {projects.map((p) => (
                <li key={p.meta.slug}>
                  <Link href={`/${lang}/projects/${p.meta.slug}`}>
                    {p.content.title.toUpperCase()}
                    <span className="jp-web-footer__year">{new Date(p.meta.date).getFullYear()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="jp-web-footer__colhead">{f.social}</h3>
            <ul className="jp-web-footer__list">
              <li><a href="https://github.com/jakub-pelka">GITHUB ↗</a></li>
              <li><a href="https://www.linkedin.com/in/jakub-pe%C5%82ka-0961bb27b/">LINKEDIN ↗</a></li>
            </ul>
          </div>
          <div>
            <h3 className="jp-web-footer__colhead">{f.where_title}</h3>
            <p className="jp-web-footer__place">{f.where_text}</p>
          </div>
        </div>

        <div className="jp-web-footer__bar">
          <p className="jp-web-footer__copy">
            <span>© {year} JAKUB PEŁKA · {f.copyright}</span>
            <span className="jp-web-footer__star" aria-hidden="true">*</span>
          </p>
          <div className="jp-web-footer__bar-actions">
            <CopyForAI
              projects={projects}
              labels={{ copy: f.copy_for_ai, done: f.copy_for_ai_done, title: f.copy_for_ai_title }}
            />
            <a className="jp-web-btn jp-web-btn--quiet" href="#">{f.to_top}</a>
          </div>
        </div>
      </div>
      </Parallax>
    </footer>
  );
}
