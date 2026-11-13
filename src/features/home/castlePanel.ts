/**
 * What Home's castle panel shows for today's wing (21-review-2 Req 12):
 * a photograph that matches the wing, or one of no particular place, and
 * a button label in sentence case ("Enter the Asia wing").
 */
import { coverFor } from '../../lib/packs/covers.ts';
import type { Wing } from '../castle/castle.ts';

export interface CastlePanel {
  photo: string;
  alt: string;
  /** Kit photo files under /photos, for the footer credit line. */
  credited: string;
}

const GONDAR = { photo: '/photos/castle.jpg', alt: 'A stone castle tower in Gondar, Ethiopia', credited: '/photos/castle.jpg' };
const EARTH = { photo: '/photos/earth.jpg', alt: 'The Earth seen from space', credited: '/photos/earth.jpg' };

export function castlePanel(wing: Wing | undefined): CastlePanel {
  if (!wing) return EARTH;
  if (wing.group === 'subject') {
    const cover = coverFor(wing.pack);
    return cover ? { photo: cover.file, alt: cover.alt, credited: cover.file } : EARTH;
  }
  // The only continent we hold a castle photograph for is Africa (Gondar).
  return wing.continent === 'Africa' ? GONDAR : EARTH;
}

/** "Enter the Asia wing": the wing's name with its leading "The" in lower case. */
export function enterLabel(wing: Wing | undefined): string {
  if (!wing) return 'Enter the castle';
  return `Enter ${wing.name.replace(/^The /, 'the ')}`;
}
