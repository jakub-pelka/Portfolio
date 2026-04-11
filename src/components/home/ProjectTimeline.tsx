import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { ProjectWithLocale, ProcessEntry } from '@/lib/types/project';
import styles from './ProjectTimeline.module.css';

const TYPE_LABELS: Record<ProcessEntry['type'], string> = {
  decision: 'DECISION',
  problem: 'PROBLEM',
  insight: 'INSIGHT',
  milestone: 'MILESTONE',
};

function ProcessLog({
  entry,
  slug,
  lang,
  index,
}: {
  entry: ProcessEntry;
  slug: string;
  lang: Locale;
  index: number;
}) {
  const isRight = index % 2 === 0;
  const href = entry.anchor
    ? `/${lang}/projects/${slug}#${entry.anchor}`
    : `/${lang}/projects/${slug}`;

  return (
    <div className={`${styles.processLog} ${isRight ? styles.processLogRight : styles.processLogLeft}`}>
      <div className={styles.processLogDot} />
      <Link href={href} className={styles.processLogContent}>
        <span className={styles.processLogType} data-type={entry.type}>
          [{TYPE_LABELS[entry.type]}]
        </span>
        <span className={styles.processLogTitle}>{entry.title}</span>
        <span className={styles.processLogText}>{entry.content}</span>
      </Link>
    </div>
  );
}

function ProjectEntry({
  project,
  lang,
  flip,
}: {
  project: ProjectWithLocale;
  lang: Locale;
  flip: boolean;
}) {
  const { meta, content } = project;
  const year = new Date(meta.date).getFullYear();

  // assets are served from public/projects/[slug]/
  // meta.thumbnail is like "./assets/thumbnail.jpg" — extract filename
  const thumbnailFilename = meta.thumbnail.split('/').pop() ?? 'thumbnail.jpg';
  const thumbnailSrc = `/projects/${meta.slug}/${thumbnailFilename}`;

  return (
    <div className={`${styles.projectEntry} ${flip ? styles.projectEntryFlip : ''}`}>
      {/* Axis marker */}
      <div className={styles.axisMarker}>
        <div className={styles.diamond} data-featured={meta.featured} />
      </div>

      {/* Content side */}
      <div className={styles.projectContent}>
        <span className={styles.year}>{year}</span>
        <span className={styles.status} data-status={meta.status}>
          [ {meta.status.toUpperCase().replace('-', '_')} ]
        </span>
        <Link href={`/${lang}/projects/${meta.slug}`} className={styles.contentLink}>
          <h2 className={styles.projectTitle}>{content.title}</h2>
          <p className={styles.projectDescription}>{content.description}</p>
          {meta.tags.length > 0 && (
            <ul className={styles.tags}>
              {meta.tags.slice(0, 5).map((tag) => (
                <li key={tag} className={styles.tag}>{tag}</li>
              ))}
            </ul>
          )}
        </Link>
        <Link href={`/${lang}/projects/${meta.slug}`} className={styles.moreLink}>
          [ SEE MORE → ]
        </Link>
      </div>

      {/* Image side */}
      <div className={styles.projectImage}>
        <Link href={`/${lang}/projects/${meta.slug}`} tabIndex={-1} aria-hidden>
          <Image
            src={thumbnailSrc}
            alt={content.title}
            width={640}
            height={420}
            className={styles.thumbnail}
          />
        </Link>
      </div>
    </div>
  );
}

export function ProjectTimeline({ lang, projects }: { lang: Locale; projects: ProjectWithLocale[] }) {
  return (
    <section className={styles.timeline} id="timeline">
      <div className={styles.axis} />
      <div className={styles.inner}>
        {projects.map((project: ProjectWithLocale, projectIndex: number) => {
          const entries = project.content.process.slice(0, 3);
          const flip = projectIndex % 2 !== 0;

          return (
            <div key={project.meta.slug} className={styles.projectGroup}>
              <ProjectEntry project={project} lang={lang} flip={flip} />
              {entries.map((entry: ProcessEntry, i: number) => (
                <ProcessLog
                  key={`${project.meta.slug}-${entry.title}`}
                  entry={entry}
                  slug={project.meta.slug}
                  lang={lang}
                  index={flip ? i + 1 : i}
                />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
