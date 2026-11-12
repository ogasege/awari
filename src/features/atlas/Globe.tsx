/**
 * The spinnable globe (04-atlas Req 1): Natural Earth shapes on an
 * orthographic projection, drawn as SVG. It moves only when the student
 * drags it or presses an arrow key; it never animates on its own.
 */
import { geoCentroid, geoGraticule10, geoOrthographic, geoPath, type GeoProjection } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { wobblyCircle } from '../../design/wobble.ts';
import { centreOn, drag, keyStep, normalise, type Rotation } from './globeMath.ts';
import './atlas.css';

export interface ShapeProps {
  iso3: string;
  name: string;
  id: string | null;
}

export type Shapes = FeatureCollection<Geometry, ShapeProps>;

const SIZE = 600;
const R = 280;
const TAP_PX = 4;

/** Where a country's shape is centred, for turning the globe to it. */
export function centreOf(f: Feature<Geometry, ShapeProps>): Rotation {
  const [lon, lat] = geoCentroid(f);
  return centreOn(lon, lat);
}

export function Globe({
  shapes,
  rotation,
  onRotate,
  discovered,
  selected,
  onSelect,
  marker,
  label = 'Globe. Drag it or use the arrow keys to spin it. Choose a country from the list to visit it.',
}: {
  shapes: Shapes;
  rotation: Rotation;
  onRotate: (r: Rotation) => void;
  discovered: ReadonlySet<string>;
  selected: string | null;
  onSelect: (iso3: string) => void;
  /** A place to mark with a drawn pin, such as a tour stop. */
  marker?: { lon: number; lat: number };
  /** The accessible name of the globe. */
  label?: string;
}) {
  const press = useRef<{ x: number; y: number; start: Rotation; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const path = useMemo(() => {
    const projection = geoOrthographic()
      .scale(R)
      .translate([SIZE / 2, SIZE / 2])
      .rotate([rotation[0], rotation[1], 0])
      .clipAngle(90);
    return geoPath(projection);
  }, [rotation]);

  const graticule = useMemo(() => path(geoGraticule10()) ?? '', [path]);
  const ring = useMemo(() => wobblyCircle(SIZE / 2, SIZE / 2, R + 10, 7), []);

  const down = (e: PointerEvent<SVGSVGElement>): void => {
    e.currentTarget.setPointerCapture(e.pointerId);
    press.current = { x: e.clientX, y: e.clientY, start: rotation, moved: false };
  };

  const move = (e: PointerEvent<SVGSVGElement>): void => {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.moved && Math.hypot(dx, dy) < TAP_PX) return;
    p.moved = true;
    setDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = rect.width / SIZE || 1;
    onRotate(normalise(drag(p.start, dx, dy, R * scale)));
  };

  const up = (e: PointerEvent<SVGSVGElement>): void => {
    const p = press.current;
    press.current = null;
    setDragging(false);
    if (p && !p.moved) {
      const iso = (e.target as Element).closest('[data-iso]')?.getAttribute('data-iso');
      if (iso) onSelect(iso);
    }
  };

  const key = (e: KeyboardEvent<SVGSVGElement>): void => {
    const next = keyStep(rotation, e.key);
    if (next) {
      e.preventDefault();
      onRotate(normalise(next));
    }
  };

  return (
    <svg
      className={`globe${dragging ? ' is-dragging' : ''}`}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="application"
      aria-roledescription="globe"
      aria-label={label}
      tabIndex={0}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => {
        press.current = null;
        setDragging(false);
      }}
      onKeyDown={key}
    >
      <path d={ring} className="globe__ring" aria-hidden="true" />
      <circle cx={SIZE / 2} cy={SIZE / 2} r={R} className="globe__ocean" />
      <path d={graticule} className="globe__graticule" />
      {shapes.features.map((f) => {
        const d = path(f);
        if (!d) return null;
        const iso = f.properties.iso3;
        const cls = [
          'globe__land',
          f.properties.id && discovered.has(f.properties.id) ? 'is-discovered' : '',
          iso === selected ? 'is-selected' : '',
        ].join(' ');
        return <path key={iso + f.properties.name} d={d} className={cls} data-iso={iso} />;
      })}
      {/* Draw the selected outline last so it sits on top. */}
      {shapes.features
        .filter((f) => f.properties.iso3 === selected)
        .map((f) => (
          <path key="sel" d={path(f) ?? ''} className="globe__selected" aria-hidden="true" />
        ))}
      {marker ? <Pin point={(path.projection() as GeoProjection | null)?.([marker.lon, marker.lat])} /> : null}
    </svg>
  );
}

/** A hand-drawn red ring with a dot, marking a place on the globe. */
function Pin({ point }: { point: [number, number] | null | undefined }) {
  if (!point) return null;
  const [x, y] = point;
  return (
    <g aria-hidden="true" className="globe__pin" transform={`translate(${x} ${y})`}>
      <circle r="16" className="globe__pin-ring" />
      <circle r="6" className="globe__pin-dot" />
    </g>
  );
}
