import { type Locale, defaultLocale } from './config';

const dictionaries: Record<Locale, () => Promise<any>> = {
  pl: () => import('../../data/dictionaries/pl.json').then((m) => m.default),
  en: () => import('../../data/dictionaries/en.json').then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  // Opcjonalny fallback na wypadek podania błędnego/wymuszonego 'locale'
  const loadDictionary = dictionaries[locale] ?? dictionaries[defaultLocale];
  return loadDictionary();
}
