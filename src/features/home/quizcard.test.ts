/** 24-review-4 Req 5: the picture on Home's quiz card is the lead photograph of the quiz's own article. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface Featured {
  pack: string;
  id: string;
  title: string;
  photo: { file: string; alt: string };
}

describe("Home's quiz card picture", () => {
  const home = JSON.parse(readFileSync('public/packs/home.json', 'utf8')) as { subjects: Array<{ id: string; featured: Featured[] }> };
  const featured = home.subjects.flatMap((s) => s.featured);

  it('every featured article shows its own lead photograph, with the same description', () => {
    expect(featured.length).toBeGreaterThan(50);
    const wrong = featured.filter((f) => {
      const a = JSON.parse(readFileSync(`public/packs/${f.pack}/${f.id}.json`, 'utf8')) as { photos: Array<{ file: string; alt: string }> };
      return a.photos[0]?.file !== f.photo.file || a.photos[0]?.alt !== f.photo.alt;
    });
    expect(wrong.map((f) => `${f.pack}/${f.id}`)).toEqual([]);
  });

  it('the Leg quiz no longer shows a beetle', () => {
    const leg = featured.find((f) => f.pack === 'body' && f.id === 'leg');
    if (leg) expect(leg.photo.alt).not.toMatch(/weevil|beetle/i);
    const a = JSON.parse(readFileSync('public/packs/body/leg.json', 'utf8')) as { photos: Array<{ alt: string }> };
    expect(a.photos[0]?.alt).not.toMatch(/weevil|beetle/i);
  });
});
