/** Test helper: the right page for the picture question on screen (the file name of its picture is its id in the library). */
import { readFileSync } from 'node:fs';

export const PICTURE_PROMPT = 'Which page does this picture belong to?';

export function pictureAnswer(pack: string): string | undefined {
  const src = document.querySelector('.question__image')?.getAttribute('src') ?? '';
  const id = /\/img\/([0-9a-f]+)\.webp/.exec(src)?.[1];
  const file = JSON.parse(readFileSync(`public/media/${pack}.json`, 'utf8')) as { items: Array<{ id: string; articleTitle: string }> };
  return file.items.find((m) => m.id === id)?.articleTitle;
}
