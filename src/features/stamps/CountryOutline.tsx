/**
 * The faint outline of a country, for its empty stamp space (26-final-review, round 2: the stamp book's empty state
 * read as a form of question marks). Drawn from the atlas pack the app already saves for offline use; a country too
 * small to have a shape there gets no outline and the page keeps its "?" for it.
 */
import { geoEqualEarth, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useMemo } from 'react';
import { usePack } from '../../lib/packs/load.ts';

type Shapes = FeatureCollection<Geometry, { id: string; name: string }>;

const SIZE = 100;

/** The SVG path of a country fitted to a SIZE by SIZE box, or null when the atlas has no shape for it. */
export function outlinePath(shapes: Shapes, id: string): string | null {
  const feature = shapes.features.find((f) => f.properties.id === id) as Feature<Geometry> | undefined;
  if (!feature) return null;
  const projection = geoEqualEarth().fitExtent(
    [
      [6, 6],
      [SIZE - 6, SIZE - 6],
    ],
    feature,
  );
  return geoPath(projection)(feature);
}

/** The shapes, loaded once for the whole page. */
export function useShapes(): Shapes | null {
  const file = usePack<Shapes>('atlas/countries.json');
  return file.status === 'ready' ? file.data : null;
}

export function CountryOutline({ shapes, id }: { shapes: Shapes | null; id: string }) {
  const d = useMemo(() => (shapes ? outlinePath(shapes, id) : null), [shapes, id]);
  if (!d) return null;
  return (
    <svg aria-hidden="true" className="stamp-book__outline" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <path d={d} />
    </svg>
  );
}
