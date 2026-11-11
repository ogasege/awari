/**
 * Fetches the plain text of a Simple English Wikipedia article for the
 * optional quiz service (05-quizzes Req 4). The text is CC BY-SA 4.0.
 */
export interface WikipediaText {
  title: string;
  text: string;
  url: string;
}

/** The service accepts 200 to 40000 characters. */
export const MIN_CHARS = 200;
export const MAX_CHARS = 40_000;

const API = 'https://simple.wikipedia.org/w/api.php';

/** Cuts text at the last paragraph break before `max` characters. */
export function clipText(text: string, max = MAX_CHARS): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const para = cut.lastIndexOf('\n\n');
  return (para > max / 2 ? cut.slice(0, para) : cut).trimEnd();
}

/** Resolves to the article text, or `null` when it cannot be had. */
export async function fetchWikipediaText(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<WikipediaText | null> {
  const title = query.trim();
  if (title === '') return null;
  try {
    const params = new URLSearchParams({
      action: 'query',
      prop: 'extracts',
      explaintext: '1',
      redirects: '1',
      titles: title,
      format: 'json',
      formatversion: '2',
      origin: '*',
    });
    const res = await fetchImpl(`${API}?${params.toString()}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Array<{ title?: string; extract?: string; missing?: boolean }> };
    };
    const page = data.query?.pages?.[0];
    if (!page || page.missing || !page.title || !page.extract) return null;
    const text = clipText(page.extract.trim());
    if (text.length < MIN_CHARS) return null;
    return {
      title: page.title,
      text,
      url: `https://simple.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
    };
  } catch {
    return null;
  }
}
