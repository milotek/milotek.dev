import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { callouts } from './src/lib/callouts';

export default defineConfig({
  site: process.env.SITE_URL || 'https://milotek.dev',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ mdastPlugins: [callouts] }),
  },
});
