/**
 * 25-desktop P1-P3. P1 and P3 check the prepared bundle in desktop/site/ (run
 * `npm run desktop:prepare` first). They are skipped when it is absent, unless
 * DESKTOP_BUNDLE_REQUIRED=1, which the desktop workflow sets after preparing.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SITE = join('desktop', 'site');
const present = existsSync(join(SITE, 'sw.js'));
const required = process.env['DESKTOP_BUNDLE_REQUIRED'] === '1';

/** The precache list the service worker was built with. */
function precacheList(swPath: string): string[] {
  const match = /var o=(\[.*?\]);/s.exec(readFileSync(swPath, 'utf8'));
  if (!match?.[1]) throw new Error(`no precache list in ${swPath}`);
  return JSON.parse(match[1]) as string[];
}

describe('desktop bundle', () => {
  it('is present when the workflow requires it', () => {
    if (required) expect(present).toBe(true);
  });

  it.runIf(present)('P1: holds every file the service worker precaches', () => {
    const list = precacheList(join(SITE, 'sw.js'));
    expect(list.length).toBeGreaterThan(1000);
    const missing = list
      .map((p) => (p === '/' ? '/index.html' : p))
      .filter((p) => !existsSync(join(SITE, p)));
    expect(missing).toEqual([]);
  });

  it.runIf(present)('P1: holds the media thumbnails and their records', () => {
    expect(existsSync(join(SITE, 'media'))).toBe(true);
    const thumbs = execFileSync('find', [join(SITE, 'media'), '-name', '*.webp'], { encoding: 'utf8' })
      .trim()
      .split('\n');
    expect(thumbs.length).toBeGreaterThan(3000);
  });

  it.runIf(present)('P3: carries the licence and credits files', () => {
    for (const f of ['LICENSE', 'NOTICE', 'CREDITS.md']) {
      expect(existsSync(join(SITE, f)), f).toBe(true);
    }
    expect(readFileSync(join(SITE, 'LICENSE'), 'utf8')).toMatch(/^MIT License/);
  });

  it('P2: installers and the bundle copy are ignored by git', () => {
    const paths = [
      'desktop/release/Awari-1.0.0-mac-arm64.dmg',
      'desktop/release/Awari-1.0.0-win-x64.exe',
      'desktop/release/Awari-1.0.0-linux-x86_64.AppImage',
      'Awari.dmg',
      'desktop/site/index.html',
    ];
    const out = execFileSync('git', ['check-ignore', ...paths], { encoding: 'utf8' });
    expect(out.trim().split('\n')).toEqual(paths);
  });

  it('P2: no installer is tracked', () => {
    const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
    expect(tracked).not.toMatch(/\.(exe|dmg|AppImage|blockmap)$/m);
  });
});
