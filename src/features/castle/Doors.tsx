/**
 * Twelve hand-drawn doors on a castle wall, three rows of four. Lit doors
 * glow yellow and carry a chalked name of what was learned there; the
 * next door gets a "next!" arrow. Screen readers get a plain list.
 */
import { seedFrom, wobblyArrow, wobblyLine } from '../../design/wobble.ts';
import { doorPath } from '../home/DoorRow.tsx';
import { ROOMS } from './castle.ts';

const W = 520;
const H = 400;

function doorAt(i: number): { x: number; y: number } {
  const row = Math.floor(i / 4);
  const col = i % 4;
  // Rows wind back and forth like a path through the castle.
  const c = row % 2 === 0 ? col : 3 - col;
  return { x: 40 + c * 120, y: 50 + row * 120 };
}

export function Doors({ lit, names = [], compact = false }: { lit: number; names?: readonly string[]; compact?: boolean }) {
  const doors = Array.from({ length: ROOMS }, (_, i) => doorAt(i));
  const next = doors[lit];
  return (
    <div className={`doors${compact ? ' doors--compact' : ''}`}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="doors__svg">
        {/* Stone courses drawn by hand. */}
        {[30, 150, 270, 390].map((y) => (
          <path key={y} d={wobblyLine({ x: 10, y }, { x: W - 10, y }, seedFrom(`course${y}`), 2)} className="doors__course" />
        ))}
        {doors.map((d, i) => {
          const isLit = i < lit;
          // doorPath draws a 20 x 22 door; scale it up for the wall.
          return (
            <g key={i} transform={`translate(${d.x} ${d.y}) scale(2.6)`}>
              <path d={doorPath(0, 6, seedFrom(`wall-door${i}`))} className={isLit ? 'doors__door is-lit' : 'doors__door'} />
              {isLit ? null : <circle cx="15.5" cy="18" r="1.1" className="doors__knob" />}
            </g>
          );
        })}
        {doors.map((d, i) =>
          i < lit && names[i] ? (
            <text key={`n${i}`} x={d.x + 26} y={d.y + 108} className="doors__name">
              {names[i]}
            </text>
          ) : null,
        )}
        {next && !compact ? (
          <g className="doors__next">
            {wobblyArrow({ x: next.x - 34, y: next.y - 26 }, { x: next.x + 4, y: next.y + 8 }, seedFrom('next')).map((p) => (
              <path key={p} d={p} />
            ))}
            <text x={next.x - 70} y={next.y - 30}>next!</text>
          </g>
        ) : null}
      </svg>
      <ol className="sr-only">
        {doors.map((_, i) => (
          <li key={i}>
            Room {i + 1}, {i < lit ? `lit${names[i] ? `: ${names[i]}` : ''}` : i === lit ? 'next' : 'dark'}
          </li>
        ))}
      </ol>
    </div>
  );
}
