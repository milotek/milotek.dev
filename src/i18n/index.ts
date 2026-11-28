/**
 * @fileoverview Internationalization helpers and locale registry.
 *
 * To add a language, create `src/i18n/<code>.ts` exporting the same keys as
 * `EN_STRINGS`, then register it in `TRANSLATIONS`. `astro.config.ts` reads
 * its supported locales directly from `LOCALES`.
 */

import {EN_STRINGS} from './en';

/** Map of locale codes to their full UI string dictionaries. */
export const TRANSLATIONS = {
  en: EN_STRINGS,
} satisfies Record<string, Record<keyof typeof EN_STRINGS, string>>;

export type Locale = keyof typeof TRANSLATIONS;
export type TranslationKey = keyof typeof EN_STRINGS;
export type TranslateFn = (
  key: TranslationKey,
  variables?: Readonly<Record<string, string | number>>,
) => string;

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALES: readonly Locale[] = Object.keys(TRANSLATIONS) as Locale[];

/** Resolves an arbitrary locale string to a supported `Locale`. */
function resolveLocale(locale: string | undefined): Locale {
  if (locale && locale in TRANSLATIONS) {
    return locale as Locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Creates a translation function bound to the requested locale.
 *
 * Pass `Astro.currentLocale` (or `context.currentLocale` in API routes). Falls
 * back to `DEFAULT_LOCALE` when a locale or key is missing.
 */
export function useTranslations(locale: string | undefined): TranslateFn {
  const dictionary: Readonly<Record<TranslationKey, string>> =
    TRANSLATIONS[resolveLocale(locale)];

  return (
    key: TranslationKey,
    variables: Readonly<Record<string, string | number>> = {},
  ): string => {
    const template = dictionary[key] ?? TRANSLATIONS[DEFAULT_LOCALE][key];
    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
      if (name in variables) {
        return String(variables[name]);
      }
      return match;
    });
  };
}
