import { Tag } from '@/components/mdx/Primitives';
import { TerminalCard } from '@/components/mdx/TerminalCard';
import styles from './AboutSection.module.css';

interface AboutSectionProps {
  children: React.ReactNode;
}

/** One category row with the label and its tags on the same line, so the card
 *  stays short and fills the column width (instead of stacking label-over-tags). */
function TechRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.techRow}>
      <span className={styles.techLabel}>{label}</span>
      <div className={styles.techTags}>{children}</div>
    </div>
  );
}

export function AboutSection({ children }: AboutSectionProps) {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.textRow}>
        <div className={styles.text}>
          {children}
        </div>
        {/* Empty placeholder — reserves layout space and gives PortfolioLanyard
            (mounted once in page.tsx) a position reference. The actual live
            card lives outside this section's DOM so it's never unmounted
            when it "arrives" here after flying from Hero; see PortfolioLanyard.tsx. */}
        <div id="about-lanyard-slot" className={styles.lanyardSlot} />
      </div>

      <div className={styles.grid}>
        <TerminalCard title="FRONTEND" status="active" dense>
          <TechRow label="FW"><Tag>Next.js</Tag><Tag>Vue 3</Tag><Tag>React</Tag></TechRow>
          <TechRow label="LANG"><Tag>TypeScript</Tag><Tag>Python</Tag></TechRow>
          <TechRow label="STYLE"><Tag>Vanilla CSS</Tag><Tag>Tailwind CSS</Tag></TechRow>
          <TechRow label="ANIM"><Tag>Framer Motion</Tag><Tag>GSAP</Tag><Tag>Three.js</Tag></TechRow>
        </TerminalCard>
        <TerminalCard title="BACKEND" status="active" dense>
          <TechRow label="RUNTIME"><Tag>Node.js</Tag><Tag>Rust</Tag></TechRow>
          <TechRow label="DB"><Tag>PostgreSQL</Tag><Tag>SQLite</Tag><Tag>Supabase</Tag></TechRow>
          <TechRow label="PLATFORM"><Tag>Tauri</Tag><Tag>Vercel</Tag></TechRow>
          <TechRow label="TOOLS"><Tag>Postman</Tag><Tag>Docker</Tag><Tag>SonarCloud</Tag></TechRow>
        </TerminalCard>
        <TerminalCard title="AI" status="active" dense>
          <TechRow label="LLM"><Tag>Claude API</Tag><Tag>OpenAI API</Tag></TechRow>
          <TechRow label="VISION"><Tag>Gemini Vision</Tag></TechRow>
          <TechRow label="CONTENT"><Tag>MDX</Tag></TechRow>
        </TerminalCard>
      </div>
    </section>
  );
}
