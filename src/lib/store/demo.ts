/**
 * `?demo=reference` fills progress with the state shown in the design
 * reference (five stamps, five castle rooms lit), for the screenshot
 * comparison, judges and the video. `?demo=reset` clears it.
 */
import { EMPTY_PROGRESS, update, withDiscovered, withRoomsLit } from './progress.ts';

export const REFERENCE_STAMPS = ['nigeria', 'egypt', 'tanzania', 'ethiopia', 'zambia'];

export async function applyDemoFromUrl(search: string): Promise<boolean> {
  const mode = new URLSearchParams(search).get('demo');
  if (mode === 'reference') {
    await update((p) =>
      withRoomsLit(REFERENCE_STAMPS.reduce(withDiscovered, p), 'africa', 5),
    );
    return true;
  }
  if (mode === 'reset') {
    await update(() => EMPTY_PROGRESS);
    return true;
  }
  return false;
}
