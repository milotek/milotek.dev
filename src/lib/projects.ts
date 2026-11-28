/**
 * @fileoverview Project collection loader and priority-based sorting.
 */

import {getCollection, type CollectionEntry} from 'astro:content';

const STATUS_PRIORITY: Readonly<Record<'goated' | 'featured', number>> = {
  goated: 0,
  featured: 1,
};

const DEFAULT_PRIORITY = 2;

/** Returns a numeric sort rank for a project's highlight status. */
function getProjectPriority(project: CollectionEntry<'projects'>): number {
  const {status} = project.data;
  if (!status) {
    return DEFAULT_PRIORITY;
  }
  return STATUS_PRIORITY[status];
}

/** Parses the starting year from a project's year string (e.g. `"2023-2024"`). */
function getStartYear(project: CollectionEntry<'projects'>): number {
  return Number.parseInt(project.data.year, 10);
}

/**
 * Returns all projects sorted by status (`goated`, `featured`, then standard)
 * and newest starting year within each tier.
 */
export async function getProjects(): Promise<Array<CollectionEntry<'projects'>>> {
  const projects = await getCollection('projects');
  return projects.sort((first, second) => {
    const priorityDiff =
      getProjectPriority(first) - getProjectPriority(second);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return getStartYear(second) - getStartYear(first);
  });
}
