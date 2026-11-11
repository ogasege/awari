# Design: Atlas

Screen design: `design/screens/README.md` (Atlas).

## Components

```
src/features/atlas/globeMath.ts   rotation maths (pure, tested)
src/features/atlas/Globe.tsx      SVG globe: d3-geo geoOrthographic + geoPath
src/features/atlas/AtlasScreen.tsx board layout, picker, facts card, stamps
```

`d3-geo` is imported only by `Globe.tsx`, which only the lazily loaded
Atlas route imports, so it stays out of the first load.

### Rotation

Rotation is `[λ, φ]` (d3 `rotate`, γ fixed at 0). Dragging by `(dx, dy)`
pixels on a globe of radius `r` changes `λ += dx · k`, `φ −= dy · k` with
`k = 90 / r` (a drag across the radius turns a quarter turn). `normalise`
wraps λ into [−180, 180) and clamps φ to [−90, 90]. Centring on a country
sets the rotation to `[−lon, −lat]` of its `geoCentroid`.

Pointer events use `setPointerCapture`; a press that moves under 4 px is a
tap, which selects the country under it. Arrow keys turn by 15°.

### Drawing

Paths are recomputed from the rotation on each render (177 shapes at
1:110m are cheap). Ocean is a teal-ink disc with a chalk outline;
discovered countries fill `--yellow`, others a light teal; the selected
country gets a 3 px navy stroke. A wobbly hand-drawn ring and a chalk
"drag me" note sit around the globe (decorative, aria-hidden).

## Correctness properties

1. *Normalised rotation*: for any rotation, `normalise` returns λ in
   [−180, 180) and φ in [−90, 90]. (Req 1.4)
2. *Wrap preserves direction*: `normalise([λ + 360k, φ])` equals
   `normalise([λ, φ])` for any integer k. (Req 1.4)
3. *Drag is reversible*: dragging by (dx, dy) then (−dx, −dy) returns to
   the start whenever no clamping happened. (Req 1.2)
4. *Centring faces the student*: after `centreOn(lon, lat)`, projecting
   that point with the new rotation lands at the globe's centre. (Req 2.1)
5. *Keyboard steps*: each arrow key changes exactly one angle by the step
   (before normalisation). (Req 1.3)
