import en from './en';

// To add a language: write src/i18n/<code>.ts with the same keys and list it
// here. astro.config.ts reads its locales from this object.
export const ui = { en } satisfies Record<string, Record<keyof typeof en, string>>;

export type Locale = keyof typeof ui;
export type Key = keyof typeof en;

export const defaultLocale: Locale = 'en';
export const locales = Object.keys(ui) as Locale[];

function resolve(locale: string | undefined): Locale {
  return locale && locale in ui ? (locale as Locale) : defaultLocale;
}

/** Pass `Astro.currentLocale`; falls back to English for missing locales or keys. */
export function useTranslations(locale: string | undefined) {
  const strings: Record<Key, string> = ui[resolve(locale)];
  return function t(key: Key, vars: Record<string, string | number> = {}): string {
    const template = strings[key] ?? ui[defaultLocale][key];
    return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
  };
}
