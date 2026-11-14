/** 24-review-4 Req 1, 4: no article's lead photograph has a file name, a catalogue number or a stray comma for a caption. */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface Lead {
  key: string;
  caption: string;
  alt: string;
}

function leads(): Lead[] {
  const out: Lead[] = [];
  for (const pack of readdirSync('public/packs', { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of readdirSync(`public/packs/${pack.name}`).filter((x) => x.endsWith('.json') && x !== 'facts.json')) {
      const a = JSON.parse(readFileSync(`public/packs/${pack.name}/${f}`, 'utf8')) as { photos?: Array<{ caption?: string; alt?: string }> };
      const p = a.photos?.[0];
      if (p) out.push({ key: `${pack.name}/${f.replace('.json', '')}`, caption: p.caption ?? '', alt: p.alt ?? '' });
    }
  }
  return out;
}

describe('lead photograph captions', () => {
  const all = leads();

  it('the Colosseum leads with the famous view, not "Entrance LII"', () => {
    const c = all.find((l) => l.key === 'ancient/colosseum');
    expect(c?.caption).toBe('The Colosseum at dusk');
  });

  it('no caption is a file name, a catalogue number, a site name or ends on a comma', () => {
    const bad = all.filter((l) => /\d{5,}|@|\bpanoramio\b|,\s*$|\bCIAT\b|-crystalblue|\bsa solana\b|^\p{Ll}/u.test(l.caption) || /^[A-Z ]{8,}$/.test(l.caption));
    expect(bad.map((l) => `${l.key}: ${l.caption}`)).toEqual([]);
  });

  it('the owner’s examples are gone', () => {
    const captions = new Set(all.map((l) => l.caption));
    for (const c of ['Colosseum-Entrance LII', 'Lagoa com hipopótamos', 'Ston i solana sa zidina', 'Plage de Roume', 'Equus quagga', 'Gonepteryx rhamni - Citron', 'Natur tunisia', 'Lód na jeziorze']) expect(captions.has(c), c).toBe(false);
  });

  it('a lead does not show another country (Guyana, Maldives, Malta)', () => {
    for (const [key, word] of [['countries/guyana', 'Kaieteur'], ['countries/maldives', 'Bathala'], ['countries/malta', 'Mellie']] as const) {
      expect(all.find((l) => l.key === key)?.alt ?? '', key).toContain(word);
    }
  });
});
