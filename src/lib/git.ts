/**
 * @fileoverview Build-time Git metadata helpers.
 */

import {execFileSync} from 'node:child_process';

/** Metadata about the latest Git commit for the footer build stamp. */
export interface BuildCommitStamp {
  readonly shortHash: string;
  readonly label: string;
}

/**
 * Returns the short hash and formatted timestamp of the HEAD commit.
 *
 * Used in the site footer to link directly to the deployed commit.
 */
export function getLatestCommitStamp(): BuildCommitStamp {
  const output = execFileSync(
    'git',
    ['log', '-1', '--date=format:%Y-%m-%d %H:%M', '--format=%h @ %cd'],
    {encoding: 'utf8'},
  ).trim();
  const [shortHash = ''] = output.split(' ');
  return {
    shortHash,
    label: output,
  };
}

/**
 * Returns the author date of the most recent commit that added `filePath`.
 *
 * Falls back to the current time if the file has not yet been committed.
 */
export function getFileAddedDate(filePath: string): Date {
  const output = execFileSync(
    'git',
    [
      'log',
      '--full-history',
      '--topo-order',
      '--no-renames',
      '--diff-filter=A',
      '--format=%aI',
      '--',
      filePath,
    ],
    {encoding: 'utf8'},
  ).trim();
  const latestTimestamp = output.split('\n')[0];
  if (!latestTimestamp) {
    return new Date();
  }
  return new Date(latestTimestamp);
}
