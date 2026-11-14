/** Test helper: the right page for the picture question on screen (the file name of its picture is its id in the library). */
import { readFileSync } from 'node:fs';

export const PICTURE_PROMPT = /^(?:What is this a picture of|Which country is this a picture of)\?$/;

/** True when the question on screen is a picture question (it shows a picture above its answers). */
export function isPictureQuestion(): boolean {
  return document.querySelector('.question__image') !== null;
}

export function pictureAnswer(pack: string): string | undefined {
  const src = document.querySelector('.question__image')?.getAttribute('src') ?? '';
  const id = /\/img\/([0-9a-f]+)\.webp/.exec(src)?.[1];
  const file = JSON.parse(readFileSync(`public/media/${pack}.json`, 'utf8')) as { items: Array<{ id: string; articleTitle: string }> };
  return file.items.find((m) => m.id === id)?.articleTitle;
}
