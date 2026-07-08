import { notFound } from 'next/navigation';
import { locales, type Locale } from './config';

export function assertLocale(lang: string): asserts lang is Locale {
  if (!locales.includes(lang as Locale)) {
    notFound();
  }
}
