import { locales, type Locale } from '@/i18n/config';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { CopyForAI } from '@/components/ui/CopyForAI';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getAllProjects } from '@/lib/projects/loader';

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params as { lang: Locale };
  const projects = await getAllProjects(lang);

  return (
    <>
      <SiteHeader lang={lang} />
      {children}
      <CopyForAI projects={projects} lang={lang} />
      <SiteFooter lang={lang} projects={projects} />
    </>
  );
}
