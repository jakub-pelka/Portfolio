import Link from 'next/link';
import Image from 'next/image';
import type { ProjectWithLocale } from '@/lib/types/project';
import type { Locale } from '@/i18n/config';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: ProjectWithLocale;
  locale: Locale;
}

export function ProjectCard({ project, locale }: ProjectCardProps) {
  const { meta, content } = project;

  return (
    <Link
      href={`/${locale}/projects/${meta.slug}`}
      className={styles.card}
    >
      <article className={styles.container}>
        {/* Thumbnail */}
        <div className={styles.thumbnail}>
          {meta.thumbnail && (
            <Image
              src={`/projects/${meta.slug}/${meta.thumbnail.replace(/^\.\//, '')}`}
              alt={content.title}
              width={600}
              height={400}
              className={styles.image}
            />
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Status badge */}
          <div className={styles.meta}>
            <span className={styles.status} data-status={meta.status}>
              [ {meta.status.toUpperCase().replace('-', '_')} ]
            </span>
            {meta.featured && (
              <span className={styles.featured}>*</span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className={styles.title}>{content.title}</h3>
          <p className={styles.description}>{content.description}</p>

          {/* Tags */}
          <div className={styles.tags}>
            {meta.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          {/* Date */}
          <div className={styles.date}>
            <span className={styles.dateLabel}>[ DATE: </span>
            <time dateTime={meta.date}>
              {new Date(meta.date).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            <span> ]</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
