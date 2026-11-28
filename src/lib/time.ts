/**
 * @fileoverview Date formatting helpers for build-time pages and feeds.
 */

/** Formats a `Date` as an ISO-8601 calendar date (`YYYY-MM-DD`). */
export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Formats a `Date` as a localized long date (e.g. `28 November 2026`).
 *
 * @param date The date to format.
 * @param locale A BCP 47 language tag (such as `t('lang')`).
 */
export function formatLongDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
