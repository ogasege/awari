/**
 * Trims the Natural Earth 1:110m admin-0 countries layer (public domain)
 * to the small GeoJSON the atlas globe needs: `{ iso3, name, id }`
 * properties and coordinates rounded to two decimals.
 */
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
  Position,
} from 'geojson';
import { neIso3, type NeCollection, type NeProperties } from './countries.ts';

/** Properties of an atlas feature. */
export interface AtlasProperties {
  iso3: string;
  name: string;
  /** Slug of the country's article, or null when there is none. */
  id: string | null;
}

/** The atlas file: `/packs/atlas/countries.json`. */
export type AtlasCollection = FeatureCollection<
  Polygon | MultiPolygon,
  AtlasProperties
>;

/** Rounds a number to two decimals (and turns -0 into 0). */
export function round2(n: number): number {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

/**
 * Rounds a ring, removes consecutive duplicate positions and closes it.
 * Returns null when fewer than four positions remain.
 */
export function roundRing(ring: readonly Position[]): Position[] | null {
  const out: Position[] = [];
  for (const p of ring) {
    const q: Position = [round2(p[0] ?? 0), round2(p[1] ?? 0)];
    const last = out.at(-1);
    if (!last || last[0] !== q[0] || last[1] !== q[1]) {
      out.push(q);
    }
  }
  const first = out[0];
  const last = out.at(-1);
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    out.push([first[0] ?? 0, first[1] ?? 0]);
  }
  return out.length >= 4 ? out : null;
}

/** Rounds a polygon; drops it when its outer ring degenerates. */
function roundPolygon(rings: readonly Position[][]): Position[][] | null {
  const [outer, ...holes] = rings;
  const o = outer ? roundRing(outer) : null;
  if (!o) {
    return null;
  }
  return [o, ...holes.map(roundRing).filter((r): r is Position[] => r !== null)];
}

/** Looks up the bundled country for a Natural Earth feature. */
export type AtlasLookup = (
  p: NeProperties,
) => { id: string; name: string } | undefined;

/**
 * Builds the atlas collection: every polygon feature with properties
 * trimmed to `{ iso3, name, id }` and rounded coordinates.
 */
export function trimAtlas(
  ne: Pick<NeCollection, 'features'>,
  lookup: AtlasLookup,
): AtlasCollection {
  const features: Feature<Polygon | MultiPolygon, AtlasProperties>[] = [];
  for (const f of ne.features) {
    const g = f.geometry;
    let geometry: Polygon | MultiPolygon | null = null;
    if (g?.type === 'Polygon') {
      const poly = roundPolygon(g.coordinates);
      geometry = poly ? { type: 'Polygon', coordinates: poly } : null;
    } else if (g?.type === 'MultiPolygon') {
      const polys = g.coordinates
        .map(roundPolygon)
        .filter((p): p is Position[][] => p !== null);
      geometry = polys.length ? { type: 'MultiPolygon', coordinates: polys } : null;
    }
    if (!geometry) {
      continue;
    }
    const match = lookup(f.properties);
    features.push({
      type: 'Feature',
      properties: {
        iso3: neIso3(f.properties),
        name: match?.name ?? f.properties.NAME_EN ?? f.properties.NAME,
        id: match?.id ?? null,
      },
      geometry,
    });
  }
  return { type: 'FeatureCollection', features };
}
