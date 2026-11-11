/**
 * The Physics pack, starting with electricity: a fixed list of Simple
 * English Wikipedia articles, each with a Commons search phrase used
 * when the article itself has no usable photo.
 */
import type { Article } from '../../src/lib/packs/types.ts';
import { assertUniqueIds, buildArticle } from './articles.ts';

/** Article title and a Commons search phrase for its lead photo. */
export interface PhysicsTopic {
  title: string;
  photoQuery: string;
}

/** The electricity articles, in reading order. */
export const PHYSICS_TOPICS: readonly PhysicsTopic[] = [
  { title: 'Electricity', photoQuery: 'electricity pylons power lines' },
  { title: 'Electric charge', photoQuery: 'Van de Graaff generator hair' },
  { title: 'Electric current', photoQuery: 'electric current light bulb' },
  { title: 'Voltage', photoQuery: 'voltmeter multimeter battery' },
  { title: 'Electrical resistance', photoQuery: 'resistors electronic' },
  { title: "Ohm's law", photoQuery: 'Georg Simon Ohm' },
  { title: 'Electrical circuit', photoQuery: 'breadboard circuit LED' },
  { title: 'Battery', photoQuery: 'AA batteries' },
  { title: 'Electrical conductor', photoQuery: 'copper wire cable' },
  { title: 'Insulator (electricity)', photoQuery: 'ceramic insulator power line' },
  { title: 'Static electricity', photoQuery: 'static electricity hair balloon' },
  { title: 'Lightning', photoQuery: 'lightning strike night' },
];

/** Builds every physics article, in list order. */
export async function buildPhysicsArticles(): Promise<Article[]> {
  const articles: Article[] = [];
  for (const topic of PHYSICS_TOPICS) {
    articles.push(await buildArticle('physics', topic.title));
  }
  assertUniqueIds(articles);
  return articles;
}
