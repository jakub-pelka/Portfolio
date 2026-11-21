import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { Parallax } from '@/components/ui/Parallax';
import styles from './SkillsSection.module.css';

interface SkillGroup {
  title: string;
  tags: string[];
}

export async function SkillsSection({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang);
  const s = dict.skills;

  return (
    <section id="skills" className={`jp-web-section ${styles.section}`}>
      <div className="jp-web-section__inner">
        {/* Paralaksa na całym wierszu (etykieta, tytuł, lead), żeby wyrównanie do dołu nie rozjeżdżało się podczas scrolla */}
        <Parallax distance={32} mobileFactor={0.5} innerClassName={styles.head}>
          <div className={styles.headTitle}>
            <p className={`jp-web-section__label ${styles.label}`}>[ {s.label} ]</p>
            <h2 className={`jp-web-section__title ${styles.title}`}>{s.title}</h2>
          </div>
          <p className={`jp-web-section__lead ${styles.lead}`}>{s.lead}</p>
        </Parallax>

        <div className={styles.groups}>
          {s.groups.map((group: SkillGroup) => (
            <div key={group.title}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <ul className={`jp-web-tags ${styles.tags}`}>
                {group.tags.map((tag) => (
                  <li key={tag} className="jp-web-tag">{tag}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
