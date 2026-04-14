import { Tag, TagList, MetaRow } from '@/components/mdx/Primitives';
import { TerminalCard } from '@/components/mdx/TerminalCard';
import styles from './AboutSection.module.css';

interface AboutSectionProps {
  children: React.ReactNode;
}

export function AboutSection({ children }: AboutSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.text}>
        {children}
      </div>

      <div className={styles.grid}>
        <TerminalCard title="FRONTEND" status="active">
          <MetaRow label="FW"><TagList><Tag>Next.js 16</Tag><Tag>Vue 3</Tag></TagList></MetaRow>
          <MetaRow label="LANG"><TagList><Tag>TypeScript</Tag></TagList></MetaRow>
          <MetaRow label="STYLE"><TagList><Tag>Vanilla CSS</Tag></TagList></MetaRow>
          <MetaRow label="ANIM"><TagList><Tag>Framer Motion</Tag><Tag>GSAP</Tag></TagList></MetaRow>
        </TerminalCard>
        <TerminalCard title="BACKEND" status="active">
          <MetaRow label="RUNTIME"><TagList><Tag>Node.js</Tag><Tag>Rust</Tag></TagList></MetaRow>
          <MetaRow label="DB"><TagList><Tag>SQLite</Tag></TagList></MetaRow>
          <MetaRow label="PLATFORM"><TagList><Tag>Tauri</Tag></TagList></MetaRow>
        </TerminalCard>
        <TerminalCard title="AI" status="active">
          <MetaRow label="LLM"><TagList><Tag>Claude API</Tag><Tag>OpenAI</Tag></TagList></MetaRow>
          <MetaRow label="VISION"><TagList><Tag>Gemini Vision</Tag></TagList></MetaRow>
        </TerminalCard>
        <TerminalCard title="VIZ" status="active">
          <MetaRow label="3D"><TagList><Tag>Three.js</Tag></TagList></MetaRow>
          <MetaRow label="CONTENT"><TagList><Tag>MDX</Tag></TagList></MetaRow>
        </TerminalCard>
      </div>
    </section>
  );
}
