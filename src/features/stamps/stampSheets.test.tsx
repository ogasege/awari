/** 24-review-4 Req 10: each slot of a continent sheet is a perforated stamp: found ones show a picture, unfound ones a faint "?". */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PackIndexItem } from '../../lib/packs/types.ts';
import type { Shapes } from './CountryOutline.tsx';
import { StampSheets } from './StampSheets.tsx';
import { worldBook } from './stamps.ts';

const item = (id: string, continent: string): PackIndexItem => ({ id, title: id, summary: '', continent, thumb: `img/${id}.jpg` }) as unknown as PackIndexItem;
const items = [item('chad', 'Africa'), item('ghana', 'Africa'), item('kenya', 'Africa'), item('peru', 'South America'), item('chile', 'South America')];

describe('stamp sheets', () => {
  it('draw a stamp picture for each found country and a "?" slot, with the same outline, for the rest', () => {
    const { container } = render(<StampSheets book={worldBook(['ghana', 'peru'], items)} />);
    const slots = [...container.querySelectorAll<HTMLElement>('.stamp-slot')];
    expect(slots).toHaveLength(5);
    const found = slots.filter((s) => s.dataset['slot'] === 'found');
    const empty = slots.filter((s) => s.dataset['slot'] === 'empty');
    expect(found).toHaveLength(2);
    expect(empty).toHaveLength(3);
    for (const s of found) expect(s.querySelector('img')?.getAttribute('src')).toBeTruthy();
    for (const s of empty) expect(s.querySelector('img')).toBeNull();
    // Every slot has the perforated stamp outline, found or not.
    expect(new Set(slots.map((s) => s.style.clipPath)).size).toBe(1);
    expect(slots[0]?.style.clipPath).toContain('polygon');
  });

  it('puts a found stamp on its own continent’s sheet', () => {
    const { container } = render(<StampSheets book={worldBook(['peru'], items)} />);
    const sheets = [...container.querySelectorAll('.stamp-sheet')];
    const south = sheets.find((s) => s.querySelector('.stamp-sheet__name')?.textContent === 'South America');
    const africa = sheets.find((s) => s.querySelector('.stamp-sheet__name')?.textContent === 'Africa');
    expect(south?.querySelectorAll('[data-slot="found"]')).toHaveLength(1);
    expect(africa?.querySelectorAll('[data-slot="found"]')).toHaveLength(0);
  });

  it('draws the outline of each empty country on the overview, and keeps the "?" only where the atlas has no shape', () => {
    const square = (id: string, x: number): Shapes['features'][number] => ({
      type: 'Feature',
      properties: { id, name: id },
      geometry: { type: 'Polygon', coordinates: [[[x, 0], [x + 5, 0], [x + 5, 5], [x, 5], [x, 0]]] },
    });
    const shapes: Shapes = { type: 'FeatureCollection', features: [square('chad', 10), square('ghana', 20)] };
    const { container } = render(<StampSheets book={worldBook(['ghana'], items)} items={items} shapes={shapes} />);
    const africa = [...container.querySelectorAll('.stamp-sheet')].find((s) => s.querySelector('.stamp-sheet__name')?.textContent === 'Africa');
    const empties = [...(africa?.querySelectorAll('[data-slot="empty"]') ?? [])];
    expect(empties).toHaveLength(2);
    // chad has a shape, kenya does not: one outline, one plain "?" slot.
    expect(empties.filter((e) => e.querySelector('svg path'))).toHaveLength(1);
    expect(africa?.querySelectorAll('[data-slot="found"] img')).toHaveLength(1);
  });
});
