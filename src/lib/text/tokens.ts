/** Splits running text into word and gap tokens for tap-to-define. */

export interface Token {
  text: string;
  word: boolean;
}

const WORD = /[A-Za-zÀ-ɏ0-9]+(?:['’-][A-Za-zÀ-ɏ0-9]+)*/g;

/** Tokens alternate words and gaps; joining their text gives the input. */
export function splitWords(text: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of text.matchAll(WORD)) {
    const at = m.index ?? 0;
    if (at > last) {
      out.push({ text: text.slice(last, at), word: false });
    }
    out.push({ text: m[0], word: true });
    last = at + m[0].length;
  }
  if (last < text.length) {
    out.push({ text: text.slice(last), word: false });
  }
  return out;
}

/** True when a token's text is a single word under the word pattern. */
export function isWord(text: string): boolean {
  return new RegExp(`^${WORD.source}$`).test(text);
}
