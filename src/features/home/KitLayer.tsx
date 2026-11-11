/** Renders one of the art director's doodle layers from the design kit. */
import type { CSSProperties } from 'react';
import { kitArt, type KitLayer as Layer } from './kitArt.ts';

/** Parses the kept presentation attributes into SVG props. */
function attrsToProps(attrs: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const m of attrs.matchAll(/([a-z-]+)="([^"]*)"/g)) {
    const key = (m[1] as string).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    props[key] = m[2] as string;
  }
  return props;
}

export function KitLayer({
  layer,
  style,
}: {
  layer: keyof typeof kitArt;
  style?: CSSProperties;
}) {
  const art: Layer = kitArt[layer];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="deco"
      viewBox={art.viewBox}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      {...attrsToProps(art.attrs)}
      // Trusted constant extracted at build time from the design kit.
      dangerouslySetInnerHTML={{ __html: art.svg }}
    />
  );
}
