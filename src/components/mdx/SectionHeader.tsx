import { sectionAnchorId } from '@/lib/projects/sections';
import styles from './Editorial.module.css';

export function SectionHeader({ num, title, id }: { num: string; title: string; id?: string }) {
  return (
    <h2
      className={`jp-web-section__label ${styles.sectionHeader}`}
      data-snap-section
      id={sectionAnchorId(num, id)}
    >
      <span aria-hidden="true">[ {num} ]</span> {title}
    </h2>
  );
}
