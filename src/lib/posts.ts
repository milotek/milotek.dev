/**
 * @fileoverview Blog collection loader and sorting helpers.
 */

import {getCollection, type CollectionEntry} from 'astro:content';

import {getFileAddedDate} from './git';

/** A blog post enriched with its derived title and Git publication date. */
export interface BlogPost {
  readonly id: string;
  readonly title: string;
  readonly published: Date;
  readonly entry: CollectionEntry<'blog'>;
}

const HEADING_PATTERN = /^#\s+(.+)$/m;

/** Extracts the first Markdown H1 heading, falling back to the entry slug. */
function extractTitle(entry: CollectionEntry<'blog'>): string {
  const match = entry.body?.match(HEADING_PATTERN);
  return match?.[1]?.trim() ?? entry.id;
}

/** Returns all blog posts sorted newest-first by their Git creation date. */
export async function getPosts(): Promise<BlogPost[]> {
  const entries = await getCollection('blog');
  const posts: BlogPost[] = entries.map((entry) => ({
    id: entry.id,
    title: extractTitle(entry),
    published: entry.filePath ? getFileAddedDate(entry.filePath) : new Date(),
    entry,
  }));

  posts.sort(
    (first, second) => second.published.getTime() - first.published.getTime(),
  );
  return posts;
}
