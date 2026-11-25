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

function published(path: string): Date {
  const dates = execFileSync('git', ['log', '--no-renames', '--diff-filter=A', '--format=%aI', '--', path], { encoding: 'utf8' }).trim();
  const latest = dates.split('\n')[0];
  return latest ? new Date(latest) : new Date();
}

export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog');
  return entries
    .map((entry) => ({
      id: entry.id,
      title: titleOf(entry),
      published: published(entry.filePath!),
      entry,
    }))
    .sort((a, b) => b.published.getTime() - a.published.getTime());
}
