/**
 * Home: the scrapbook front page, composed after design/home.html.
 * Sections: hero, subjects, on this day + stamp book, learn by playing.
 */
import { useMemo, type CSSProperties } from 'react';
import { Header } from '../../app/Header.tsx';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import {
  Button,
  HandUnderline,
  MarginNote,
  Print,
  StripHeading,
  TornEdge,
  u,
} from '../../design/paper.tsx';
import { rng, seedFrom, wobblyCirclePoints } from '../../design/wobble.ts';
import type { HomeData } from '../../lib/packs/home.ts';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { subjectById } from '../../lib/packs/subjects.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { WINGS } from '../castle/castle.ts';
import { creditLine } from './bundledCredits.ts';
import { CastleDoor } from './CastleDoor.tsx';
import { PictureOfTheDay } from '../media/PictureOfTheDay.tsx';
import { castlePanel, enterLabel } from './castlePanel.ts';
import { DoorRow } from './DoorRow.tsx';
import { KitLayer } from './KitLayer.tsx';
import { HERO_NOTES, SUBJECT_NOTES } from './notes.ts';
import { OnThisDay } from './OnThisDay.tsx';
import { StampBook } from './StampBook.tsx';
import { coverFor } from '../../lib/packs/covers.ts';
import { dayNumber, todaysQuiz } from './today.ts';
import { notesBeside, pickFeatured, pickSubjects, subjectsWithPrints } from './rotation.ts';
import './home.css';

/** An irregular, hand-cut circle as a CSS polygon (white print border). */
function cutCircle(seed: string): string {
  const pts = wobblyCirclePoints(50, 50, 49, seedFrom(seed), 0.008).slice(0, 18);
  return `polygon(${pts.map((p) => `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`).join(',')})`;
}

/** Home's daily picks come from `packs/home.json`; until it loads the kit photos and notes stand in. */
function useHomeData(): HomeData | null {
  const data = usePack<HomeData>('home.json');
  return data.status === 'ready' ? data.data : null;
}

interface ShownNote {
  text: string;
  to: string;
}

/**
 * Notes for today (19-home-world Req 3). The three hero notes stay put:
 * their drawn arrows point at real places on the Earth photograph
 * (Madagascar, the Sahara, Antarctica), so a rotating note would point at
 * the wrong place. The three subject notes rotate daily and come from the
 * subjects shown in today's prints, so each note sits by its own subject.
 */
/** The print slots the three subject notes sit beside (left, top-right, bottom-right). */
const NOTE_SLOTS = [0, 2, 4] as const;

function useNotes(day: number): Array<ShownNote | undefined> {
  const data = useHomeData();
  const hero: ShownNote[] = [HERO_NOTES.dry, HERO_NOTES.lemurs, HERO_NOTES.ice];
  const fallback: ShownNote[] = [SUBJECT_NOTES.falls, SUBJECT_NOTES.pyramids, SUBJECT_NOTES.kili];
  if (!data) return [...hero, ...fallback];
  const picked = notesBeside(day, data.notes, pickSubjects(day, subjectsWithPrints(data), 5), NOTE_SLOTS);
  return [...hero, ...picked];
}

const pos = (left: string, top: string, extra: CSSProperties = {}): CSSProperties => ({
  left,
  top,
  ...extra,
});

function Hero({ day }: { day: number }) {
  const ring = useMemo(() => cutCircle('earth'), []);
  const notes = useNotes(day);
  return (
    <div className="home-hero grain">
      <Header />
      <section className="home-hero__body" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <StripHeading
            id="home-title"
            lines={[
              { text: 'What will you', tone: 'paper', tilt: -3 },
              { text: 'discover', tone: 'yellow', tilt: 2, style: { marginLeft: '0.62em' } },
              { text: 'today?', tone: 'navy', tilt: -1.5, style: { marginLeft: '0.12em' } },
            ]}
          />
          <p className="home-hero__lead">
            An encyclopedia you explore by place, by date, or by playing. It{' '}
            <HandUnderline>keeps working when the internet does not</HandUnderline>.
          </p>
          <div className="home-hero__actions">
            <Button to="/atlas">Spin the globe</Button>
            <Button to="/article/countries/random" tone="outline">
              Surprise me
            </Button>
          </div>
          <p aria-hidden="true" className="home-hero__spin hand crowding">
            go on, give it a spin
            <svg viewBox="0 0 170 56" width="150" height="50" fill="none" stroke="#FFD23F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.2 34.1C11.8 35.3 42 46.5 59.6 46.3C79.9 46 102.4 38 118.4 32.6C135.3 27.2 151.8 12.1 158.4 7.1" />
              <path d="M160 6Q156.6 11.1 154.6 16.9" />
              <path d="M160 6Q153.6 7.9 146.9 7.1" />
            </svg>
          </p>
        </div>

        <div className="collage home-hero__art" data-w="860">
          <div className="collage__inner" style={{ aspectRatio: '860 / 650' }}>
            <Link
              to="/atlas"
              className="abs home-earth lift"
              aria-label="Open the atlas and spin the globe"
              style={pos('19.77%', '10.77%', { width: '74.42%' })}
            >
              <span className="home-earth__ring" style={{ clipPath: ring }} />
              <img
                src="/photos/earth.jpg"
                alt="The whole Earth photographed from space, with Africa and Madagascar in view"
                width={900}
                height={900}
              />
            </Link>
            <KitLayer layer="hero" />
            <Link to={notes[0]?.to ?? '/'} className="abs home-q hand crowding" style={pos('0', '4.4%', { width: u(230), fontSize: u(38), rotate: '-6deg' })}>
              {notes[0]?.text}
            </Link>
            <Link to={notes[1]?.to ?? '/'} className="abs home-q hand crowding" style={{ right: '4.5%', top: 0, width: u(215), textAlign: 'right', fontSize: u(36), rotate: '4deg', color: 'var(--yellow)' }}>
              {notes[1]?.text}
            </Link>
            <Link to={notes[2]?.to ?? '/'} className="abs home-q hand crowding" style={pos('0', '77%', { width: u(195), fontSize: u(36), rotate: '-4deg' })}>
              {notes[2]?.text}
            </Link>
          </div>
        </div>
      </section>
      <TornEdge color="var(--coral)" under="#FFE6DC" seed="hero-edge" height={34} />
    </div>
  );
}

/** The five print slots of the subjects collage, from the Home reference. */
const PRINT_SLOTS = [
  { width: 344, tilt: -4, aspect: '3 / 4', left: '1.19%', top: '3.95%', z: 2, captionSize: 34, tape: [{ left: '34%', width: 124, tilt: -6 }] },
  { width: 478, tilt: 2.5, aspect: '3 / 2', left: '25.15%', top: '0.47%', z: 3, captionSize: 38, pin: '47%' },
  { width: 404, tilt: -3, aspect: '3 / 2', left: '59.23%', top: '6.51%', z: 4, captionSize: 38, tape: [{ left: '-7%', top: u(4), width: 110, tilt: -38 }, { left: '80%', top: u(2), width: 110, tilt: 36 }] },
  { width: 548, tilt: -2, aspect: '2 / 1', left: '26.93%', top: '51.16%', z: 5, captionSize: 38, tape: [{ left: '40%', top: u(-15), width: 130, tilt: 3, tone: 'teal' as const }] },
  { width: 420, tilt: 4, aspect: '3 / 2', left: '67.11%', top: '50.23%', z: 6, captionSize: 38, tape: [{ left: '30%', top: u(-17), width: 120, tilt: -4 }] },
] as const;

/** The kit photos shown until the day's picks arrive (and with no network). */
const DEFAULT_PRINTS = [
  { to: '/subject/earth', src: '/photos/falls.jpg', alt: 'Victoria Falls seen from the air', caption: 'Mountains and rivers' },
  { to: '/subject/wildlife', src: '/photos/elephant.jpg', alt: 'An elephant walking with her calf', caption: 'Wildlife' },
  { to: '/subject/ancient', src: '/photos/pyramids.jpg', alt: 'The pyramids of Giza', caption: 'Ancient worlds' },
  { to: '/subject/space', src: '/photos/milkyway.jpg', alt: 'The centre of the Milky Way in many colours', caption: 'Space' },
  { to: '/subject/countries', src: '/photos/kili.jpg', alt: 'Kilimanjaro rising above the clouds', caption: 'Countries' },
] as const;

/** The five prints of today's subjects collage: each subject's reviewed cover. */
function usePrints(day: number) {
  const data = useHomeData();
  const subjects = data ? pickSubjects(day, subjectsWithPrints(data), 5) : [];
  return PRINT_SLOTS.map((slot, i) => {
    const id = subjects[i];
    const subject = id ? subjectById(id) : undefined;
    const fallback = DEFAULT_PRINTS[i] as (typeof DEFAULT_PRINTS)[number];
    const cover = id ? coverFor(id) : undefined;
    if (!cover || !subject) return { slot, to: fallback.to, src: fallback.src, alt: fallback.alt, caption: fallback.caption };
    return { slot, to: `/subject/${subject.id}`, src: cover.file, alt: cover.alt, caption: subject.label };
  });
}

/** The wing the castle panel shows today. */
const todaysWing = (day: number) => pickSubjects(day, WINGS, 1)[0] ?? WINGS[0];

/** The credit line names exactly the bundled photographs on the page today (21-review-2 Req 13). */
function HomeFooter({ day }: { day: number }) {
  const prints = usePrints(day);
  const shown = ['/photos/earth.jpg', ...prints.map((p) => p.src)];
  return (
    <footer className="page-footer">
      <p>
        {creditLine(shown)} Photos on the stamps and in the quiz are credited on their article pages. Article text comes from
        Wikipedia under CC BY-SA 4.0. Every licence is listed on the <Link to="/credits">credits page</Link>.
      </p>
    </footer>
  );
}

function Subjects({ day }: { day: number }) {
  const notes = useNotes(day);
  const prints = usePrints(day);
  return (
    <section className="home-subjects grain" aria-labelledby="subjects-title">
      <div className="home-subjects__head">
        <h2 id="subjects-title">Step into a subject</h2>
        <p aria-hidden="true" className="hand home-subjects__hint crowding">
          pick a picture, any picture
          <svg viewBox="0 0 70 70" width="48" height="48" fill="none" stroke="#2E0D00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.9 7.6C12.6 10.2 30.6 22.5 38.8 31.2C45.8 39.9 54.1 56.7 56.4 62" />
            <path d="M58 62Q52.9 60 48.7 56.6" />
            <path d="M58 62Q58.6 55.9 56.7 50" />
          </svg>
        </p>
        <Link to="/subjects" className="home-link">
          See every subject
        </Link>
      </div>
      <div className="collage" data-w="1344">
        <div className="collage__inner" style={{ aspectRatio: '1344 / 860' }}>
          <KitLayer layer="subjects" />
          {prints.map(({ slot, to, src, alt, caption }) => (
            <Print
              key={slot.left}
              className="abs"
              to={to}
              src={src}
              alt={alt}
              caption={caption}
              captionSize={slot.captionSize}
              aspect={slot.aspect}
              width={slot.width}
              tilt={slot.tilt}
              tape={'tape' in slot ? [...slot.tape] : undefined}
              pin={'pin' in slot ? slot.pin : undefined}
              style={pos(slot.left, slot.top, { zIndex: slot.z })}
            />
          ))}
          {notes[3] && (
            <MarginNote className="abs crowding" tilt={-2} size={31} style={pos('2.23%', '72.33%', { width: u(270) })}>
              {notes[3].text}
            </MarginNote>
          )}
          {notes[4] && (
            <MarginNote className="abs crowding" tilt={5} size={31} style={pos('90.92%', '7.21%', { width: u(116) })}>
              {notes[4].text}
            </MarginNote>
          )}
          {notes[5] && (
            <MarginNote className="abs crowding" tilt={2} size={31} style={pos('76.04%', '93.02%', { width: u(300) })}>
              {notes[5].text}
            </MarginNote>
          )}        </div>
      </div>
      <TornEdge color="var(--paper)" seed="subjects-edge" height={30} />
    </section>
  );
}

/** Today's quiz: a featured article from today's first subject, or the kit's daily quiz until the data arrives. */
function useTodaysQuiz(day: number) {
  const data = useHomeData();
  const fallback = todaysQuiz(new Date());
  if (!data) return fallback;
  const id = pickSubjects(day + 2, subjectsWithPrints(data), 1)[0];
  const featured = id ? pickFeatured(day, 5, data.subjects.find((x) => x.id === id)?.featured ?? []) : undefined;
  if (!featured) return fallback;
  return {
    pack: featured.pack,
    id: featured.id,
    topic: featured.title,
    blurb: 'Five questions, three hints each, and a proof from the article.',
    photo: packUrl(featured.photo.file),
    alt: featured.photo.alt,
  };
}

function LearnByPlaying({ day }: { day: number }) {
  const progress = useProgress();
  // A different wing of the castle each day, from the whole world and every subject.
  const wing = todaysWing(day);
  const lit = wing ? (progress.castle[wing.id] ?? 0) : 0;
  const quiz = useTodaysQuiz(day);
  const panel = castlePanel(wing);
  return (
    <section className="home-play grain" aria-labelledby="play-title">
      <h2 id="play-title">Learn by playing</h2>
      <div className="collage" data-w="1344">
        <div className="collage__inner" style={{ aspectRatio: '1344 / 650' }}>
          <KitLayer layer="playing" />
          <DoorRow lit={lit} />
          <div className="abs home-castle" style={pos('0.6%', '3%', { width: u(570), rotate: '-3deg' })}>
            <CastleDoor label={panel.label} alt={panel.alt} clip={CASTLE_CUT} />
            <h3 className="home-castle__title" style={{ fontSize: u(68), bottom: u(-30) }}>
              The Castle
            </h3>
          </div>
          <div className="abs home-castle__copy" style={pos('2.4%', '76.5%', { width: u(470) })}>
            <p style={{ fontSize: u(21) }}>Every door asks a question. Answer it and the next room lights up.</p>
            <Button to={wing ? `/castle/${wing.id}` : '/castle'}>{enterLabel(wing)}</Button>
          </div>
          <MarginNote className="abs crowding" color="var(--paper)" tilt={-4} size={33} style={pos('47.6%', '31%', { width: u(150) })}>
            {lit} rooms lit, {12 - lit} still dark
          </MarginNote>
          <MarginNote className="abs crowding" color="var(--yellow)" tilt={-3} size={34} style={pos('71.4%', '81.5%', { width: u(290) })}>
            stuck? every question has 3 hints
          </MarginNote>
          <div className="abs home-quiz" style={pos('60.6%', '-9%', { width: u(480), rotate: '3deg' })}>
            <span aria-hidden="true" className="home-quiz__sheet" style={{ background: '#C9D2E6', rotate: '-7deg' }} />
            <span aria-hidden="true" className="home-quiz__sheet" style={{ background: '#E6EAF2', rotate: '4deg' }} />
            <div className="home-quiz__card">
              <div className="home-quiz__photo">
                <span aria-hidden="true" className="tape tape--yellow" style={{ left: '36%', top: u(-15), width: u(124), rotate: '-4deg' }} />
                <img src={quiz.photo} alt={quiz.alt} />
              </div>
              <h3 style={{ fontSize: u(42) }}>Today&rsquo;s quiz: {quiz.topic}</h3>
              <p style={{ fontSize: u(20) }}>{quiz.blurb}</p>
              <Button to={`/quiz/${quiz.pack}/${quiz.id}`} tone="ink">
                Start the quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const CASTLE_CUT = (() => {
  const next = rng(seedFrom('castle'));
  const j = (n: number): string => `${(n + (next() - 0.5) * 1.2).toFixed(1)}%`;
  return `polygon(${j(0.5)} ${j(1)},${j(50)} ${j(0.3)},${j(99.4)} ${j(1)},${j(99.6)} ${j(50)},${j(99)} ${j(99.2)},${j(50)} ${j(99.6)},${j(0.4)} ${j(99)},${j(0.2)} ${j(50)})`;
})();

export default function Home() {
  useTitle(undefined);
  const day = useMemo(() => dayNumber(new Date()), []);
  return (
    <div className="home">
      <Hero day={day} />
      <Subjects day={day} />
      <section className="home-paper squared" aria-label="On this day and your stamp book">
        <div className="collage" data-w="1344">
          <div className="collage__inner" style={{ aspectRatio: '1344 / 900' }}>
            <KitLayer layer="onThisDay" />
            <OnThisDay />
            <StampBook />
            <KitLayer layer="stampBook" style={{ zIndex: 21 }} />
          </div>
        </div>
        <PictureOfTheDay />
        <TornEdge color="var(--teal)" seed="paper-edge" height={34} />
      </section>
      <LearnByPlaying day={day} />
      <HomeFooter day={day} />
    </div>
  );
}
