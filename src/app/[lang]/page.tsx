import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { Hero } from '@/components/home/Hero';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params as { lang: Locale };
  const dict = await getDictionary(lang);

  return (
    <main>
      <Hero />
      {/* 
        Temporary section to allow scrolling to the next part of the page.
        Will be replaced by actual components (e.g., FeaturedProjects). 
      */}
      <section style={{ minHeight: '100vh', padding: 'var(--space-4) 10vw' }}>
        <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', opacity: 0.5 }}>
          [ NEXT SECTION - WORK IN PROGRESS ]
        </p>
      </section>
    </main>
  );
}
