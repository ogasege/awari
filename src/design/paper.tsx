/**
 * Hand-made scrapbook components: prints, paper strips, tape, pins,
 * margin notes, doodles, torn edges, buttons and stamps. Decorative parts
 * are always `aria-hidden`; content parts stay straight and readable.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Link } from '../app/navigation.tsx';
import {
  clampTilt,
  cutPolygon,
  perforation,
  seedFrom,
  tornEdge,
  wobblyArrow,
  wobblyCircle,
  wobblySparkle,
  wobblyStar,
  type Point,
} from './wobble.ts';
import './paper.css';

/** Sizes in collage units: `u(14)` is 14 reference pixels. */
export const u = (n: number): string => `calc(${n} * var(--u, 1px))`;

const deg = (n: number): string => `${n}deg`;

export interface TapeSpec {
  left: string;
  top?: string;
  width?: number;
  tilt?: number;
  tone?: 'clear' | 'yellow' | 'teal';
}

/** A strip of sticky tape. Purely decorative. */
export function Tape({ left, top, width = 120, tilt = -4, tone = 'clear' }: TapeSpec) {
  return (
    <span
      aria-hidden="true"
      className={`tape tape--${tone}`}
      style={{
        left,
        top: top ?? u(-16),
        width: u(width),
        rotate: deg(tilt),
        clipPath: cutPolygon(seedFrom(`${left}${tilt}`), 3, 3),
      }}
    />
  );
}

/** A red map pin. Purely decorative. */
export function Pin({ left = '47%' }: { left?: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pin"
      viewBox="0 0 40 44"
      style={{ left, top: u(-14), width: u(40), height: u(44) }}
    >
      <ellipse cx="24" cy="30" rx="12" ry="5" fill="rgb(0 0 0 / 0.28)" />
      <circle cx="19" cy="19" r="13" fill="#D92D20" />
      <circle cx="19" cy="19" r="13" fill="none" stroke="#912018" strokeWidth="1.5" />
      <circle cx="14.5" cy="14" r="4" fill="#FF9B91" />
    </svg>
  );
}

export interface PrintProps {
  src: string;
  alt: string;
  caption?: string;
  /** Requested tilt in degrees; clamped to 2–5 either way. */
  tilt?: number;
  /** Width in collage units. */
  width?: number;
  aspect?: string;
  to?: string;
  tape?: TapeSpec[];
  pin?: string;
  className?: string;
  style?: CSSProperties;
  captionSize?: number;
}

/** A photo shown as a physical print with a white border and caption. */
export function Print({
  src,
  alt,
  caption,
  tilt = -3,
  width,
  aspect = '3 / 2',
  to,
  tape = [],
  pin,
  className = '',
  style,
  captionSize = 38,
}: PrintProps) {
  const body = (
    <>
      {tape.map((t) => (
        <Tape key={`${t.left}${t.tilt}`} {...t} />
      ))}
      {pin ? <Pin left={pin} /> : null}
      <img src={src} alt={alt} loading="lazy" decoding="async" style={{ aspectRatio: aspect }} />
      {caption ? (
        <span className="print__caption hand" style={{ fontSize: u(captionSize) }}>
          {caption}
        </span>
      ) : null}
    </>
  );
  const props = {
    className: `print lift ${className}`,
    style: {
      width: width ? u(width) : undefined,
      rotate: deg(clampTilt(tilt)),
      ...style,
    },
  };
  return to ? (
    <Link to={to} {...props}>
      {body}
    </Link>
  ) : (
    <figure {...props}>{body}</figure>
  );
}

export interface StripProps {
  children: ReactNode;
  tone?: 'paper' | 'yellow' | 'navy' | 'teal';
  tilt?: number;
  seed?: string;
  className?: string;
  style?: CSSProperties;
}

/** A hand-cut paper strip for headline words, with a hard shadow. */
export function Strip({
  children,
  tone = 'paper',
  tilt = -2,
  seed,
  className = '',
  style,
}: StripProps) {
  return (
    <span
      className={`strip strip--${tone} ${className}`}
      style={{
        rotate: deg(tilt),
        clipPath: cutPolygon(seedFrom(seed ?? String(children)), 1),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * A headline made of strips. Screen readers get the plain sentence; the
 * strips are presentational.
 */
export function StripHeading({
  as: Tag = 'h1',
  lines,
  id,
  className = '',
}: {
  as?: 'h1' | 'h2' | 'h3';
  lines: Array<Omit<StripProps, 'children'> & { text: string }>;
  id?: string;
  className?: string;
}) {
  return (
    <Tag id={id} tabIndex={-1} className={`strip-heading ${className}`}>
      {lines.map(({ text, ...rest }) => (
        <Strip key={text} seed={text} {...rest}>
          {text}{' '}
        </Strip>
      ))}
    </Tag>
  );
}

/**
 * A handwritten margin note. Facts must be backed by an article sentence
 * (see `src/features/home/notes.ts`); questions invite the reader in.
 */
export function MarginNote({
  children,
  tilt = -3,
  color,
  size = 32,
  className = '',
  style,
  decorative = false,
}: {
  children: ReactNode;
  tilt?: number;
  color?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  decorative?: boolean;
}) {
  return (
    <p
      aria-hidden={decorative ? 'true' : undefined}
      className={`margin-note hand ${className}`}
      style={{ rotate: deg(tilt), color, fontSize: u(size), ...style }}
    >
      {children}
    </p>
  );
}

export type DoodleKind = 'star' | 'circle' | 'sparkle' | 'arrow';

/** A wobbly hand-drawn doodle. Always decorative. */
export function Doodle({
  kind,
  seed,
  size = 40,
  color = 'currentColor',
  width = 3,
  from,
  to,
  className = 'crowding',
  style,
}: {
  kind: DoodleKind;
  seed: string;
  size?: number;
  color?: string;
  width?: number;
  from?: Point;
  to?: Point;
  className?: string;
  style?: CSSProperties;
}) {
  const s = seedFrom(seed);
  const half = size / 2;
  let paths: string[];
  switch (kind) {
    case 'star':
      paths = [wobblyStar(half, half, half * 0.9, s)];
      break;
    case 'circle':
      paths = [wobblyCircle(half, half, half * 0.85, s)];
      break;
    case 'sparkle':
      paths = [wobblySparkle(half, half, half * 0.8, s)];
      break;
    case 'arrow':
      paths = wobblyArrow(from ?? { x: 4, y: size - 4 }, to ?? { x: size - 4, y: 4 }, s);
      break;
  }
  return (
    <svg
      aria-hidden="true"
      className={`doodle ${className}`}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** A torn-paper edge in the colour of the next section. */
export function TornEdge({
  color,
  seed,
  height = 32,
  under,
}: {
  color: string;
  seed: string;
  height?: number;
  under?: string;
}) {
  const s = seedFrom(seed);
  return (
    <svg
      aria-hidden="true"
      className="torn-edge"
      viewBox={`0 0 1440 ${height}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      {under ? (
        <path d={tornEdge(1440, height, s + 7)} transform="translate(0 -4)" fill={under} />
      ) : null}
      <path d={tornEdge(1440, height, s)} fill={color} />
    </svg>
  );
}

/** A calm, straight button or button-link with a hard shadow. */
export function Button({
  children,
  to,
  tone = 'yellow',
  onClick,
  type = 'button',
  className = '',
  style,
  disabled,
}: {
  children: ReactNode;
  to?: string;
  tone?: 'yellow' | 'outline' | 'ink';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const cls = `btn btn--${tone} ${className}`;
  return to ? (
    <Link to={to} className={cls} style={style}>
      {children}
    </Link>
  ) : (
    <button type={type} className={cls} onClick={onClick} style={style} disabled={disabled}>
      {children}
    </button>
  );
}

const STAMP_EDGE = perforation();

/** A perforated postage stamp for a discovered country. */
export function Stamp({
  name,
  caption,
  src,
  alt,
  tilt = -2,
  to,
  className = '',
  style,
}: {
  name: string;
  caption: string;
  src: string;
  alt: string;
  tilt?: number;
  to: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Link to={to} className={`stamp lift ${className}`} style={{ rotate: deg(tilt), ...style }}>
      <span className="stamp__paper" style={{ clipPath: STAMP_EDGE }}>
        <img src={src} alt={alt} loading="lazy" decoding="async" />
        <span className="stamp__name">{name}</span>
        <span className="stamp__caption hand">{caption}</span>
      </span>
    </Link>
  );
}

/** A wavy underline for emphasis inside straight body text. */
export function HandUnderline({ children }: { children: ReactNode }) {
  return <span className="hand-underline">{children}</span>;
}

/** Shared SVG filter that roughens strokes like chalk. Render once. */
export function ChalkFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="aw-chalk" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
        </filter>
      </defs>
    </svg>
  );
}
