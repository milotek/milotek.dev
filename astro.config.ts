/**
 * @fileoverview Astro build and integration configuration for milotek.dev.
 */

import {satteri} from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import {defineConfig} from 'astro/config';

import {DEFAULT_LOCALE, LOCALES} from './src/i18n';
import {calloutsPlugin} from './src/lib/callouts';

// Astro requires a default export for its configuration file.
export default defineConfig({
  site: process.env.SITE_URL || 'https://milotek.dev',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap()],
  markdown: {
    processor: satteri({
      mdastPlugins: [calloutsPlugin],
    }),
  },
});
