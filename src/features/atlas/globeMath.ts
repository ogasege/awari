/** Rotation maths for the atlas globe (04-atlas), free of d3 and React. */

/** [λ longitude rotation, φ latitude rotation] in degrees. */
export type Rotation = [number, number];

export const KEY_STEP = 15;

/** Wraps λ into [−180, 180) and clamps φ to [−90, 90]. */
export function normalise([lambda, phi]: Rotation): Rotation {
  const l = ((((lambda + 180) % 360) + 360) % 360) - 180;
  return [l === 180 ? -180 : l, Math.max(-90, Math.min(90, phi))];
}

/** Rotation after dragging (dx, dy) pixels on a globe of radius r. */
export function drag(r: Rotation, dx: number, dy: number, radius: number): Rotation {
  const k = 90 / Math.max(radius, 1);
  return [r[0] + dx * k, r[1] - dy * k];
}

/** Rotation that puts (lon, lat) at the centre of the globe. */
export function centreOn(lon: number, lat: number): Rotation {
  return normalise([-lon, -lat]);
}

/** Rotation after an arrow key, or null for other keys. */
export function keyStep(r: Rotation, key: string, step = KEY_STEP): Rotation | null {
  switch (key) {
    case 'ArrowLeft':
      return [r[0] - step, r[1]];
    case 'ArrowRight':
      return [r[0] + step, r[1]];
    case 'ArrowUp':
      return [r[0], r[1] - step];
    case 'ArrowDown':
      return [r[0], r[1] + step];
    default:
      return null;
  }
}
