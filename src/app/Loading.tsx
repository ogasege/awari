/**
 * What a screen shows while it opens (owner feedback 19 Nov, "a white page flashes between screens"). The header stays;
 * the table is painted in the colour of the screen being opened, with one handwritten line, so a slow phone or a video
 * never shows a bare white page.
 */
import type { RouteName } from './router.ts';

type Tone = 'navy' | 'teal' | 'coral' | 'cream';

const TONE: Partial<Record<RouteName, Tone>> = {
  atlas: 'navy',
  quiz: 'navy',
  castle: 'navy',
  wing: 'navy',
  article: 'teal',
  timeline: 'teal',
  media: 'teal',
  quizzes: 'coral',
  subjects: 'coral',
  subject: 'teal',
  tours: 'coral',
  tour: 'coral',
  stamps: 'cream',
  continentStamps: 'cream',
  search: 'coral',
  credits: 'cream',
};

const WORDS: Partial<Record<RouteName, string>> = {
  atlas: 'Spinning the globe…',
  quiz: 'Shuffling the questions…',
  quizzes: 'Laying out the quizzes…',
  castle: 'Lighting the torches…',
  wing: 'Lighting the torches…',
  timeline: 'Unrolling the ruler…',
  media: 'Laying out the pictures…',
  subjects: 'Spreading the prints…',
  subject: 'Spreading the prints…',
  stamps: 'Opening the stamp book…',
  continentStamps: 'Opening the stamp book…',
  tours: 'Packing the bags…',
  tour: 'Packing the bags…',
  search: 'Looking through the shelves…',
};

export function Loading({ route, words }: { route?: RouteName; words?: string }) {
  const tone = (route && TONE[route]) ?? 'coral';
  const line = words ?? (route && WORDS[route]) ?? 'Opening the page…';
  return (
    <div className={`app__loading app__loading--${tone}`} role="status">
      <p className="hand">{line}</p>
    </div>
  );
}
