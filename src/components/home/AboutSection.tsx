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
          <MetaRow label="FW"><TagList><Tag>Next.js</Tag><Tag>Vue 3</Tag><Tag>React</Tag></TagList></MetaRow>
          <MetaRow label="LANG"><TagList><Tag>TypeScript</Tag><Tag>Python</Tag></TagList></MetaRow>
          <MetaRow label="STYLE"><TagList><Tag>Vanilla CSS</Tag><Tag>Tailwind CSS</Tag></TagList></MetaRow>
          <MetaRow label="ANIM"><TagList><Tag>Framer Motion</Tag><Tag>GSAP</Tag><Tag>Three.js</Tag></TagList></MetaRow>
        </TerminalCard>
        <TerminalCard title="BACKEND" status="active">
          <MetaRow label="RUNTIME"><TagList><Tag>Node.js</Tag><Tag>Rust</Tag></TagList></MetaRow>
          <MetaRow label="DB"><TagList><Tag>PostgreSQL</Tag><Tag>SQLite</Tag><Tag>Supabase</Tag></TagList></MetaRow>
          <MetaRow label="PLATFORM"><TagList><Tag>Tauri</Tag><Tag>Vercel</Tag></TagList></MetaRow>
          <MetaRow label="TOOLS"><TagList><Tag>Postman</Tag></TagList></MetaRow>
        </TerminalCard>
        <TerminalCard title="AI" status="active">
          <MetaRow label="LLM"><TagList><Tag>Claude API</Tag><Tag>OpenAI API</Tag></TagList></MetaRow>
          <MetaRow label="VISION"><TagList><Tag>Gemini Vision</Tag></TagList></MetaRow>
          <MetaRow label="CONTENT"><TagList><Tag>MDX</Tag></TagList></MetaRow>
        </TerminalCard>
      </div>
    </section>
  );
}
