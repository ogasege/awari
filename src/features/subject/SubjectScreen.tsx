/**
 * Subject pages (15-subject-packs Req 2): `/subject/:id` shows one
 * subject as a wall of prints, one for every article, with links to its
 * quizzes, its Castle wing and its timeline events. `/subjects` lists
 * every subject. Everything comes from the bundled packs, so it works
 * offline.
 */
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, Doodle, MarginNote, Print, StripHeading, TornEdge } from '../../design/paper.tsx';
import { perforation } from '../../design/wobble.ts';
import { coverFor } from '../../lib/packs/covers.ts';
import type { HomeData } from '../../lib/packs/home.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { CONTINENTS, SUBJECTS, continentSlug, normaliseContinent, subjectById, type Subject } from '../../lib/packs/subjects.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import './subject.css';

/** The castle wing id for a subject (Electricity keeps its saved id). */
export function wingFor(subject: Subject): string {
  return subject.id === 'physics' ? 'electricity' : subject.id;
}

const TILTS = [-3, 2.5, -2, 4, -4, 3] as const;
const STAMP_EDGE = perforation(6, 6);

function Unknown({ id }: { id: string }) {
  useTitle('Subjects');
  return (
    <section className="page squared subject" aria-labelledby="subject-missing">
      <StripHeading id="subject-missing" lines={[{ text: 'No such subject', tone: 'yellow', tilt: -2 }]} />
      <p role="alert">
        There is no subject called “{id}”. <Link to="/subjects">See every subject</Link>.
      </p>
    </section>
  );
}

function Countries({ index }: { index: PackIndex }) {
  return (
    <>
      {CONTINENTS.map((continent) => {
        const items = index.items.filter((i) => normaliseContinent(i.continent) === continent);
        return (
          <section key={continent} aria-labelledby={`continent-${continentSlug(continent)}`}>
            <h2 id={`continent-${continentSlug(continent)}`}>
              {continent} <span className="subject__count">({items.length})</span>
            </h2>
            <ul className="subject__names">
              {items.map((i) => (
                <li key={i.id}>
                  <Link to={`/article/countries/${i.id}`}>{i.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

export function SubjectPage({ id }: { id: string }) {
  const subject = subjectById(id);
  useTitle(subject?.name);
  const index = usePack<PackIndex>(subject ? `${subject.id}/index.json` : null);
  const home = usePack<HomeData>('home.json');
  const progress = useProgress();
  if (!subject) return <Unknown id={id} />;
  const items = index.status === 'ready' ? index.data.items : [];

  const lead = items.find((a) => a.thumb);
  // A fact from this subject, checked against its article by the pack build (19-home-world Req 3).
  const note = home.status === 'ready' ? home.data.notes.find((n) => n.subject === subject.id && n.kind === 'fact') : undefined;
  const done = items.filter((a) => progress.quizzes[`${subject.id}/${a.id}`]).length;

  return (
    <section className="subject" aria-labelledby="subject-title">
      <div className="subject__board grain">
        <div className="subject__titles">
          <StripHeading
            id="subject-title"
            lines={[
              { text: subject.name, tone: 'paper', tilt: -2 },
              { text: subject.id === 'countries' ? 'around the world' : 'step inside', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
            ]}
          />
          <p className="subject__lead">{subject.blurb}</p>
          <div className="subject__actions">
            <Button to={`/quizzes#quizzes-${subject.id}`}>Take a quiz</Button>
            <Button to={subject.id === 'countries' ? '/castle/africa' : `/castle/${wingFor(subject)}`} tone="outline">
              Visit the castle wing
            </Button>
            <Button to={`/timeline?subject=${subject.id}`} tone="outline">
              See it on the timeline
            </Button>
            {subject.id === 'countries' ? (
              <Button to="/atlas" tone="outline">
                Spin the globe
              </Button>
            ) : null}
          </div>
        </div>
        {lead?.thumb ? (
          <div className="subject__lead-print">
            <Print
              to={`/article/${subject.id}/${lead.id}`}
              src={packUrl(lead.thumb)}
              alt=""
              caption={lead.title}
              captionSize={30}
              aspect="4 / 3"
              tilt={3}
              tape={[{ left: '36%', width: 110, tilt: -5 }]}
            />
            {note ? (
              <div className="subject__note crowding">
                <MarginNote tilt={-3} size={26} color="var(--yellow)">
                  <a href={note.to}>{note.text}</a>
                </MarginNote>
                <Doodle kind="arrow" seed={`note-${subject.id}`} size={64} color="var(--yellow)" from={{ x: 6, y: 8 }} to={{ x: 58, y: 54 }} className="crowding" />
              </div>
            ) : null}
          </div>
        ) : null}
        <TornEdge color="var(--paper)" seed={`subject-${subject.id}`} height={30} />
      </div>

      <div className="page squared subject__paper">
      {subject.id !== 'countries' && items.length > 0 ? (
        <div className="subject__progress">
          <p>
            <strong>
              {done} of {items.length}
            </strong>{' '}
            quizzes done in this subject.
          </p>
          <div className="subject__stamps" aria-hidden="true">
            {items.map((a) => (
              <span key={a.id} className={progress.quizzes[`${subject.id}/${a.id}`] ? 'is-done' : ''} style={{ clipPath: STAMP_EDGE }} />
            ))}
          </div>
        </div>
      ) : null}
      {index.status === 'loading' ? <p>Gathering the prints…</p> : null}
      {index.status === 'error' ? <p>This subject could not be opened. Try again when you are online.</p> : null}
      {index.status === 'ready' && subject.id === 'countries' ? <Countries index={index.data} /> : null}
      {index.status === 'ready' && subject.id !== 'countries' ? (
        <>
          <p className="subject__count" role="status">
            {items.length} articles in this subject.
          </p>
          <ul className="subject__wall">
            {items.map((a, i) => (
              <li key={a.id}>
                {a.thumb ? (
                  <Print
                    to={`/article/${subject.id}/${a.id}`}
                    src={packUrl(a.thumb)}
                    alt=""
                    caption={a.title}
                    captionSize={26}
                    aspect="4 / 3"
                    tilt={TILTS[i % TILTS.length]}
                    className="subject__print"
                  />
                ) : (
                  <Link to={`/article/${subject.id}/${a.id}`}>{a.title}</Link>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      </div>
    </section>
  );
}

export default function SubjectScreen({ params }: { params: Record<string, string> }) {
  return <SubjectPage id={params['id'] ?? ''} />;
}

/** `/subjects`: every subject as a card. */
const CARD_TILTS = [-2.5, 1.8, -1.2, 2.6, -2, 1.4, -2.8, 2.2] as const;

/** One subject as its cover print with a handwritten label and the number of articles in its pack. */
function SubjectPrint({ subject, index }: { subject: (typeof SUBJECTS)[number]; index: number }) {
  const cover = coverFor(subject.id);
  const pack = usePack<PackIndex>(`${subject.id}/index.json`);
  const count = pack.status === 'ready' ? pack.data.items.length : undefined;
  return (
    <li className="subject-print">
      <Print
        to={`/subject/${subject.id}`}
        src={cover?.file ?? '/photos/earth.jpg'}
        alt={cover?.alt ?? subject.name}
        caption={subject.name}
        captionSize={26}
        width={230}
        tilt={CARD_TILTS[index % CARD_TILTS.length]}
        tape={[{ left: `${28 + ((index * 17) % 30)}%`, width: 96, tilt: index % 2 === 0 ? -5 : 6, tone: index % 3 === 0 ? 'teal' : 'yellow' }]}
      />
      <p className="subject-print__count hand">{count === undefined ? '…' : `${count} ${count === 1 ? 'article' : 'articles'}`}</p>
      <p className="subject-print__blurb">{subject.blurb}</p>
    </li>
  );
}

export function SubjectList() {
  useTitle('Subjects');
  return (
    <section className="page squared subject" aria-labelledby="subjects-title">
      <StripHeading
        id="subjects-title"
        lines={[
          { text: 'Every subject', tone: 'paper', tilt: -2 },
          { text: 'pick one', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
        ]}
      />
      <MarginNote tilt={-2} size={30} className="subjects-intro crowding" style={{ color: 'var(--teal-ink)' }}>
        {SUBJECTS.length} subjects. Tap a picture to open its pages.
      </MarginNote>
      <ul className="subject-prints">
        {SUBJECTS.map((s, i) => (
          <SubjectPrint key={s.id} subject={s} index={i} />
        ))}
      </ul>
    </section>
  );
}
