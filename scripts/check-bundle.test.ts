import { describe, expect, it } from 'vitest';
import { referencedScripts, staticImports } from './check-bundle.ts';

describe('check-bundle helpers', () => {
  it('finds scripts and modulepreloads but not remote ones', () => {
    const html =
      '<script type="module" crossorigin src="/assets/index-A.js"></script><link rel="modulepreload" crossorigin href="/assets/vendor-B.js"><script src="https://x.test/a.js"></script>';
    expect(referencedScripts(html)).toEqual(['/assets/index-A.js', '/assets/vendor-B.js']);
  });
  it('finds static imports and ignores dynamic ones', () => {
    const code = 'import{a as b}from"./x-1.js";import"./y-2.js";const z=()=>import("./lazy-3.js");export{b}from"./w-4.js";';
    expect(staticImports(code)).toEqual(['./x-1.js', './y-2.js', './w-4.js']);
  });
});
