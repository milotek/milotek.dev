import { getCollection, type CollectionEntry } from 'astro:content';

const RANK = { goated: 0, featured: 1 };

function rank(project: CollectionEntry<'projects'>): number {
  return project.data.status ? RANK[project.data.status] : 2;
}

function started(project: CollectionEntry<'projects'>): number {
  return Number.parseInt(project.data.year);
}

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => rank(a) - rank(b) || started(b) - started(a));
}
