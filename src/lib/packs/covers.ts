/**
 * The reviewed cover photograph for each subject (21-review-2 Req 5-6).
 *
 * One hand-picked picture per subject that a ten-year-old would recognise
 * as that subject. This is the only list Home's subject prints read, so a
 * cover never depends on whichever article the daily rotation features.
 * `scripts/prepare-cover-photos.ts` checks each Commons file's licence and
 * author and writes `public/photos/covers/<subject>.jpg`; the credits are
 * in `CREDITS.md`, and `awari-licence-auditor` has reviewed the list.
 */
import type { BundledPackId } from './subjects.ts';

export type SubjectCover =
  | { subject: BundledPackId; source: 'commons'; commons: string; file: string; alt: string; caption: string }
  | { subject: BundledPackId; source: 'bundled'; file: string; alt: string; caption: string };

const c = (subject: BundledPackId, commons: string, alt: string, caption: string): SubjectCover => ({
  subject,
  source: 'commons',
  commons,
  file: `/photos/covers/${subject}.jpg`,
  alt,
  caption,
});

export const SUBJECT_COVERS: readonly SubjectCover[] = [
  c('countries', 'Flags of the world.jpg', 'A poster of hand-drawn flags from many countries', 'Countries'),
  c('wildlife', 'Lion waiting in Namibia.jpg', 'A lion looking out across dry grass', 'Wildlife'),
  c('space', 'Saturn during Equinox.jpg', 'Saturn and its rings seen by a spacecraft', 'Space'),
  { subject: 'ancient', source: 'bundled', file: '/photos/pyramids.jpg', alt: 'The pyramids of Giza', caption: 'Ancient worlds' },
  c('earth', 'Everest North Face toward Base Camp Tibet Luca Galuzzi 2006.jpg', 'Mount Everest and its snow ridges', 'Mountains and rivers'),
  c('body', 'Human Skeleton 2.jpg', 'A model of a human skeleton, head and chest', 'The human body'),
  c('science', 'Erlenmeyer flasks.jpg', 'Two glass laboratory flasks with stoppers', 'Science'),
  c('physics', 'Plasma-lamp 2.jpg', 'A plasma ball with purple lightning inside', 'Physics and chemistry'),
  c('inventions', 'First flight2.jpg', 'The Wright brothers’ first aeroplane flight in 1903', 'Inventions'),
  c('people', 'Einstein 1921 by F Schmutzer - restoration.jpg', 'Albert Einstein looking at the camera', 'Famous people'),
  c('arts', 'Mona Lisa, by Leonardo da Vinci, from C2RMF retouched.jpg', 'The Mona Lisa painting', 'Arts, music and sport'),
];

export function coverFor(subject: string): SubjectCover | undefined {
  return SUBJECT_COVERS.find((cover) => cover.subject === subject);
}
