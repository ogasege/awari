import { describe, expect, it } from 'vitest';
import type { Article, Question } from '../packs/types.ts';
import {
  articleFromText,
  articleText,
  isQuestionShape,
  sectionOfSentence,
  slugify,
  validateQuestion,
} from './validate.ts';

const TEXT = [
  'Ghana is a country in West Africa.',
  'Its capital is Accra.',
  '',
  '== Geography ==',
  'The Volta River flows into Lake Volta,',
  'one of the largest artificial lakes in the world.',
  '',
  '=== Climate ===',
  'Ghana has a tropical climate with two rainy seasons.',
].join('\n');

const article: Article = articleFromText('Ghana', TEXT, {
  retrieved: '2026-11-11',
});

function question(overrides: Partial<Question> = {}): Question {
  return {
    id: 'ghana-1',
    articleId: 'ghana',
    pack: 'countries',
    prompt: 'Which city is the capital of Ghana?',
    options: ['Kumasi', 'Accra', 'Tamale', 'Cape Coast'],
    answer: 1,
    hints: {
      nudge: 'It sits on the coast of the Gulf of Guinea.',
      whereToLook: 'Read the opening paragraph.',
      removed: [0, 3],
    },
    proof: 'Its capital is Accra.',
    proofSection: '',
    ...overrides,
  };
}

function reasonsFor(q: Question): string[] {
  const verdict = validateQuestion(q, article);
  return verdict.ok ? [] : verdict.reasons;
}

describe('articleFromText', () => {
  it('splits sections on == headings == and paragraphs on blank lines', () => {
    expect(article.id).toBe('ghana');
    expect(article.sections.map((s) => s.heading)).toEqual([
      '',
      'Geography',
      'Climate',
    ]);
    expect(article.sections[0]?.paragraphs).toEqual([
      'Ghana is a country in West Africa. Its capital is Accra.',
    ]);
    expect(article.summary).toBe(article.sections[0]?.paragraphs[0]);
    expect(article.source.licence).toBe('CC BY-SA 4.0');
    expect(article.source.url).toBe('https://en.wikipedia.org/wiki/Ghana');
  });

  it('drops empty sections and keeps the chosen pack', () => {
    const a = articleFromText('Charge', '== Empty ==\n\n== Full ==\nText.', {
      pack: 'physics',
    });
    expect(a.pack).toBe('physics');
    expect(a.sections).toEqual([{ heading: 'Full', paragraphs: ['Text.'] }]);
  });

  it('slugifies titles', () => {
    expect(slugify("Côte d'Ivoire")).toBe('c-te-d-ivoire');
    expect(slugify('!!!')).toBe('article');
  });
});

describe('articleText and sectionOfSentence', () => {
  it('joins every paragraph with normalised spacing', () => {
    expect(articleText(article)).toContain(
      'Lake Volta, one of the largest',
    );
  });

  it('finds the section of a sentence, or null', () => {
    expect(sectionOfSentence(article, 'Its capital is Accra.')).toBe('');
    expect(sectionOfSentence(article, 'two  rainy\nseasons')).toBe(
      'Climate',
    );
    expect(sectionOfSentence(article, 'Accra. The Volta')).toBeNull();
    expect(sectionOfSentence(article, '   ')).toBeNull();
  });
});

describe('validateQuestion', () => {
  it('accepts a fair question', () => {
    expect(validateQuestion(question(), article)).toEqual({ ok: true });
  });

  it('accepts a proof with different spacing and the right section', () => {
    const q = question({
      prompt: 'Which lake does the Volta River flow into?',
      options: ['Lake Chad', 'Lake Volta', 'Lake Kivu', 'Lake Malawi'],
      answer: 1,
      hints: {
        nudge: 'It is named after the river.',
        whereToLook: 'Look under Geography.',
        removed: [0, 2],
      },
      proof: 'The Volta River flows into\n  Lake Volta,',
      proofSection: 'Geography',
    });
    expect(reasonsFor(q)).toEqual([]);
  });

  it('rejects the wrong number of options', () => {
    expect(reasonsFor(question({ options: ['Kumasi', 'Accra', 'Tamale'] })))
      .toContain('expected 4 options, got 3');
  });

  it('rejects empty and duplicate options', () => {
    const reasons = reasonsFor(
      question({ options: ['  ', 'Accra', 'kumasi', 'Kumasi '] }),
    );
    expect(reasons).toContain('every option must be non-empty');
    expect(reasons).toContain(
      'options must be unique (ignoring case and spacing)',
    );
  });

  it('rejects an answer index out of range', () => {
    for (const answer of [-1, 4, 1.5, Number.NaN]) {
      expect(reasonsFor(question({ answer })).join()).toMatch(
        /answer index/,
      );
    }
  });

  it('rejects a proof that is not in the article', () => {
    expect(reasonsFor(question({ proof: 'Its capital was Accra.' })))
      .toContain('proof is not an exact sentence from the article');
    expect(reasonsFor(question({ proof: ' ' }))).toContain('proof is empty');
  });

  it('rejects a proof that spans two sections', () => {
    expect(
      reasonsFor(question({ proof: 'Accra. The Volta River' })),
    ).toContain('proof does not sit inside a single section');
  });

  it('rejects the wrong proofSection', () => {
    expect(reasonsFor(question({ proofSection: 'Geography' })).join())
      .toMatch(/proofSection is "Geography" but the proof is in ""/);
  });

  it('rejects a proof without the answer', () => {
    expect(
      reasonsFor(question({ proof: 'Ghana is a country in West Africa.' })),
    ).toContain('proof does not contain the correct answer');
  });

  it('rejects a proof that names a wrong option', () => {
    const reasons = reasonsFor(
      question({ options: ['Capital', 'Accra', 'Tamale', 'Cape Coast'] }),
    );
    expect(reasons).toContain('proof contains wrong option 0 ("Capital")');
  });

  it('rejects bad removed pairs', () => {
    const bad: Array<[number, number]> = [
      [0, 0],
      [1, 2],
      [0, 4],
      [0, 0.5],
    ];
    for (const removed of bad) {
      const q = question();
      expect(
        reasonsFor({ ...q, hints: { ...q.hints, removed } }).join(),
      ).toMatch(/hints\.removed/);
    }
  });

  it('rejects hints and prompts that give the answer away', () => {
    const q = question();
    const reasons = reasonsFor({
      ...q,
      prompt: 'Is ACCRA the capital of Ghana?',
      hints: {
        ...q.hints,
        nudge: 'It starts with "Accra".',
        whereToLook: 'Find accra in the lead.',
      },
    });
    expect(reasons).toEqual(
      expect.arrayContaining([
        'prompt gives away the answer',
        'nudge gives away the answer',
        'whereToLook gives away the answer',
      ]),
    );
  });

  it('rejects empty prompt and hints', () => {
    const q = question();
    const reasons = reasonsFor({
      ...q,
      prompt: '',
      hints: { ...q.hints, nudge: ' ', whereToLook: '' },
    });
    expect(reasons).toEqual(
      expect.arrayContaining([
        'prompt is empty',
        'nudge is empty',
        'whereToLook is empty',
      ]),
    );
  });

  it('reports every broken rule, not only the first', () => {
    const reasons = reasonsFor(
      question({ proof: 'Nowhere.', proofSection: 'X', answer: 9 }),
    );
    expect(reasons.length).toBeGreaterThanOrEqual(2);
  });
});

describe('isQuestionShape', () => {
  it('accepts a question and rejects malformed values', () => {
    expect(isQuestionShape(question())).toBe(true);
    expect(isQuestionShape(null)).toBe(false);
    expect(isQuestionShape([])).toBe(false);
    expect(isQuestionShape({ ...question(), pack: 'music' })).toBe(false);
    expect(isQuestionShape({ ...question(), options: [1, 2, 3, 4] })).toBe(
      false,
    );
    expect(
      isQuestionShape({
        ...question(),
        hints: { nudge: 'a', whereToLook: 'b', removed: [1] },
      }),
    ).toBe(false);
  });
});
