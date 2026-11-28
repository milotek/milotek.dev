/**
 * @fileoverview URL-safe slug generation for content identifiers.
 */

/**
 * Converts an arbitrary title or filename stem into a lowercase URL slug.
 *
 * Apostrophes are stripped without inserting a separator; all other runs of
 * non-alphanumeric characters collapse into a single hyphen.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
