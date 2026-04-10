import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { ProjectWithLocale, ProcessEntry } from '@/lib/types/project';
import { getAllProjects } from '@/lib/projects/loader';
import styles from './ProjectTimeline.module.css';

const TYPE_LABELS: Record<ProcessEntry['type'], string> = {
  decision: 'DECISION',
  problem: 'PROBLEM',
  insight: 'INSIGHT',
  milestone: 'MILESTONE',
};

function TimelineEntry({ project, lang }: { project: ProjectWithLocale; lang: Locale }) {
  const { meta, content } = project;
  const year = new Date(meta.date).getFullYear();
  const entries = content.process.slice(0, 3);

  return (
    <article className={styles.entry}>
      <div className={styles.aside}>
        <span className={styles.year}>{year}</span>
        <div className={styles.line} />
      </div>

      <div className={styles.body}>
        <header className={styles.header}>
          <span className={styles.status} data-status={meta.status}>
            [ {meta.status.toUpperCase().replace('-', '_')} ]
          </span>
          <h2 className={styles.title}>{content.title}</h2>
          <p className={styles.description}>{content.description}</p>
        </header>

        {entries.length > 0 && (
          <ul className={styles.process}>
            {entries.map((entry, i) => (
              <li key={i} className={styles.processItem}>
                {entry.anchor ? (
                  <Link
                    href={`/${lang}/projects/${meta.slug}#${entry.anchor}`}
                    className={styles.processLink}
                  >
                    <span className={styles.processType} data-type={entry.type}>
                      [{TYPE_LABELS[entry.type]}]
                    </span>
                    <span className={styles.processTitle}>{entry.title}:</span>
                    <span className={styles.processContent}>{entry.content}</span>
                  </Link>
                ) : (
                  <span className={styles.processLink}>
                    <span className={styles.processType} data-type={entry.type}>
                      [{TYPE_LABELS[entry.type]}]
                    </span>
                    <span className={styles.processTitle}>{entry.title}:</span>
                    <span className={styles.processContent}>{entry.content}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/${lang}/projects/${meta.slug}`}
          className={styles.moreLink}
        >
          [ SEE MORE → ]
        </Link>
      </div>
    </article>
  );
}

export async function ProjectTimeline({ lang }: { lang: Locale }) {
  const projects = await getAllProjects(lang);

  return (
    <section className={styles.timeline}>
      <div className={styles.inner}>
        {projects.map((project) => (
          <TimelineEntry key={project.meta.slug} project={project} lang={lang} />
        ))}
      </div>
    </section>
  );
}
