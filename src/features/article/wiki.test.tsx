import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReadingCacheForTests } from '../../lib/wiki/cache.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import QuizScreen from '../quiz/QuizScreen.tsx';
import ArticleScreen from './ArticleScreen.tsx';

const BODY =
  'The okapi is an animal from the rainforests of the Congo. It looks like a mix of a zebra and a giraffe, but it is a relative of the giraffe. ' +
  'Okapis were first described by scientists in 1901. They eat leaves, buds and fruit from the forest.\n' +
  '== Where it lives ==\nThe okapi lives in the Ituri Forest in the Democratic Republic of the Congo. The forest is warm and wet all year. ' +
  'Okapis live alone and keep to the shade. A mother okapi hides her calf in the leaves for weeks.\n' +
  '== Body ==\nThe okapi has a long dark tongue that can reach its own ears. Its stripes help it hide in the shadows of the forest. ' +
  'An adult okapi weighs about 250 kilograms. The okapi can hear very well, which keeps it safe from leopards.\n' +
  '== Other websites ==\nA link.';

function wikipedia(): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = new URL(typeof input === 'string' ? input : input.toString(), 'http://localhost');
    if (url.hostname === 'commons.wikimedia.org') {
      return Response.json({
        query: { pages: [{ imageinfo: [{ mime: 'image/jpeg', extmetadata: { Artist: { value: 'Ann Author' }, LicenseShortName: { value: 'CC BY-SA 4.0' }, ImageDescription: { value: 'An okapi in a forest' } } }] }] },
      });
    }
    if (url.hostname === 'upload.wikimedia.org') {
      return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/jpeg' } });
    }
    if (url.hostname.endsWith('wikipedia.org') && url.searchParams.get('titles') !== 'Okapi') {
      return Response.json({ query: { pages: [{ title: url.searchParams.get('titles'), missing: true }] } });
    }
    if (url.hostname === 'simple.wikipedia.org') {
      return Response.json({
        query: { pages: [{ title: 'Okapi', extract: BODY, pageimage: 'Okapi.jpg', thumbnail: { source: 'https://upload.wikimedia.org/o.jpg', width: 800, height: 533 }, pageprops: { wikibase_item: 'Q82001' } }] },
      });
    }
    return new Response('not found', { status: 404 });
  }) as typeof fetch;
}

describe('any article, on demand and offline (14-any-article 4.1, 4.2)', () => {
  beforeEach(() => {
    clearReadingCacheForTests();
    window.history.replaceState(null, '', '/article/wiki/Okapi');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens a Wikipedia article with photo, credits and tap-a-word, then opens it offline. _Req 1, 2, 3.2_', async () => {
    vi.stubGlobal('fetch', wikipedia());
    const user = userEvent.setup();
    const first = render(<ArticleScreen params={{ pack: 'wiki', id: 'Okapi' }} />);
    expect(await screen.findByRole('heading', { name: 'Okapi' })).toBeInTheDocument();
    expect(screen.getByText('From Simple English Wikipedia')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'An okapi in a forest' })).toBeInTheDocument();
    expect(screen.getByText(/Photo: Okapi, by Ann Author, CC BY-SA 4\.0\./)).toBeInTheDocument();
    expect(screen.getByText(/licensed CC BY-SA 4\.0/)).toBeInTheDocument();
    expect(screen.queryByText(/Other websites/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Take the quiz' })).toHaveAttribute('href', '/quiz/wiki/Okapi');
    await user.click(document.querySelector('[data-w="zebra"]') as HTMLElement);
    first.unmount();

    // The network goes away; the article was saved while it was read.
    clearReadingCacheForTests();
    vi.stubGlobal('fetch', (async () => {
      throw new TypeError('offline');
    }) as typeof fetch);
    render(<ArticleScreen params={{ pack: 'wiki', id: 'Okapi' }} />);
    expect(await screen.findByRole('heading', { name: 'Okapi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Where it lives' })).toBeInTheDocument();
  });

  it('says in words when the article is unknown, or offline and never read. _Req 3.2_', async () => {
    vi.stubGlobal('fetch', wikipedia());
    const { unmount } = render(<ArticleScreen params={{ pack: 'wiki', id: 'Zzzz_qqq' }} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Neither Simple English Wikipedia nor English Wikipedia has a page called “Zzzz qqq”');
    unmount();
    vi.stubGlobal('fetch', (async () => {
      throw new TypeError('offline');
    }) as typeof fetch);
    render(<ArticleScreen params={{ pack: 'wiki', id: 'Never_read' }} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('You are offline, and “Never read” has not been opened on this device yet');
  });

  it('plays an on-device quiz made from the article, with the same hint ladder. _Req 5.2_', async () => {
    vi.stubGlobal('fetch', wikipedia());
    const user = userEvent.setup();
    render(<QuizScreen params={{ pack: 'wiki', id: 'Okapi' }} />);
    expect(await screen.findByText(/Question 1 of \d/, { selector: '.question__count' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Give me a nudge' }));
    await user.click(screen.getAllByRole('radio')[0] as HTMLElement);
    await user.click(screen.getByRole('button', { name: 'Check my answer' }));
    await waitFor(() => expect(screen.getByText(/Right!|Not quite\./)).toBeInTheDocument());
  });
});

describe('bundled pages still work with the wider routes', () => {
  beforeEach(() => servePacksFromDisk());
  it('shows a bundled article through the same screen', async () => {
    render(<ArticleScreen params={{ pack: 'countries', id: 'nigeria' }} />);
    expect(await screen.findByRole('heading', { name: 'Nigeria' })).toBeInTheDocument();
  });
});
