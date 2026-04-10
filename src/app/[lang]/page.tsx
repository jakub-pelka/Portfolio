import type { Locale } from '@/i18n/config';
import { Hero } from '@/components/home/Hero';
import { ProjectTimeline } from '@/components/home/ProjectTimeline';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params as { lang: Locale };

  return (
    <main>
      <Hero />
      <ProjectTimeline lang={lang} />
    </main>
  );
}
