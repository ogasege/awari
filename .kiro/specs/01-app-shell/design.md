# Design: App shell and design system

## Overview

A Vite + React 19 single-page app with a hand-written router and a small
library of scrapbook components. Home is assembled from those components
following the measured composition of `design/home.html`.

## Architecture

```
src/main.tsx            mounts <App/>, registers the service worker
src/app/App.tsx         <Header/> + <RouteView/> + skip link
src/app/router.ts       matchRoute(path) -> { name, params } (pure)
src/app/useRoute.ts     history subscription, navigate(), focus + title
src/app/routes.tsx      route name -> React.lazy screen
src/design/tokens.css   Lagoon palette, fonts, spacing, focus ring
src/design/global.css   resets, .deco/.crowding rules, reduced motion
src/design/wobble.ts    seeded RNG + wobbly path generators (pure)
src/design/*.tsx        Print, Strip, Tape, Pin, MarginNote, Doodle,
                        TornEdge, Button, Stamp, HandUnderline
src/features/home/      Home screen sections
```

### Router

`matchRoute` is a pure function over a list of patterns
(`/article/:pack/:id`…). `useRoute` listens to `popstate`, intercepts
same-origin `<a>` clicks with a `Link` component, and exposes
`navigate(path)`. After each change it sets `document.title` and focuses
the screen's `h1` (which carries `tabIndex={-1}`).

### Wobble generator

`mulberry32(seed)` gives a deterministic PRNG. `wobblyLine`,
`wobblyCircle`, `wobblyArrow`, `wobblyStar` and `tornEdge` sample points
along the ideal shape and jitter them by a bounded amount, returning SVG
path data. Deterministic output keeps server/client renders and visual
tests stable.

### Composition on Home

Home sections reproduce the reference with a container-query unit
(`--u = 100cqw / 1344`) so the collage scales with the laptop width, and
switch to a flex column below 900 px where absolute positions are
dropped and `.crowding` decorations are hidden.

### Fonts

`@fontsource/bricolage-grotesque/800.css`,
`@fontsource/figtree/{400,600,700}.css` and
`@fontsource/covered-by-your-grace/400.css` are imported in `main.tsx`
(Latin subsets only, to stay small).

## Correctness properties

1. *Route round trip*: for every route pattern and any valid parameter
   values, building the path and matching it returns the same route and
   parameters. (Req 2.1)
2. *Unknown paths*: any path that matches no pattern resolves to
   `not-found`. (Req 2.4)
3. *Wobble determinism*: the same seed and shape always produce identical
   path data; paths only contain finite numbers. (Req 4.3)
4. *Wobble bounds*: every jittered point stays within the declared
   wobble amplitude of the ideal shape. (Req 4.3)
5. *Print rotation clamp*: for any requested rotation, the applied
   rotation has magnitude between 2 and 5 degrees. (Req 4.2)
6. *Contrast*: every declared text/background token pair meets its WCAG
   AA threshold. (Req 3.3)

## Testing

- fast-check properties 1–6 in `*.property.test.ts` files.
- Testing Library: header renders all links with `aria-current`, decos
  are `aria-hidden`, Home renders sections in order.
- Visual check: Playwright screenshots of Home at 1440 px and 390 px
  compared side by side with `design/home.png` (saved in
  `docs/screenshots/`).
- `scripts/check-bundle.ts` enforces Requirement 6.
