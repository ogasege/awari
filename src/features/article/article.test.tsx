import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { lookupWord } from '../../lib/dictionary/lookup.ts';
import { getProgress, resetForTests } from '../../lib/store/progress.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import ArticleScreen from './ArticleScreen.tsx';

describe('Nigeria article from the pack (03-articles-dictionary)', () => {
  beforeEach(() => {
    servePacksFromDisk();
    resetForTests();
  });

  it('“delta” resolves from the committed dictionary shards (Req 3.5)', async () => {
    const def = await lookupWord('Delta');
    expect(def?.lemma).toBe('delta');
    expect(def?.senses[0]?.gloss).toMatch(/river/);
    expect((await lookupWord('deltas'))?.lemma).toBe('delta');
  });

  it('renders Nigeria, credits it, marks it discovered and defines a tapped word', async () => {
    const user = userEvent.setup();
    render(<ArticleScreen params={{ pack: 'countries', id: 'nigeria' }} />);

    expect(await screen.findByRole('heading', { level: 1, name: /Nigeria/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'History' })).toBeInTheDocument();
    expect(screen.getAllByText(/CC BY-SA 4\.0/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Take the quiz' })).toHaveAttribute(
      'href',
      '/quiz/countries/nigeria',
    );
    await waitFor(() => expect(getProgress().discovered).toContain('nigeria'));

    const delta = document.querySelector<HTMLElement>('[data-w="Delta"]');
    expect(delta).not.toBeNull();
    await user.click(delta as HTMLElement);
    const card = screen.getByRole('complementary', { name: 'What does it mean?' });
    expect(await within(card).findByText(/alluvial deposits/)).toBeInTheDocument();
  });

  it('looks a word up from the keyboard field (Req 3.4)', async () => {
    const user = userEvent.setup();
    render(<ArticleScreen params={{ pack: 'countries', id: 'nigeria' }} />);
    const field = await screen.findByLabelText('Look up a word');
    await user.type(field, 'rivers{Enter}');
    expect(await screen.findByText(/from “rivers”/)).toBeInTheDocument();
  });

  it('says so in words when an article does not exist (Req 1.6)', async () => {
    render(<ArticleScreen params={{ pack: 'countries', id: 'atlantis' }} />);
    expect(await screen.findByText(/not in Awari yet/)).toBeInTheDocument();
  });
});
