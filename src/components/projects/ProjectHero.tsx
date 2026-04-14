import { ProjectWithLocale } from '@/lib/types/project';
import styles from '@/components/mdx/Editorial.module.css';

interface ProjectHeroProps {
  project: ProjectWithLocale;
  lang: string;
}

export function ProjectHero({ project, lang }: ProjectHeroProps) {
  return (
    <section className={styles.hero} data-snap-section>
      <div className={styles.heroLeft}>
        <h1 className={styles.heroTitle}>
          {project.content.title}
        </h1>
        <p className={styles.heroDesc}>
          {project.content.description}
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {project.meta.links?.live && (
            <a
              href={project.meta.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.launchBtn}
            >
              [ LAUNCH_PROJECT → ]
            </a>
          )}
          {project.meta.links?.github && (
            <a
              href={project.meta.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.launchBtn}
            >
              [ GITHUB → ]
            </a>
          )}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className={styles.heroRight}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>RELEASE_DATE</span>
            <span className={styles.metaValue}>
              [ {project.meta.status} ] {new Date(project.meta.date).toLocaleDateString(lang, { year: 'numeric', month: 'short' })}
            </span>
          </div>
          
          {/* Dynamiczne Facts przekazane z frontmatter */}
          {project.content.facts.map((fact, idx) => (
            <div key={idx} className={styles.metaBlock}>
              <span className={styles.metaLabel}>{fact.label}</span>
              <span className={styles.metaValue}>{fact.value}</span>
            </div>
          ))}

          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>TECH_STACK</span>
            <div className={styles.tagList}>
              {project.meta.tags.map((tag) => (
                <span key={tag} className={styles.tagItem}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
