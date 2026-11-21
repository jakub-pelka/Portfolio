import type { ProjectWithLocale } from '@/lib/types/project';
import { Parallax } from '@/components/ui/Parallax';
import styles from './ProjectHero.module.css';

export interface ProjectHeroLabels {
  status: Record<string, string>;
  project_count: string;
}

interface ProjectHeroProps {
  project: ProjectWithLocale;
  lang: string;
  labels: ProjectHeroLabels;
  /** Numer projektu w kolejności z meta.order (od 1) i liczba wszystkich projektów. */
  position: number;
  total: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function ProjectHero({ project, lang, labels, position, total }: ProjectHeroProps) {
  const { meta, content } = project;
  const statusLabel = labels.status[meta.status] ?? meta.status;
  const dateLabel = new Date(meta.date)
    .toLocaleDateString(lang, { year: 'numeric', month: 'short' })
    .replace('.', '')
    .toUpperCase();
  const countLabel = labels.project_count
    .replace('{n}', pad(position))
    .replace('{total}', pad(total));

  const live = meta.links?.live;
  const github = meta.links?.github;

  return (
    <section className={styles.hero}>
      <div className="jp-web-section__inner">
        <div className={styles.statusLine}>
          <span className={styles.status}>{statusLabel}</span>
          <span>{dateLabel}</span>
          <span className={styles.count}>
            <span aria-hidden="true">/</span> {countLabel}
          </span>
        </div>

        {/* Paralaksa tytułu: jedzie wolniej niż reszta (maks. 28 px, na telefonie 14 px; odstęp do leadu to 48 px) */}
        <Parallax mode="fromTop" distance={28} mobileFactor={0.5}>
          <h1 className={`jp-web-display ${styles.title}`}>{content.title}</h1>
        </Parallax>

        <p className={`jp-web-section__lead ${styles.lead}`}>{content.description}</p>

        {(live || github) && (
          <div className={styles.actions}>
            {live && (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className="jp-web-btn jp-web-btn--solid"
              >
                [ LAUNCH_PROJECT → ]
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className={`jp-web-btn ${live ? 'jp-web-btn--quiet' : 'jp-web-btn--solid'}`}
              >
                [ GITHUB → ]
              </a>
            )}
          </div>
        )}

        {content.facts.length > 0 && (
          <dl className={styles.facts}>
            {content.facts.map((fact) => {
              const isNumber = /^\d+$/.test(fact.value.trim());
              return (
                <div key={fact.label} className={styles.fact}>
                  <dt className={styles.factLabel}>{fact.label}</dt>
                  <dd className={isNumber ? styles.factNumber : styles.factValue}>{fact.value}</dd>
                </div>
              );
            })}
          </dl>
        )}

        {meta.tags.length > 0 && (
          <ul className={`jp-web-tags ${styles.tags}`}>
            {meta.tags.map((tag) => (
              <li key={tag} className="jp-web-tag">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
