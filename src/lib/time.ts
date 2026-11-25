export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** `lang` is a BCP 47 tag, i.e. t('lang'). */
export function longDate(d: Date, lang: string): string {
  return d.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
}
