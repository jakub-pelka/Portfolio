import styles from './Editorial.module.css';

export function SectionHeader({ num, title, id }: { num: string; title: string; id?: string }) {
  return (
    <div className={styles.sectionHeader} data-snap-section id={id}>
      <span className={styles.metaLabel} style={{ marginBottom: "0.5rem" }}>
        [ {num} ]
      </span>
      <h2>{title}</h2>
    </div>
  );
}
