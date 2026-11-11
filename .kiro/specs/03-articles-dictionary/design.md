# Design: Articles and dictionary

Screen design: `design/screens/README.md` (Article).

## Components

```
src/features/article/ArticleScreen.tsx  route; loads article + facts
src/features/article/ArticleBody.tsx    sections; words as <span data-w>
src/features/article/FactsCard.tsx      index card from facts.json
src/features/article/WordCard.tsx       side card + lookup field
src/features/article/credit.ts          builds credit lines (pure)
src/lib/dictionary/lookup.ts            lookupWord(word, loadShard) (pure)
src/lib/text/tokens.ts                  splitWords(paragraph) (pure)
```

### Tap a word

Each paragraph is split by `splitWords` into alternating word and gap
tokens; words render as `<span data-w>` (not buttons, so the page does not
get hundreds of tab stops). One delegated click handler on the body reads
`data-w` and sends the word to the side card. Keyboard and screen-reader
users use the side card's labelled field instead (Req 3.4).

### Lookup

`lookupWord(raw, loadShard)` walks `lemmaCandidates(raw)` in order, loads
each candidate's shard (`/packs/dictionary/<shard>.json`, cached), and
returns the first lemma found with its senses, or `null`. Shards are
fetched on demand and cached by the service worker, so lookups work
offline after the first visit.

### Discovery

Opening a country article calls `update(withDiscovered(id))`.

## Correctness properties

1. *Token round trip*: joining the tokens of `splitWords(p)` gives back
   `p` exactly, and every word token matches the word pattern. (Req 1.1,
   3.1)
2. *Lookup soundness*: when `lookupWord` returns an entry, its lemma is
   one of `lemmaCandidates(word)` and it exists in the dictionary. (Req
   3.1, 3.2)
3. *Lookup completeness*: if any candidate lemma is in the dictionary,
   `lookupWord` returns an entry (never a false "not found"). (Req 3.2,
   3.5)
4. *Case insensitivity*: lookup of a word and of its upper-case form give
   the same entry. (Req 3.2)
5. *Credit completeness*: for any article, the credit lines name the
   source, link it, name the licence and link the licence, and every
   photo's credit names an author and licence. (Req 2.1, 2.2)
6. *Facts formatting*: population and area format with thousands
   separators and never show `NaN` or `undefined`. (Req 1.4)

## Testing

Properties in `*.property.test.ts`; a pack test proves "delta" resolves
from the committed dictionary shards and that the Nigeria article loads;
a component test taps "delta" in the rendered Nigeria article.
