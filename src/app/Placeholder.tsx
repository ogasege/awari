/** Temporary screen used until a feature's spec is implemented. */
import { StripHeading } from '../design/paper.tsx';
import { useTitle } from './useTitle.ts';

export function Placeholder({ title }: { title: string }) {
  useTitle(title);
  return (
    <section className="page squared">
      <StripHeading lines={[{ text: title, tone: 'yellow', tilt: -2 }]} />
      <p>This part of Awari is being built.</p>
    </section>
  );
}
