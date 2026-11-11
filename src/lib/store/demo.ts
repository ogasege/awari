/**
 * `?demo=reference` fills progress with the state shown in the design
 * reference (five stamps, five castle rooms lit), for the screenshot
 * comparison, judges and the video. `?demo=reset` clears it.
 */
import { EMPTY_PROGRESS, update, withDiscovered, withRoomsLit } from './progress.ts';

export const REFERENCE_STAMPS = ['nigeria', 'egypt', 'tanzania', 'ethiopia', 'zambia'];

/**
 * Applies a demo mode named in the query string, then removes the
 * parameter from the address so a reload does not repeat it. Resetting
 * is destructive, so it only happens after the person confirms.
 */
export async function applyDemoFromUrl(
  search: string,
  confirmReset: (message: string) => boolean = (m) => window.confirm(m),
): Promise<boolean> {
  const params = new URLSearchParams(search);
  const mode = params.get('demo');
  if (mode !== 'reference' && mode !== 'reset') {
    return false;
  }
  params.delete('demo');
  const rest = params.toString();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`,
  );
  if (mode === 'reference') {
    // Additive only: it never removes anything the student collected.
    await update((p) =>
      withRoomsLit(REFERENCE_STAMPS.reduce(withDiscovered, p), 'africa', 5),
    );
    return true;
  }
  if (!confirmReset('Clear every stamp, quiz score and castle room on this device?')) {
    return false;
  }
  await update(() => EMPTY_PROGRESS);
  return true;
}
