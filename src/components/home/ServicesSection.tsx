import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { TerminalCard } from '@/components/mdx/TerminalCard';
import styles from './ServicesSection.module.css';

const CONTACT_EMAIL = 'jakubpelkapraca@gmail.com';

interface ServiceItem {
  title: string;
  body: string;
}

interface ProcessStep {
  step: string;
  title: string;
  body: string;
}

export async function ServicesSection({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang);
  const s = dict.services;

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(s.cta_subject)}&body=${encodeURIComponent(s.cta_body)}`;

  return (
    <section className={styles.section} id="services">
      <div className={styles.intro}>
        <h2>{s.heading}</h2>
        <p>{s.intro}</p>
      </div>

      <div className={styles.grid}>
        {s.items.map((item: ServiceItem) => (
          <TerminalCard key={item.title} title={item.title} status="active">
            <p className={styles.itemBody}>{item.body}</p>
          </TerminalCard>
        ))}
      </div>

      <div className={styles.process}>
        <span className={styles.processHeading}>{s.process_heading}</span>
        <div className={styles.processSteps}>
          {s.process.map((step: ProcessStep) => (
            <div className={styles.processStep} key={step.step}>
              <span className={styles.processNum}>{step.step}</span>
              <span className={styles.processTitle}>{step.title}</span>
              <span className={styles.processBody}>{step.body}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.ctaRow}>
        <p className={styles.pricingNote}>{s.pricing_note}</p>
        <a href={mailtoHref} className={styles.ctaButton}>
          {s.cta_label}
        </a>
      </div>
    </section>
  );
}
