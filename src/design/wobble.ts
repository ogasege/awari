/**
 * Seeded generators for hand-drawn SVG shapes. The same seed always draws
 * the same wobble, so renders are stable between visits and in tests, and
 * different seeds give each doodle its own hand.
 */

export interface Point {
  x: number;
  y: number;
}

/** Deterministic 32-bit PRNG (mulberry32). Returns numbers in [0, 1). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turns any string into a stable numeric seed (FNV-1a). */
export function seedFrom(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const round = (n: number): number => Math.round(n * 10) / 10;

/** Jitters a value by at most `amp` in either direction. */
function jitter(next: () => number, amp: number): number {
  return (next() * 2 - 1) * amp;
}

/** Ideal points along a line, jittered perpendicular by at most `amp`. */
export function wobblyPoints(
  from: Point,
  to: Point,
  seed: number,
  amp = 2,
  steps = 8,
): Point[] {
  const next = rng(seed);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const off = i === 0 || i === steps ? 0 : jitter(next, amp);
    points.push({ x: from.x + dx * t + nx * off, y: from.y + dy * t + ny * off });
  }
  return points;
}

/** Smooth SVG path through points using quadratic midpoints. */
export function pathThrough(points: readonly Point[]): string {
  const [first, ...rest] = points;
  if (!first) {
    return '';
  }
  let d = `M${round(first.x)} ${round(first.y)}`;
  for (let i = 0; i < rest.length - 1; i += 1) {
    const p = rest[i] as Point;
    const q = rest[i + 1] as Point;
    d += `Q${round(p.x)} ${round(p.y)} ${round((p.x + q.x) / 2)} ${round(
      (p.y + q.y) / 2,
    )}`;
  }
  const last = rest.at(-1);
  if (last) {
    d += `L${round(last.x)} ${round(last.y)}`;
  }
  return d;
}

/** A wobbly line from one point to another. */
export function wobblyLine(from: Point, to: Point, seed: number, amp = 2): string {
  return pathThrough(wobblyPoints(from, to, seed, amp));
}

/** A hand-drawn circle that slightly overshoots where it started. */
export function wobblyCirclePoints(
  cx: number,
  cy: number,
  r: number,
  seed: number,
  amp = 0.06,
): Point[] {
  const next = rng(seed);
  const start = next() * Math.PI * 2;
  const steps = 18;
  const points: Point[] = [];
  for (let i = 0; i <= steps + 2; i += 1) {
    const a = start + (i / steps) * Math.PI * 2;
    const rr = r * (1 + jitter(next, amp));
    points.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
  }
  return points;
}

export function wobblyCircle(
  cx: number,
  cy: number,
  r: number,
  seed: number,
): string {
  return pathThrough(wobblyCirclePoints(cx, cy, r, seed));
}

/** An arrow: a gently curved shaft plus two short head strokes. */
export function wobblyArrow(from: Point, to: Point, seed: number): string[] {
  const next = rng(seed);
  const mid = {
    x: (from.x + to.x) / 2 + jitter(next, 18),
    y: (from.y + to.y) / 2 + jitter(next, 18),
  };
  const shaft = pathThrough([
    from,
    ...wobblyPoints(from, mid, seed + 1, 1.5, 3).slice(1),
    ...wobblyPoints(mid, to, seed + 2, 1.5, 3).slice(1),
  ]);
  const angle = Math.atan2(to.y - mid.y, to.x - mid.x);
  const head = 12;
  const wing = (side: number): string => {
    const a = angle + Math.PI + side * (0.5 + jitter(next, 0.08));
    const end = { x: to.x + Math.cos(a) * head, y: to.y + Math.sin(a) * head };
    return wobblyLine(to, end, seed + 3 + side, 0.8);
  };
  return [shaft, wing(1), wing(-1)];
}

/** A five-pointed star drawn as one wobbly stroke. */
export function wobblyStar(cx: number, cy: number, r: number, seed: number): string {
  const next = rng(seed);
  const pts: Point[] = [];
  for (let i = 0; i <= 5; i += 1) {
    const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    const rr = r * (1 + jitter(next, 0.08));
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
  }
  return pts
    .slice(1)
    .map((p, i) => wobblyLine(pts[i] as Point, p, seed + i, 0.8))
    .join('');
}

/** A small sparkle: two crossed wobbly strokes. */
export function wobblySparkle(cx: number, cy: number, r: number, seed: number): string {
  return (
    wobblyLine({ x: cx - r, y: cy }, { x: cx + r, y: cy }, seed, 0.6) +
    wobblyLine({ x: cx, y: cy - r }, { x: cx, y: cy + r }, seed + 1, 0.6)
  );
}

/**
 * A torn-paper edge across a `width` x `height` box, filled below the tear.
 * Returns a closed path suitable for `fill`.
 */
export function tornEdge(width: number, height: number, seed: number): string {
  const next = rng(seed);
  let x = 0;
  let d = `M0 ${height}L0 ${round(height * (0.4 + next() * 0.3))}`;
  while (x < width) {
    x = Math.min(width, x + 6 + next() * 12);
    d += `L${round(x)} ${round(height * (0.05 + next() * 0.75))}`;
  }
  return `${d}L${width} ${height}Z`;
}

/**
 * A hand-cut paper outline as a CSS `polygon()` with every corner nudged
 * inward by up to `amp` percent. Used for strips, tape and notes.
 */
export function cutPolygon(seed: number, amp = 1.5, perSide = 5): string {
  const next = rng(seed);
  const n = (base: number): string =>
    `${round(Math.min(100, Math.max(0, base + jitter(next, amp))))}%`;
  const pts: string[] = [];
  for (let i = 0; i < perSide; i += 1) pts.push(`${n((i / perSide) * 100)} ${n(amp)}`);
  for (let i = 0; i < perSide; i += 1) pts.push(`${n(100 - amp)} ${n((i / perSide) * 100)}`);
  for (let i = 0; i < perSide; i += 1) pts.push(`${n(100 - (i / perSide) * 100)} ${n(100 - amp)}`);
  for (let i = 0; i < perSide; i += 1) pts.push(`${n(amp)} ${n(100 - (i / perSide) * 100)}`);
  return `polygon(${pts.join(',')})`;
}

/**
 * The perforated outline of a postage stamp as a CSS `polygon()`: each
 * edge has `teeth` small bites taken out of it.
 */
export function perforation(teeth = 14, depth = 2): string {
  const pts: string[] = [];
  const step = 100 / teeth;
  const p = (x: number, y: number): string => `${round(x)}% ${round(y)}%`;
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    pts.push(p(a, 0), p(a + step * 0.3, 0), p(a + step * 0.5, depth), p(a + step * 0.7, 0));
  }
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    pts.push(p(100, a), p(100, a + step * 0.3), p(100 - depth, a + step * 0.5), p(100, a + step * 0.7));
  }
  for (let i = 0; i < teeth; i += 1) {
    const a = 100 - i * step;
    pts.push(p(a, 100), p(a - step * 0.3, 100), p(a - step * 0.5, 100 - depth), p(a - step * 0.7, 100));
  }
  for (let i = 0; i < teeth; i += 1) {
    const a = 100 - i * step;
    pts.push(p(0, a), p(0, a - step * 0.3), p(depth, a - step * 0.5), p(0, a - step * 0.7));
  }
  return `polygon(${pts.join(',')})`;
}

/** Keeps a print's tilt between 2 and 5 degrees, preserving its direction. */
export function clampTilt(deg: number): number {
  if (!Number.isFinite(deg)) {
    return 2;
  }
  const sign = deg < 0 ? -1 : 1;
  return sign * Math.min(5, Math.max(2, Math.abs(deg)));
}
