/**
 * @fileoverview Build-time GitHub GraphQL client for the profile summary tile.
 */

export type ContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE';

/** A single day cell in the GitHub contribution calendar. */
export interface GitHubContributionDay {
  readonly date: string;
  readonly contributionCount: number;
  readonly contributionLevel: ContributionLevel;
}

/** A week column containing up to seven contribution days. */
export interface GitHubContributionWeek {
  readonly contributionDays: readonly GitHubContributionDay[];
}

/** A pinned repository card returned by the GitHub GraphQL API. */
export interface GitHubRepository {
  readonly name: string;
  readonly description: string | null;
  readonly url: string;
  readonly stargazerCount: number;
  readonly forkCount: number;
  readonly primaryLanguage: {
    readonly name: string;
    readonly color: string | null;
  } | null;
}

/** Aggregated GitHub profile data rendered in the GitHub tile. */
export interface GitHubProfile {
  readonly repositories: {
    readonly totalCount: number;
  };
  readonly pinnedItems: {
    readonly nodes: readonly GitHubRepository[];
  };
  readonly contributionsCollection: {
    readonly contributionCalendar: {
      readonly totalContributions: number;
      readonly weeks: readonly GitHubContributionWeek[];
    };
  };
}

/** Maps GitHub's GraphQL contribution level enum to CSS intensity levels 0–4. */
export const CONTRIBUTION_LEVEL_INDEX: Readonly<
  Record<ContributionLevel, number>
> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

const PROFILE_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      repositories(privacy: PUBLIC, ownerAffiliations: OWNER) {
        totalCount
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

interface GraphQlResponse {
  readonly data?: {
    readonly user?: GitHubProfile;
  };
  readonly errors?: ReadonlyArray<{readonly message: string}>;
}

/**
 * Fetches pinned repositories and the contribution calendar for `username`.
 *
 * Returns `undefined` when `GITHUB_TOKEN` is unset or when the API request
 * fails so the page can render its fallback state cleanly.
 */
export async function fetchGitHubProfile(
  username: string,
): Promise<GitHubProfile | undefined> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return undefined;
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: PROFILE_QUERY,
        variables: {login: username},
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = (await response.json()) as GraphQlResponse;
    if (payload.errors && payload.errors.length > 0) {
      throw new Error(payload.errors[0]?.message ?? 'Unknown GraphQL error');
    }

    return payload.data?.user;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`GitHub tile falls back to error state: ${message}`);
    return undefined;
  }
}
