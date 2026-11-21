import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { Parallax } from '@/components/ui/Parallax';
import styles from './ServicesSection.module.css';

interface ServiceItem {
  title: string;
  body: string;
  example: { name: string; slug: string };
}

interface ProcessStep {
  step: string;
  title: string;
  body: string;
}

export async function ServicesSection({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang);
  const s = dict.services;
  const lastStep = s.process.length - 1;

  return (
    <>
      <section id="services" className={`jp-web-section ${styles.offer}`}>
        <div className="jp-web-section__inner">
          <p className="jp-web-section__label">[ {s.heading} ]</p>
          <Parallax distance={32} mobileFactor={0.5}>
            <h2 className={`jp-web-section__title ${styles.title}`}>
              {s.title_lead} <span className={styles.accent}>{s.title_accent}</span>
            </h2>
          </Parallax>
          <p className="jp-web-section__lead">{s.lead}</p>

          <ol className={styles.rows}>
            {s.items.map((item: ServiceItem, i: number) => (
              <li key={item.title} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={styles.rowNum}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={styles.rowTitle}>{item.title}</h3>
                </div>
                <p className={styles.rowBody}>{item.body}</p>
                <Link
                  href={`/${lang}/projects/${item.example.slug}`}
                  className={`jp-web-btn jp-web-btn--link ${styles.rowLink}`}
                >
                  {s.example_prefix} {item.example.name} →
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`jp-web-section ${styles.process}`}>
        <div className="jp-web-section__inner">
          <p className="jp-web-section__label">[ {s.process_heading} ]</p>
          <ol className={styles.steps}>
            {s.process.map((step: ProcessStep, i: number) => (
              <li key={step.step} className={styles.step}>
                <span
                  aria-hidden="true"
                  className={`${styles.diamond} ${i === lastStep ? styles.diamondAccent : ''}`}
                />
                <div className={`${styles.stepNum} ${i === lastStep ? styles.stepNumAccent : ''}`}>
                  {step.step}
                </div>
                <div className={styles.stepTitle}>{step.title}</div>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
          <p className={styles.pricing}>{s.pricing_note}</p>
        </div>
      </section>
    </>
  );
}
