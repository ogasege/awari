/**
 * The shape of `packs/home.json` (19-home-world): per subject a few
 * featured articles with their lead photos, and a pool of margin notes.
 * Built from the packs by the pipeline, read by Home.
 */
import type { BundledPackId } from './subjects.ts';

export interface HomeFeatured {
  pack: BundledPackId;
  id: string;
  title: string;
  photo: { file: string; alt: string; width: number; height: number };
}

export interface HomeSubjectData {
  id: BundledPackId;
  featured: HomeFeatured[];
}

export interface HomeNoteData {
  kind: 'fact' | 'question';
  text: string;
  /** Where the note leads: the article page. */
  to: string;
  subject: BundledPackId;
  /** For facts: "<pack>/<id>" of the article checked against. */
  article?: string;
  /** For facts: the exact sentence of that article that backs the note. */
  proof?: string;
}

export interface HomeData {
  subjects: HomeSubjectData[];
  notes: HomeNoteData[];
}
