/**
 * @fileoverview Static RSS feed endpoint for blog posts.
 */

import rss from '@astrojs/rss';
import type {APIContext} from 'astro';

import {SITE} from '../config';
import {useTranslations} from '../i18n';
import {getPosts} from '../lib/posts';
import {url} from '../lib/url';

/** Generates `/rss.xml` containing all published blog posts. */
export async function GET(context: APIContext): Promise<Response> {
  const t = useTranslations(context.currentLocale);
  const posts = await getPosts();

  return rss({
    title: t('rss.title', {handle: SITE.handle}),
    description: t('rss.description'),
    site: new URL(url(''), context.site),
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.published,
      link: url(`blog/${post.id}/`),
    })),
  });
}
