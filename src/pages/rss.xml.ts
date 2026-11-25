import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { site } from '../config';
import { url } from '../lib/url';
import { useTranslations } from '../i18n';

export async function GET(context: APIContext) {
  const t = useTranslations(context.currentLocale);
  const posts = await getPosts();
  return rss({
    title: t('rss.title', { handle: site.handle }),
    description: t('rss.description'),
    site: new URL(url(''), context.site),
    trailingSlash: true,
    items: posts.map((p) => ({
      title: p.title,
      pubDate: p.published,
      link: url(`blog/${p.id}/`),
    })),
  });
}
