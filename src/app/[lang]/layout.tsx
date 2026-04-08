import { locales, type Locale } from '@/i18n/config';

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

  // This layout only exists for i18n routing
  // Actual <html> and <body> are in root layout
  return <>{children}</>;
}
