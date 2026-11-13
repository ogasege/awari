/**
 * The app frame: skip link, shared header, the routed screen and focus
 * management between screens.
 */
import { Suspense, lazy, useEffect, useRef, type ComponentType } from 'react';
import { ChalkFilter } from '../design/paper.tsx';
import { Header } from './Header.tsx';
import { usePath } from './navigation.tsx';
import { matchRoute, type RouteName } from './router.ts';
import Home from '../features/home/Home.tsx';
import './app.css';

type Screen = ComponentType<{ params: Record<string, string> }>;

const lazyScreen = (load: () => Promise<{ default: Screen }>): Screen => lazy(load);

/** Every screen except Home is code-split (Req 6.2). */
const SCREENS: Record<RouteName, Screen> = {
  home: Home,
  atlas: lazyScreen(() => import('../features/atlas/AtlasScreen.tsx')),
  article: lazyScreen(() => import('../features/article/ArticleScreen.tsx')),
  quiz: lazyScreen(() => import('../features/quiz/QuizScreen.tsx')),
  quizzes: lazyScreen(() => import('../features/quiz/QuizzesScreen.tsx')),
  castle: lazyScreen(() => import('../features/castle/CastleScreen.tsx')),
  wing: lazyScreen(() => import('../features/castle/WingScreen.tsx')),
  subject: lazyScreen(() => import('../features/subject/SubjectScreen.tsx')),
  subjects: lazyScreen(() => import('../features/subject/SubjectsScreen.tsx')),
  tours: lazyScreen(() => import('../features/tours/ToursScreen.tsx')),
  tour: lazyScreen(() => import('../features/tours/TourScreen.tsx')),
  timeline: lazyScreen(() => import('../features/timeline/TimelineScreen.tsx')),
  stamps: lazyScreen(() => import('../features/stamps/StampsScreen.tsx')),
  continentStamps: lazyScreen(() => import('../features/stamps/ContinentStamps.tsx')),
  search: lazyScreen(() => import('../features/search/SearchScreen.tsx')),
  credits: lazyScreen(() => import('../features/credits/CreditsScreen.tsx')),
  media: lazyScreen(() => import('../features/media/MediaScreen.tsx')),
  'not-found': lazyScreen(() => import('./NotFound.tsx')),
};

/** Moves focus to the new screen's heading after in-app navigation. */
function useFocusOnNavigate(path: string): void {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let tries = 0;
    const focus = (): void => {
      const h1 = document.querySelector<HTMLElement>('main h1');
      if (h1) {
        if (!h1.hasAttribute('tabindex')) {
          h1.setAttribute('tabindex', '-1');
        }
        h1.focus({ preventScroll: true });
      } else if (tries < 40) {
        tries += 1;
        window.setTimeout(focus, 50);
      }
    };
    focus();
  }, [path]);
}

export function App() {
  const path = usePath();
  const { name, params } = matchRoute(path);
  const Screen = SCREENS[name];
  useFocusOnNavigate(path);
  const board = name === 'home';

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ChalkFilter />
      <div className={board ? 'app' : 'app app--paged'}>
        {board ? null : (
          <div className="app__board grain">
            <Header />
          </div>
        )}
        <main id="main">
          <Suspense fallback={<p className="app__loading">Opening the page…</p>}>
            <Screen params={params} />
          </Suspense>
        </main>
      </div>
    </>
  );
}
