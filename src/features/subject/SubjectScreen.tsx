/**
 * Subject pages (15-subject-packs Req 2): `/subject/:id` shows one
 * subject as a wall of prints, one for every article, with links to its
 * quizzes, its Castle wing and its timeline events. `/subjects` lists
 * every subject. Everything comes from the bundled packs, so it works
 * offline.
 */
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, Print, StripHeading } from '../../design/paper.tsx';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { CONTINENTS, SUBJECTS, continentSlug, normaliseContinent, subjectById, type Subject } from '../../lib/packs/subjects.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import './subject.css';

/** The castle wing id for a subject (Electricity keeps its saved id). */
export function wingFor(subject: Subject): string {
  return subject.id === 'physics' ? 'electricity' : subject.id;
}

const TILTS = [-3, 2.5, -2, 4, -4, 3] as const;

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
  if (!subject) return <Unknown id={id} />;
  const items = index.status === 'ready' ? index.data.items : [];

  return (
    <section className="page squared subject" aria-labelledby="subject-title">
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
    </section>
  );
}

export default function SubjectScreen({ params }: { params: Record<string, string> }) {
  return <SubjectPage id={params['id'] ?? ''} />;
}

/** `/subjects`: every subject as a card. */
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
      <ul className="subject__cards">
        {SUBJECTS.map((s) => (
          <li key={s.id}>
            <Link to={`/subject/${s.id}`} className="subject__card lift">
              <span className="subject__card-name">{s.name}</span>
              <span>{s.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
