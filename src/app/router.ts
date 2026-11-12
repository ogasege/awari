/**
 * A tiny, pure route matcher. Patterns use `:name` segments; matching and
 * building are inverse operations (tested as a property).
 */

export const ROUTES = {
  home: '/',
  atlas: '/atlas',
  article: '/article/:pack/:id',
  quiz: '/quiz/:pack/:id',
  quizzes: '/quizzes',
  castle: '/castle',
  wing: '/castle/:wing',
  subject: '/subject/:id',
  subjects: '/subjects',
  tours: '/tours',
  tour: '/tours/:id',
  timeline: '/timeline',
  stamps: '/stamps',
  continentStamps: '/stamps/:continent',
  search: '/search',
  credits: '/credits',
} as const;

export type RouteName = keyof typeof ROUTES | 'not-found';

export interface Match {
  name: RouteName;
  params: Record<string, string>;
}

/**
 * A route parameter: any readable text without slashes or control
 * characters, so wiki titles such as “Mount_Everest” or “Côte_d'Ivoire” fit.
 */
const SEGMENT = {
  test(value: string): boolean {
    return (
      value.length >= 1 &&
      value.length <= 200 &&
      ![...value].some((c) => '/\\?#'.includes(c) || c.charCodeAt(0) < 32)
    );
  },
};

/** Splits a path into non-empty segments, ignoring query and hash. */
function segments(path: string): string[] {
  const clean = path.split(/[?#]/)[0] ?? '';
  return clean.split('/').filter((s) => s !== '');
}

/** Matches a path against the route table. Unknown paths are not-found. */
export function matchRoute(path: string): Match {
  const parts = segments(path);
  for (const [name, pattern] of Object.entries(ROUTES)) {
    const pat = segments(pattern);
    if (pat.length !== parts.length) {
      continue;
    }
    const params: Record<string, string> = {};
    const ok = pat.every((p, i) => {
      const part = parts[i] as string;
      if (p.startsWith(':')) {
        let value: string;
        try {
          value = decodeURIComponent(part);
        } catch {
          return false;
        }
        if (!SEGMENT.test(value)) {
          return false;
        }
        params[p.slice(1)] = value;
        return true;
      }
      return p === part;
    });
    if (ok) {
      return { name: name as RouteName, params };
    }
  }
  return { name: 'not-found', params: {} };
}

/** Builds a path for a named route. Throws on a missing parameter. */
export function buildPath(
  name: keyof typeof ROUTES,
  params: Record<string, string> = {},
): string {
  const path = ROUTES[name].replace(/:([a-z]+)/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined || !SEGMENT.test(value)) {
      throw new Error(`Bad or missing parameter "${key}" for ${name}`);
    }
    return encodeURIComponent(value);
  });
  return path;
}
