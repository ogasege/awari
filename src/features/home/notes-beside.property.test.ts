import { describe, expect, it } from 'vitest';
import type { HomeNoteData } from '../../lib/packs/home.ts';
import { SUBJECTS, type BundledPackId } from '../../lib/packs/subjects.ts';
import { notesBeside, pickSubjects } from './rotation.ts';

const ids = SUBJECTS.map((s) => s.id as BundledPackId);
const pool: HomeNoteData[] = ids.flatMap((subject) =>
  [0, 1, 2, 3].map((i): HomeNoteData => ({
    kind: i % 2 === 0 ? 'fact' : 'question',
    text: `${subject} ${i}`,
    to: `/article/${subject}/${i}`,
    subject,
  })),
);

describe('notesBeside (21-review-2 Property 4)', () => {
  it('only ever returns a note of the same subject as the print it sits beside', () => {
    for (let day = 0; day < 400; day += 1) {
      const subjects = pickSubjects(day, ids, 5);
      const notes = notesBeside(day, pool, subjects, [0, 2, 4]);
      notes.forEach((note, k) => {
        const slot = [0, 2, 4][k] as number;
        expect(note?.subject).toBe(subjects[slot]);
      });
    }
  });

  it('gives no note rather than another subject\'s note', () => {
    const only = pool.filter((n) => n.subject === 'wildlife');
    const notes = notesBeside(3, only, ['space', 'wildlife', 'space', 'earth', 'ancient'], [0, 1, 4]);
    expect(notes[0]).toBeUndefined();
    expect(notes[1]?.subject).toBe('wildlife');
    expect(notes[2]).toBeUndefined();
  });

  it('does not repeat a note across slots', () => {
    const notes = notesBeside(5, pool, ['arts', 'arts', 'arts', 'arts', 'arts'], [0, 2, 4]);
    expect(new Set(notes).size).toBe(3);
  });
});
