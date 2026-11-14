import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SafeImg } from './SafeImg.tsx';

describe('SafeImg (26-final-review F-001: no broken-image icons)', () => {
  it('shows the picture while it loads', () => {
    render(<SafeImg src="/media/img/a.webp" alt="A pyramid" />);
    expect(screen.getByRole('img', { name: 'A pyramid' }).tagName).toBe('IMG');
  });

  it('swaps in a placeholder when the picture fails, and tells the parent once', () => {
    const onFail = vi.fn();
    const { container } = render(<SafeImg src="/media/img/b.webp" alt="A lion" width={480} height={320} onFail={onFail} />);
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: /A lion \(picture not available/ })).toBeTruthy();
    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('tries again when the source changes', () => {
    const { container, rerender } = render(<SafeImg src="/media/img/c.webp" alt="One" />);
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    rerender(<SafeImg src="/media/img/d.webp" alt="Two" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/media/img/d.webp');
  });
});
