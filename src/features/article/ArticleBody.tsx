/**
 * The article text. Every word is a `<span data-w>`; one delegated click
 * handler reports the tapped word. Sentences that prove a margin note are
 * marked with a chalk underline and an id the note links to.
 */
import { memo, type MouseEvent } from 'react';
import type { ArticleSection } from '../../lib/packs/types.ts';
import { splitWords } from '../../lib/text/tokens.ts';

/** Stable anchor id for a section heading. */
export function sectionId(heading: string): string {
  return `s-${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'lead'}`;
}

function Words({ text }: { text: string }) {
  return (
    <>
      {splitWords(text).map((t, i) =>
        t.word ? (
          <span key={i} data-w={t.text}>
            {t.text}
          </span>
        ) : (
          t.text
        ),
      )}
    </>
  );
}

/** A paragraph with any proof sentences marked. */
function Paragraph({ text, proofs }: { text: string; proofs: readonly string[] }) {
  const parts: Array<{ text: string; proof: number }> = [];
  let rest = text;
  for (;;) {
    let best: { at: number; index: number } | null = null;
    proofs.forEach((p, index) => {
      const at = p ? rest.indexOf(p) : -1;
      if (at >= 0 && (best === null || at < best.at)) best = { at, index };
    });
    if (best === null) break;
    const { at, index } = best as { at: number; index: number };
    const proof = proofs[index] as string;
    if (at > 0) parts.push({ text: rest.slice(0, at), proof: -1 });
    parts.push({ text: proof, proof: index });
    rest = rest.slice(at + proof.length);
  }
  if (rest) parts.push({ text: rest, proof: -1 });
  return (
    <p>
      {parts.map((part, i) =>
        part.proof >= 0 ? (
          <mark key={i} id={`proof-${part.proof}`} className="article__proof">
            <Words text={part.text} />
          </mark>
        ) : (
          <Words key={i} text={part.text} />
        ),
      )}
    </p>
  );
}

export const ArticleBody = memo(function ArticleBody({
  sections,
  proofs,
  onWord,
}: {
  sections: readonly ArticleSection[];
  proofs: readonly string[];
  onWord: (word: string) => void;
}) {
  const click = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;
    const word = target.closest<HTMLElement>('[data-w]')?.dataset['w'];
    if (word && !window.getSelection()?.toString()) {
      onWord(word);
    }
  };
  return (
    // Clicks on words are a shortcut; the side card's field is the
    // keyboard-accessible way to look a word up (Req 3.4).
    <div className="article__body" onClick={click}>
      {sections.filter((s) => s.heading).length >= 3 ? (
        <nav className="article__toc" aria-label="In this article">
          <h2 className="article__toc-title">In this article</h2>
          <ol>
            {sections
              .filter((s) => s.heading)
              .map((s) => (
                <li key={s.heading}>
                  <a href={`#${sectionId(s.heading)}`}>{s.heading}</a>
                </li>
              ))}
          </ol>
        </nav>
      ) : null}
      {sections.map((s) => (
        <section key={s.heading || 'lead'} id={sectionId(s.heading)} aria-labelledby={s.heading ? `${sectionId(s.heading)}-h` : undefined}>
          {s.heading ? <h2 id={`${sectionId(s.heading)}-h`}>{s.heading}</h2> : null}
          {s.paragraphs.map((p, i) => (
            <Paragraph key={i} text={p} proofs={proofs} />
          ))}
        </section>
      ))}
    </div>
  );
});
