/**
 * What Home's castle panel shows for today's wing (22-review-3 Req 8): a
 * drawn castle door with the wing's name over it. It is never a photograph of
 * somewhere else, never the flag poster and never the hero's Earth, so the
 * panel cannot repeat a picture used elsewhere on the page (Req 9).
 */
import type { Wing } from '../castle/castle.ts';

export interface CastlePanel {
  /** Always a drawn door: the panel carries no photograph. */
  kind: 'door';
  /** The wing's name, shown over the door ("Asia", "Wildlife"). */
  label: string;
  alt: string;
}

export function castlePanel(wing: Wing | undefined): CastlePanel {
  const label = wing ? wing.name.replace(/^The /, '') : 'The castle';
  return { kind: 'door', label, alt: wing ? `A castle door for the ${label} wing` : 'A castle door' };
}

/** "Enter the Asia wing": the wing's name with its leading "The" in lower case. */
export function enterLabel(wing: Wing | undefined): string {
  if (!wing) return 'Enter the castle';
  return `Enter ${wing.name.replace(/^The /, 'the ')}`;
}
