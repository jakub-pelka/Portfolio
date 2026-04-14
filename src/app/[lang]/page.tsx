import type { Locale } from '@/i18n/config';
import { Hero } from '@/components/home/Hero';
import { ProjectTimeline } from '@/components/home/ProjectTimeline';
import { AboutSection } from '@/components/home/AboutSection';
import { getAllProjects } from '@/lib/projects/loader';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params as { lang: Locale };
  const [projects, dict] = await Promise.all([
    getAllProjects(lang),
    getDictionary(lang),
  ]);

  return (
    <main>
      <Hero />
      <ProjectTimeline lang={lang} projects={projects} />
      <AboutSection>
        <h2>{dict.about.heading}</h2>
        <p dangerouslySetInnerHTML={{ __html: dict.about.p1 }} />
        <p>{dict.about.p2}</p>
      </AboutSection>
    </main>
  );
}
