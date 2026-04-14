import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { ProjectWithLocale } from '@/lib/types/project';
import { getDictionary } from '@/i18n/get-dictionary';
import { FooterCube } from './FooterCube';
import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  lang: Locale;
  projects: ProjectWithLocale[];
}

export async function SiteFooter({ lang, projects }: SiteFooterProps) {
  const dict = await getDictionary(lang);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Col 1: Projects */}
        <div className={styles.col}>
          <span className={styles.colHeader}>{dict.footer.projects}</span>
          <ul className={styles.list}>
            {projects.map((p) => (
              <li key={p.meta.slug} className={styles.listItem}>
                <Link href={`/${lang}/projects/${p.meta.slug}`} className={styles.link}>
                  {p.content.title.toUpperCase()}
                </Link>
                <span className={styles.version}>
                  {new Date(p.meta.date).getFullYear()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 2: Social */}
        <div className={styles.col}>
          <span className={styles.colHeader}>{dict.footer.social}</span>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <a href="https://github.com/jakub-pelka" className={styles.link}>GITHUB</a>
            </li>
            <li className={styles.listItem}>
              <a href="https://www.linkedin.com/in/jakub-pe%C5%82ka-0961bb27b/" className={styles.link}>LINKEDIN</a>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact */}
        <div className={styles.col}>
          <span className={styles.colHeader}>{dict.footer.contact}</span>
          <ul className={styles.list}>
            <li className={styles.contactItem}>
              <span className={styles.contactLabel}>{dict.footer.mail_label}</span>
              <a href="mailto:jakubpelkapraca@gmail.com" className={styles.link}>
                jakubpelkapraca@gmail.com
              </a>
            </li>
            <li className={styles.contactItem}>
              <a
                href="/Jakub_Pełka_CV_AI_Agent_Developer.pdf"
                download
                className={styles.cvLink}
              >
                {dict.footer.cv_download}
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Cube */}
        <div className={styles.col}>
          <div className={styles.cubeWrap}>
            <FooterCube />
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <span className={styles.copy}>©{year} JAKUB PEŁKA - coded from scratch in NEXT.JS</span>
      </div>
    </footer>
  );
}
