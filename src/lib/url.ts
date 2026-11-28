/**
 * @fileoverview Base-path-aware URL helper for internal site links and assets.
 */

// `BASE_URL` is guaranteed to end with a trailing slash because
// `trailingSlash: 'always'` is enabled in `astro.config.ts`.
const BASE_URL = import.meta.env.BASE_URL;

/**
 * Prepends the configured Astro base path to a relative site path.
 *
 * Always route internal links and `public/` asset paths through this helper so
 * subpath deployments (`SITE_BASE=/subpath`) work without broken links.
 */
export function url(path = ''): string {
  return BASE_URL + path.replace(/^\/+/, '');
}
