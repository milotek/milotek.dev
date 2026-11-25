import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { slugify } from './lib/slug';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      blurb: z.string(),
      status: z.enum(['featured', 'goated']).optional(),
      year: z.string(),
      by: z.string().default('me'),
      tech: z.array(z.string()),
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
      cover: image().optional(),
      images: z.array(z.object({ src: image(), alt: z.string() })).default([]),
    }),
});

const blog = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => slugify(entry.replace(/\.md$/, '')),
  }),
});

export const collections = { projects, blog };
