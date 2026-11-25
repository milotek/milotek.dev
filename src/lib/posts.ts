import { execFileSync } from 'node:child_process';
import { getCollection, type CollectionEntry } from 'astro:content';

export interface Post {
  id: string;
  title: string;
  published: Date;
  entry: CollectionEntry<'blog'>;
}

function titleOf(entry: CollectionEntry<'blog'>): string {
  return entry.body?.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? entry.id;
}

function firstCommitted(path: string): Date {
  const dates = execFileSync('git', ['log', '--no-renames', '--diff-filter=A', '--format=%aI', '--', path], { encoding: 'utf8' }).trim();
  const first = dates.split('\n').at(-1);
  return first ? new Date(first) : new Date();
}

export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog');
  return entries
    .map((entry) => ({
      id: entry.id,
      title: titleOf(entry),
      published: firstCommitted(entry.filePath!),
      entry,
    }))
    .sort((a, b) => b.published.getTime() - a.published.getTime());
}
