# Design: Stamp book

## Pure logic (`src/features/stamps/stamps.ts`)

- `stampsFor(discovered, items)`: stamps in discovery order, unknown
  slugs skipped, duplicates once, `africaCount` capped at 54.
- `africaSlots(stamps, items)`: one slot per African country in the
  index, sorted by name, holding the stamp when found.

## Screens

- Home's `StampBook` (built with 01-app-shell) shows the latest five.
- `StampsScreen.tsx`: strip heading, count in words, an "Africa" board
  of 54 slots (found: drawn `Stamp`; empty: dashed perforated slot with
  "Not found yet"), then "Around the world" for other stamps.
- Empty slots are decoration plus words: the list item text is
  "Not found yet", the dashed look is not the only signal.

## Correctness properties

1. One stamp per known discovered country, in discovery order.
2. The Africa count equals the African stamps and never exceeds 54.
3. Discovering more never lowers the count.
4. Africa slots: one per African country in the index, none repeated,
   and the filled slots are exactly the African stamps.
