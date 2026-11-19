/**
 * Pieces of the subject screens (28-every-screen-like-home task 4): the subjects table, the hero collage, the themed
 * clusters of prints, and the countries as continent stamp sheets. Links, buttons and text stay straight (Rule 7).
 */
import { useState } from 'react';
import { MarginNote, Print, Stamp } from '../../design/paper.tsx';
import { coverFor } from '../../lib/packs/covers.ts';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { CONTINENTS, SUBJECTS, normaliseContinent, type Subject } from '../../lib/packs/subjects.ts';
import type { PackIndex, PackIndexItem } from '../../lib/packs/types.ts';
import { groupOf } from '../../lib/quiz/groups.ts';
import { useProgress } from '../../lib/store/useProgress.ts';

const TILT = [-4, 3, -2, 5, -3, 2, -5, 4] as const;
const tilt = (i: number): number => TILT[i % TILT.length] ?? 0;

/** One handwritten question per subject, shown on its print on the subjects table. */
export const SUBJECT_QUESTIONS: Record<string, string> = {
  countries: 'Where will you go first?',
  wildlife: 'Who is hiding in the grass?',
  space: 'What is up beyond the sky?',
  ancient: 'Who built the pyramids?',
  earth: 'How does a mountain grow?',
  body: 'What is your heart doing right now?',
  science: 'What is everything made of?',
  physics: 'Where does lightning come from?',
  inventions: 'What will people invent next?',
  people: 'Whose story will you read?',
  arts: 'Which sound is your favourite?',
};

/** Size classes, so no two neighbours are the same size: large, medium, small, medium, ... */
const SIZES = [320, 250, 210, 270, 230, 300, 220, 260, 240, 290, 215] as const;

function SubjectTablePrint({ subject, index }: { subject: Subject; index: number }) {
  const cover = coverFor(subject.id);
  const pack = usePack<PackIndex>(`${subject.id}/index.json`);
  const count = pack.status === 'ready' ? pack.data.items.length : undefined;
  const width = SIZES[index % SIZES.length] ?? 240;
  return (
    <li className={`subjects-table__item subjects-table__item--${index % 4}`}>
      <Print
        to={`/subject/${subject.id}`}
        src={cover?.file ?? '/photos/earth.jpg'}
        alt={`${subject.name}, ${count ?? 'many'} articles`}
        caption={subject.label}
        captionSize={width > 260 ? 34 : 28}
        width={width}
        tilt={tilt(index)}
        tape={[{ left: `${26 + ((index * 17) % 34)}%`, width: 100, tilt: index % 2 ? 6 : -5, tone: index % 3 === 0 ? 'teal' : 'yellow' }]}
      />
      <p aria-hidden="true" className="subjects-table__ask hand">
        {SUBJECT_QUESTIONS[subject.id]}
      </p>
      <p className="subjects-table__count">{count === undefined ? ' ' : `${count} ${count === 1 ? 'article' : 'articles'}`}</p>
    </li>
  );
}

/** `/subjects`: Home's "Step into a subject", full size, on the coral table. */
export function SubjectsTable() {
  return (
    <div className="subjects-table">
      <ul className="subjects-table__list">
        {SUBJECTS.map((s, i) => (
          <SubjectTablePrint key={s.id} subject={s} index={i} />
        ))}
      </ul>
    </div>
  );
}

const CLUSTER_LABELS: Record<string, string> = {
  planets: 'Planets',
  sky: 'Stars and sky',
  craft: 'Rockets and machines',
  people: 'People who went',
  rivers: 'Rivers',
  mountains: 'Mountains and volcanoes',
  seas: 'Seas and reefs',
  landmarks: 'Places to visit',
};

export interface Cluster {
  label: string;
  items: PackIndexItem[];
}

/** Themed clusters from the quiz groups where the subject has them, the rest in alphabetical bands ("A to F"). */
export function clustersFor(subjectId: string, items: readonly PackIndexItem[]): Cluster[] {
  const byGroup = new Map<string, PackIndexItem[]>();
  const rest: PackIndexItem[] = [];
  for (const item of items) {
    const g = ['space', 'earth', 'ancient'].includes(subjectId) ? groupOf(`${subjectId}/${item.id}`) : undefined;
    if (g && CLUSTER_LABELS[g.id]) byGroup.set(g.id, [...(byGroup.get(g.id) ?? []), item]);
    else rest.push(item);
  }
  const out: Cluster[] = [...byGroup].map(([id, list]) => ({ label: CLUSTER_LABELS[id] as string, items: list }));
  const sorted = [...rest].sort((a, b) => a.title.localeCompare(b.title));
  if (sorted.length === 0) return out;
  if (out.length > 0) {
    out.push({ label: 'More to explore', items: sorted });
    return out;
  }
  const bands = Math.max(1, Math.min(4, Math.round(sorted.length / 8)));
  const size = Math.ceil(sorted.length / bands);
  for (let b = 0; b < bands; b += 1) {
    const part = sorted.slice(b * size, (b + 1) * size);
    if (part.length === 0) continue;
    const first = part[0]?.title.charAt(0).toUpperCase();
    const last = part[part.length - 1]?.title.charAt(0).toUpperCase();
    out.push({ label: bands === 1 ? 'Everything here' : first === last ? first ?? '' : `${first} to ${last}`, items: part });
  }
  return out;
}

const PRINT_W = [250, 190, 220, 170, 235, 200] as const;

export function ClusterBoard({ subject, items }: { subject: Subject; items: readonly PackIndexItem[] }) {
  const progress = useProgress();
  const clusters = clustersFor(subject.id, items);
  return (
    <div className="clusters">
      {clusters.map((c, ci) => (
        <section key={c.label} className={`cluster cluster--${ci % 3}`} aria-labelledby={`cluster-${subject.id}-${ci}`}>
          <h2 id={`cluster-${subject.id}-${ci}`} className="cluster__label hand">
            {c.label}
            <span className="cluster__count"> {c.items.length}</span>
          </h2>
          <ul className="cluster__prints">
            {c.items.map((a, i) => {
              const played = !!progress.quizzes[`${subject.id}/${a.id}`];
              return (
                <li key={a.id} className={`cluster__item cluster__item--${i % 6}`}>
                  <Print
                    to={`/article/${subject.id}/${a.id}`}
                    src={a.thumb ? packUrl(a.thumb) : (coverFor(subject.id)?.file ?? '')}
                    alt=""
                    caption={a.title}
                    captionSize={22}
                    aspect="4 / 3"
                    width={PRINT_W[(i + ci) % PRINT_W.length]}
                    tilt={tilt(i + ci)}
                    tape={i % 3 === 0 ? [{ left: '34%', width: 80, tilt: i % 2 ? 6 : -6, tone: 'yellow' }] : undefined}
                    pin={i % 5 === 2 ? '46%' : undefined}
                  />
                  {played ? (
                    <span aria-hidden="true" className="cluster__done hand">
                      quiz done
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** The hero collage: the lead print large, two smaller prints overlapping it, and a handwritten note. */
export function HeroCollage({ items, note }: { items: readonly PackIndexItem[]; note?: { text: string; to: string } }) {
  const withThumb = items.filter((a) => a.thumb);
  const [big, second, third] = withThumb;
  if (!big) return null;
  return (
    <div className="hero-collage">
      {third?.thumb ? (
        <Print className="hero-collage__c" src={packUrl(third.thumb)} alt="" caption={third.title} captionSize={22} aspect="4 / 3" width={190} tilt={7} />
      ) : null}
      {second?.thumb ? (
        <Print className="hero-collage__b" src={packUrl(second.thumb)} alt="" caption={second.title} captionSize={24} aspect="4 / 3" width={230} tilt={-6} tape={[{ left: '30%', width: 80, tilt: -6, tone: 'yellow' }]} />
      ) : null}
      <Print className="hero-collage__a" src={packUrl(big.thumb as string)} alt="" caption={big.title} captionSize={30} aspect="4 / 3" width={360} tilt={3} tape={[{ left: '36%', width: 110, tilt: -5 }]} />
      {note ? (
        <MarginNote tilt={-3} size={26} color="var(--yellow)" className="hero-collage__note">
          <a href={note.to}>{note.text}</a>
        </MarginNote>
      ) : null}
    </div>
  );
}

const SHEET_SIZE = 10;

/** The countries as one stamp sheet per continent, each stamp opening that country's article. */
export function CountrySheets({ items }: { items: readonly PackIndexItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="country-sheets">
      {CONTINENTS.map((c) => {
        const all = items.filter((i) => normaliseContinent(i.continent) === c);
        if (all.length === 0) return null;
        const list = open === c ? all : all.slice(0, SHEET_SIZE);
        return (
          <section key={c} className="country-sheet" aria-labelledby={`continent-${c.replace(/\s+/g, '-')}`}>
            <h2 id={`continent-${c.replace(/\s+/g, '-')}`} className="country-sheet__title">
              {c} <span className="hand">{all.length} countries</span>
            </h2>
            <ul className="country-sheet__stamps">
              {list.map((i, k) => (
                <li key={i.id}>
                  <Stamp name={i.title} caption="read" src={i.thumb ? packUrl(i.thumb) : (coverFor('countries')?.file ?? '')} alt="" tilt={tilt(k) / 2} to={`/article/countries/${i.id}`} />
                </li>
              ))}
            </ul>
            {all.length > SHEET_SIZE ? (
              <button type="button" className="btn btn--outline country-sheet__more" aria-expanded={open === c} onClick={() => setOpen(open === c ? null : c)}>
                {open === c ? 'Show fewer' : `Show all ${all.length} in ${c}`}
              </button>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
