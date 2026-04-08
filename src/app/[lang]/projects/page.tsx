import type { Locale } from '@/i18n/config';
import { getAllProjects } from '@/lib/projects/loader';
import { ProjectCard } from '@/components/projects/ProjectCard';
import styles from './page.module.css';

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params as { lang: Locale };
  const projects = await getAllProjects(lang);

  return (
    <main className={styles.main}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.bracket}>[ </span>
            PROJECTS
            <span className={styles.bracket}> ]</span>
          </h1>
          <p className={styles.count}>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </header>

        {/* Projects Grid */}
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard
              key={project.meta.slug}
              project={project}
              locale={lang}
            />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyText}>[ NO_PROJECTS ]</p>
          </div>
        )}
      </div>
    </main>
  );
}
