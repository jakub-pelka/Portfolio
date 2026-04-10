import type { Locale } from '@/i18n/config';
import { Hero } from '@/components/home/Hero';
import { ProjectTimeline } from '@/components/home/ProjectTimeline';
import { getAllProjects } from '@/lib/projects/loader';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params as { lang: Locale };
  const projects = await getAllProjects(lang);

  return (
    <main>
      <Hero />
      <ProjectTimeline lang={lang} projects={projects} />
    </main>
  );
}
