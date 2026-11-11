/**
 * A deliberately small Markdown reader for our own documents (CREDITS.md):
 * headings, paragraphs, bullet lists, pipe tables and inline code. It
 * returns plain data; React renders it, so no HTML is ever injected.
 */
export type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] };

const cells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());

/** Parses Markdown text into blocks. HTML comments are dropped. */
export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] as string;
    if (line.trim() === '') {
      i += 1;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ kind: 'heading', level: (h[1] as string).length, text: h[2] as string });
      i += 1;
      continue;
    }
    if (line.trim().startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] as string).trim().startsWith('|')) {
        const row = cells(lines[i] as string);
        if (!row.every((c) => /^:?-{3,}:?$/.test(c))) {
          rows.push(row);
        }
        i += 1;
      }
      const [head = [], ...body] = rows;
      blocks.push({ kind: 'table', head, rows: body });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] as string)) {
        items.push((lines[i] as string).replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      blocks.push({ kind: 'list', items });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      (lines[i] as string).trim() !== '' &&
      !/^(#{1,6}\s|\s*[-*]\s|\s*\|)/.test(lines[i] as string)
    ) {
      para.push((lines[i] as string).trim());
      i += 1;
    }
    blocks.push({ kind: 'paragraph', text: para.join(' ') });
  }
  return blocks;
}
