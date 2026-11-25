import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { callouts } from './src/lib/callouts';
import { defaultLocale, locales } from './src/i18n';

export default defineConfig({
  site: process.env.SITE_URL || 'https://milotek.dev',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  i18n: {
    locales,
    defaultLocale,
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ mdastPlugins: [callouts] }),
  },
});
