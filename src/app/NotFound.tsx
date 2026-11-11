/** Shown when a path matches no route (01-app-shell Req 2.4). */
import { Button, Doodle, StripHeading } from '../design/paper.tsx';
import { useTitle } from './useTitle.ts';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <section className="page squared" aria-labelledby="nf-title">
      <StripHeading
        id="nf-title"
        lines={[
          { text: 'This page', tone: 'paper', tilt: -2 },
          { text: 'is not on the map', tone: 'yellow', tilt: 1.5 },
        ]}
      />
      <p style={{ maxWidth: 520, fontSize: 20 }}>
        We looked in every drawer. Try the atlas, or head back to the start.
      </p>
      <Doodle kind="circle" seed="nf" size={90} color="var(--teal-ink)" />
      <p>
        <Button to="/">Back to Home</Button>
      </p>
    </section>
  );
}
