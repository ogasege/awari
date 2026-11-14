/**
 * The side card that explains a tapped word, with a labelled field so
 * anyone can look up a word from the keyboard (03 Req 3).
 */
import { useEffect, useState, type FormEvent } from 'react';
import { partOfSpeech } from '../../lib/dictionary/lookup.ts';
import { lookupAnyWord, type AnyDefinition } from '../../lib/dictionary/online.ts';

type Answer = { definition: AnyDefinition | null; offline: boolean };

export interface Tap {
  word: string;
  n: number;
}

export function WordCard({ tap }: { tap: Tap | null }) {
  const [field, setField] = useState('');
  const [asked, setAsked] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, Answer>>({});
  const [seenTap, setSeenTap] = useState<Tap | null>(null);

  // A new tap from the article becomes the current question
  // (adjusting state from props during render, not in an effect).
  if (tap && tap !== seenTap) {
    setSeenTap(tap);
    setField(tap.word);
    setAsked(tap.word);
  }

  useEffect(() => {
    if (asked === null || asked in results) return;
    let live = true;
    lookupAnyWord(asked).then(
      (answer) => live && setResults((r) => ({ ...r, [asked]: answer })),
      () => live && setResults((r) => ({ ...r, [asked]: { definition: null, offline: false } })),
    );
    return () => {
      live = false;
    };
  }, [asked, results]);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const w = field.trim();
    if (w) setAsked(w);
  };

  const answer = asked === null ? undefined : results[asked];
  const def = answer === undefined ? undefined : answer.definition;

  return (
    <aside className="word-card" aria-labelledby="word-card-title">
      <span aria-hidden="true" className="tape tape--yellow word-card__tape" />
      <h2 id="word-card-title" className="word-card__title">
        What does it mean?
      </h2>
      <div aria-live="polite" className="word-card__answer">
        {asked === null ? (
          <p className="word-card__hint">Click or tap any word in the article, or type one below.</p>
        ) : def === undefined ? (
          <p>Looking up “{asked}”…</p>
        ) : def === null ? (
          <p>
            {answer?.offline
              ? `You are offline, and “${asked}” is not in the saved dictionary. Words you look up while online are saved for next time.`
              : `No meaning found for “${asked}”. Try another form of the word, like “river” instead of “rivers”.`}
          </p>
        ) : (
          <>
            <p className="word-card__word">
              {def.lemma}
              {def.lemma !== def.word.toLowerCase() ? (
                <span className="word-card__from"> (from “{def.word}”)</span>
              ) : null}
            </p>
            <ol className="word-card__senses">
              {def.senses.map((s, i) => (
                <li key={i}>
                  <span className="word-card__pos">{partOfSpeech(s.pos)}</span> {s.gloss}
                  {s.example ? <span className="word-card__example">“{s.example}”</span> : null}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
      <form className="word-card__form" onSubmit={submit}>
        <label htmlFor="word-lookup">Look up a word</label>
        <div>
          <input
            id="word-lookup"
            value={field}
            onChange={(e) => setField(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn btn--ink">
            Look up
          </button>
        </div>
      </form>
      <p className="word-card__credit">
        {def?.from === 'wiktionary' ? (
          <>
            This meaning is from{' '}
            <a href="https://en.wiktionary.org/" rel="noreferrer">
              Wiktionary
            </a>
            ,{' '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noreferrer">
              CC BY-SA 4.0
            </a>
            .{' '}
          </>
        ) : null}
        Other meanings from{' '}
        <a href="https://github.com/globalwordnet/english-wordnet" rel="noreferrer">
          Open English WordNet
        </a>
        ,{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" rel="noreferrer">
          CC BY 4.0
        </a>
        .
      </p>
    </aside>
  );
}
