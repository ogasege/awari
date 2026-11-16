/** 26-final-review round 3: the picture of the day comes from a small strong set of photographs, all 366 days. */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { unsuitableTopic } from '../../src/lib/text/suitability.ts';
import { dailyRejection } from './build.ts';

const DIR = 'public/media';
const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && !['index.json', 'daily.json', 'licences.json'].includes(f));
type Rec = Parameters<typeof dailyRejection>[0] & { id: string };
const byId = new Map<string, Rec>();
for (const f of files) for (const m of (JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')) as { items: Rec[] }).items) byId.set(m.id, m);
const days = (JSON.parse(readFileSync(`${DIR}/daily.json`, 'utf8')) as { days: Array<{ id: string; caption: string; article: string }> }).days;

describe('picture of the day', () => {
  it('has an entry for each of the 366 days', () => {
    expect(days).toHaveLength(366);
  });

  it('is always a Featured, Quality or Valued photograph of wildlife, earth, space, places or people, never a diagram or body picture', () => {
    for (const d of days) {
      const rec = byId.get(d.id);
      expect(rec, d.id).toBeDefined();
      expect(dailyRejection(rec as Rec), `${d.article}: ${d.caption}`).toBeNull();
      expect(['body', 'physics', 'science', 'inventions', 'arts']).not.toContain(d.article.split('/')[0]);
    }
  });

  it('passes the suitability scan on every caption', () => {
    for (const d of days) expect(unsuitableTopic(d.caption), d.caption).toBeNull();
  });

  it('does not show the same picture twice within 90 days', () => {
    const last = new Map<string, number>();
    days.forEach((d, i) => {
      const prev = last.get(d.id);
      if (prev !== undefined) expect(i - prev, d.caption).toBeGreaterThanOrEqual(90);
      last.set(d.id, i);
    });
  });

  it('rejects the research diagram the owner saw on 15 November', () => {
    const rec = { article: 'body/blood', kind: 'photo', quality: 1, width: 2000, caption: 'Hematopoietic stem cell niche in fetal liver versus bone marrow' } as Rec;
    expect(dailyRejection(rec)).not.toBeNull();
  });
});
