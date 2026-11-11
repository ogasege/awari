import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './markdown.ts';

describe('markdown reader', () => {
  it('reads headings, lists, tables and paragraphs', () => {
    const blocks = parseMarkdown(
      '# T\n\nSome text\nmore\n\n- a\n- b\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n<!-- x -->',
    );
    expect(blocks).toEqual([
      { kind: 'heading', level: 1, text: 'T' },
      { kind: 'paragraph', text: 'Some text more' },
      { kind: 'list', items: ['a', 'b'] },
      { kind: 'table', head: ['A', 'B'], rows: [['1', '2']] },
    ]);
  });

  it('Property: every non-empty line’s words survive parsing', () => {
    const word = fc.stringMatching(/^[a-z]{1,8}$/);
    fc.assert(
      fc.property(fc.array(fc.array(word, { minLength: 1, maxLength: 5 }), { maxLength: 8 }), (paras) => {
        const src = paras.map((p) => p.join(' ')).join('\n\n');
        const text = parseMarkdown(src)
          .map((b) => (b.kind === 'paragraph' ? b.text : ''))
          .join(' ');
        for (const p of paras) for (const w of p) expect(text).toContain(w);
      }),
    );
  });
});
