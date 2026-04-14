import type { Locale } from '@/i18n/config';
import { Hero } from '@/components/home/Hero';
import { ProjectTimeline } from '@/components/home/ProjectTimeline';
import { AboutSection } from '@/components/home/AboutSection';
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
      <AboutSection>
        <h2>O mnie</h2>
        <p>Kończę studia na kierunku gospodarka cyfrowa w Katowicach — <b>coś pomiędzy IT, biznesem i zarządzaniem projektami</b>. W wolnym czasie buduję narzędzia które rozwiązują realne problemy — moje albo kogoś kogo znam. Dobry opis mojego podejścia to coś pokroju "nie zatrzymuje mnie fakt, że muszę po drodze nauczyć się czegoś nowego - nawet jeśli tym czymś jest Rust".</p>
        <p>Szukam pierwszej pracy lub stażu na Śląsku albo zdalnie.</p>
      </AboutSection>
    </main>
  );
}
