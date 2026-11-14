/** 23-media-library Req 22: the Credits screen lists the author and licence of every picture, from the media data. */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearMediaCache, type MediaFile } from '../../lib/media/media.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import { MediaCredits } from './MediaCredits.tsx';

describe('picture credits', () => {
  beforeEach(() => {
    clearMediaCache();
    servePacksFromDisk();
  });

  it('lists 50 pictures at a time for a subject, each with author, licence and Commons page', async () => {
    const user = userEvent.setup();
    const file = JSON.parse(readFileSync('public/media/ancient.json', 'utf8')) as MediaFile;
    render(<MediaCredits />);
    await user.selectOptions(screen.getByLabelText(/Subject/), 'ancient');
    expect(await screen.findByRole('status')).toHaveTextContent(`of ${file.items.length}.`);
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(Math.min(50, file.items.length));
    for (const row of rows) {
      expect(within(row).getAllByRole('link').length).toBeGreaterThanOrEqual(3);
    }
    if (file.items.length > 50) {
      await user.click(screen.getByRole('button', { name: 'Next 50' }));
      expect(screen.getByRole('status')).toHaveTextContent('Pictures 51 to');
    }
  });
});
