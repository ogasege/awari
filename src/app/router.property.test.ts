import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ROUTES, buildPath, matchRoute } from './router.ts';

const segment = fc.stringMatching(/^[a-z0-9-]{1,20}$/);
const routeNames = Object.keys(ROUTES) as (keyof typeof ROUTES)[];

describe('router (01-app-shell)', () => {
  it('matches the main screens', () => {
    expect(matchRoute('/')).toEqual({ name: 'home', params: {} });
    expect(matchRoute('/article/countries/nigeria?x=1')).toEqual({
      name: 'article',
      params: { pack: 'countries', id: 'nigeria' },
    });
    expect(matchRoute('/castle/africa')).toEqual({
      name: 'wing',
      params: { wing: 'africa' },
    });
  });

  it('Property 1: building then matching returns the same route (Req 2.1)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...routeNames),
        segment,
        segment,
        (name, a, b) => {
          const params: Record<string, string> = {};
          const keys = [...ROUTES[name].matchAll(/:([a-z]+)/g)].map(
            (m) => m[1] as string,
          );
          keys.forEach((k, i) => {
            params[k] = i === 0 ? a : b;
          });
          expect(matchRoute(buildPath(name, params))).toEqual({
            name,
            params,
          });
        },
      ),
    );
  });

  it('Property 2: paths outside the table are not-found (Req 2.4)', () => {
    fc.assert(
      fc.property(fc.array(segment, { minLength: 4, maxLength: 6 }), (segs) => {
        expect(matchRoute(`/${segs.join('/')}`).name).toBe('not-found');
      }),
    );
    expect(matchRoute('/nope').name).toBe('not-found');
    expect(matchRoute('/article/%E0%A4%A/x').name).toBe('not-found');
  });
});
