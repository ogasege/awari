/**
 * A drawn castle door for Home's castle panel (22-review-3 Req 8): a stone
 * wall, an arched wooden door and the wing's name on a banner above it.
 */
import { rng, seedFrom, wobblyLine } from '../../design/wobble.ts';

export function CastleDoor({ label, alt, clip }: { label: string; alt: string; clip: string }) {
  const next = rng(seedFrom(`door-${label}`));
  const bricks: string[] = [];
  for (let row = 0; row < 8; row++) {
    const y = 40 + row * 44;
    bricks.push(wobblyLine({ x: 0, y }, { x: 570, y }, seedFrom(`row${row}`), 1.5));
    for (let k = 0; k < 7; k++) {
      const x = (row % 2 === 0 ? 0 : 40) + k * 82 + next() * 6;
      bricks.push(`M${x.toFixed(1)} ${y}L${x.toFixed(1)} ${y + 44}`);
    }
  }
  return (
    <svg role="img" aria-label={alt} className="home-castle__door" viewBox="0 0 570 400" style={{ clipPath: clip }}>
      <rect width="570" height="400" fill="#0b1b4d" />
      <path d={bricks.join('')} fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M185 400V190C185 100 385 100 385 190V400Z" fill="#ffd23f" stroke="#2e0d00" strokeWidth="5" strokeLinejoin="round" />
      <path d="M285 128V400M235 148V400M335 148V400" fill="none" stroke="#2e0d00" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M185 250Q285 262 385 250M185 330Q285 342 385 330" fill="none" stroke="#2e0d00" strokeWidth="5" strokeLinecap="round" />
      <circle cx="350" cy="285" r="9" fill="#2e0d00" />
      <g transform="rotate(-2 285 62)">
        <rect x="95" y="30" width="380" height="64" fill="#fffdf6" stroke="#2e0d00" strokeWidth="3" />
        <text x="285" y="75" textAnchor="middle" fontFamily="var(--font-hand)" fontSize="42" fill="#0b1b4d">
          {label}
        </text>
      </g>
    </svg>
  );
}
