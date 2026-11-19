/**
 * Subject pages (15-subject-packs Req 2): `/subject/:id` shows one
 * subject as a wall of prints, one for every article, with links to its
 * quizzes, its Castle wing and its timeline events. `/subjects` lists
 * every subject. Everything comes from the bundled packs, so it works
 * offline.
 */
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, MarginNote, StripHeading, TornEdge } from '../../design/paper.tsx';
import { perforation } from '../../design/wobble.ts';
import type { HomeData } from '../../lib/packs/home.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { usePack } from '../../lib/packs/load.ts';
import { SUBJECTS, subjectById, type Subject } from '../../lib/packs/subjects.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import { ClusterBoard, CountrySheets, HeroCollage, SubjectsTable } from './boards.tsx';
import './subject.css';

/** The castle wing id for a subject (Electricity keeps its saved id). */
export function wingFor(subject: Subject): string {
  return subject.id === 'physics' ? 'electricity' : subject.id;
}

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

export function SubjectPage({ id }: { id: string }) {
  const subject = subjectById(id);
  useTitle(subject?.name);
  const index = usePack<PackIndex>(subject ? `${subject.id}/index.json` : null);
  const home = usePack<HomeData>('home.json');
  const progress = useProgress();
  if (!subject) return <Unknown id={id} />;
  const items = index.status === 'ready' ? index.data.items : [];

  // A fact from this subject, checked against its article by the pack build (19-home-world Req 3).
  const note = home.status === 'ready' ? home.data.notes.find((n) => n.subject === subject.id && n.kind === 'fact') : undefined;
  const done = items.filter((a) => progress.quizzes[`${subject.id}/${a.id}`]).length;

  return (
    <section className={`subject subject--${subject.id}`} aria-labelledby="subject-title">
      <div className="subject__board grain">
        <div className="subject__titles">
          <StripHeading
            id="subject-title"
            lines={[
              { text: subject.name, tone: 'paper', tilt: -2 },
              { text: subject.id === 'countries' ? 'a stamp for each' : 'step inside', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
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
        <HeroCollage items={items} note={note && subject.id !== 'countries' ? { text: note.text, to: note.to } : undefined} />
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
      {index.status === 'ready' && subject.id === 'countries' ? <CountrySheets items={index.data.items} /> : null}
      {index.status === 'ready' && subject.id !== 'countries' ? (
        <>
          <p className="subject__count" role="status">
            {items.length} articles in this subject.
          </p>
          <ClusterBoard subject={subject} items={items} />
        </>
      ) : null}
      </div>
    </section>
  );
}

export default function SubjectScreen({ params }: { params: Record<string, string> }) {
  return <SubjectPage id={params['id'] ?? ''} />;
}

export function SubjectList() {
  useTitle('Subjects');
  return (
    <section className="subjects-page" aria-labelledby="subjects-title">
      <div className="subjects-page__head">
        <StripHeading
          id="subjects-title"
          lines={[
            { text: 'Every subject', tone: 'paper', tilt: -2 },
            { text: 'pick one', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
          ]}
        />
        <MarginNote tilt={-2} size={30} className="subjects-intro crowding" style={{ color: 'var(--navy)' }}>
          {SUBJECTS.length} subjects. Pick a picture to open its pages.
        </MarginNote>
      </div>
      <SubjectsTable />
    </section>
  );
}
