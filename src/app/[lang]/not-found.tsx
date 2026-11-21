import type { Metadata } from 'next';
import { locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { NotFoundContent } from '@/components/layout/NotFoundContent';

export const metadata: Metadata = {
  title: '404',
  robots: { index: false, follow: false },
};

// not-found.tsx receives no params, so we pass every locale's copy to a small
// client component that picks the right one from the URL.
export default async function LangNotFound() {
  const entries = await Promise.all(
    locales.map(async (l) => [l, (await getDictionary(l)).not_found] as const)
  );
  return <NotFoundContent texts={Object.fromEntries(entries)} />;
}
