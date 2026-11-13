/**
 * Builds `packs/home.json` (19-home-world) from the finished packs: for
 * every subject a handful of featured articles with their lead photos,
 * and a pool of margin notes for Home to rotate through. A fact note is
 * an article sentence word for word (see notes.ts), and this builder
 * checks that its proof sentence is really in the article it points to.
 */
import { createHash } from 'node:crypto';
import type { HomeData, HomeFeatured, HomeNoteData, HomeSubjectData } from '../../src/lib/packs/home.ts';
import { SUBJECTS, type BundledPackId } from '../../src/lib/packs/subjects.ts';
import type { Article } from '../../src/lib/packs/types.ts';
import { questionFor, type QuestionKind } from '../../src/lib/text/questions.ts';
import { articleText } from './text.ts';

/** Featured articles kept per subject. */
export const FEATURED_PER_SUBJECT = 8;
/** Fact notes and question notes kept per subject, at most. */
export const FACTS_PER_SUBJECT = 24;
export const QUESTIONS_PER_SUBJECT = 6;

const hash = (text: string): string => createHash('sha1').update(text).digest('hex');

/** Subjects whose article titles name people or places (no article before them). */
const NAME_SUBJECTS: ReadonlySet<string> = new Set(['countries', 'people', 'earth', 'ancient', 'space']);
/** Subjects whose titles are countable things ("the violin"); the rest are materials and ideas. */
const COMMON_SUBJECTS: ReadonlySet<string> = new Set(['wildlife', 'body', 'inventions', 'arts']);

/** Builds the Home data from every bundled article. */
export function buildHome(articles: readonly Article[]): HomeData {
  const subjects: HomeSubjectData[] = [];
  const notes: HomeNoteData[] = [];
  for (const subject of SUBJECTS) {
    const id = subject.id as BundledPackId;
    const mine = articles
      .filter((a) => a.pack === id)
      .sort((a, b) => hash(a.id).localeCompare(hash(b.id)));
    const withPhoto = mine.filter((a) => a.photos.length > 0);
    const featured: HomeFeatured[] = withPhoto.slice(0, FEATURED_PER_SUBJECT).map((a) => {
      const photo = a.photos[0] as NonNullable<Article['photos'][number]>;
      return {
        pack: id,
        id: a.id,
        title: a.title,
        photo: { file: photo.file, alt: photo.alt, width: photo.width, height: photo.height },
      };
    });
    subjects.push({ id, featured });

    let facts = 0;
    for (const a of mine) {
      if (facts >= FACTS_PER_SUBJECT) break;
      for (const n of a.notes) {
        if (n.kind !== 'fact' || !n.proof) continue;
        if (!articleText(a.sections).includes(n.proof)) {
          throw new Error(`Home note for ${id}/${a.id} has a proof that is not in the article: ${n.text}`);
        }
        notes.push({
          kind: 'fact',
          text: n.text,
          to: `/article/${id}/${a.id}`,
          subject: id,
          article: `${id}/${a.id}`,
          proof: n.proof,
        });
        facts += 1;
        break; // one note per article keeps the pool varied
      }
    }
    mine.slice(0, QUESTIONS_PER_SUBJECT).forEach((a, i) => {
      const kind: QuestionKind = NAME_SUBJECTS.has(id) ? 'name' : COMMON_SUBJECTS.has(id) ? 'common' : 'mass';
      notes.push({
        kind: 'question',
        text: id === 'countries' ? `Can you find ${a.title} on the globe?` : questionFor(a.title, kind, hash(a.id).charCodeAt(0) + i),
        to: id === 'countries' ? `/atlas?c=${a.id}` : `/article/${id}/${a.id}`,
        subject: id,
      });
    });
  }
  return { subjects, notes };
}
