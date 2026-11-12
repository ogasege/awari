# Design: Tours

- `tours.ts`: `TOURS` (data), `stepStop(tour, index, delta)` clamped,
  `stopRotation(stop)` = `centreOn(lat, lon)` from globeMath.
- `TourScreen` reuses `Globe` (selected stop highlighted via a marker
  layer) and the stop card; `ToursScreen` lists tours.
- `ArticleScreen` reads `?tour=<id>&stop=<n>` and shows `TourBar`.
- Stops: coordinates are the best-known point of the feature (river
  mouths or mid-course, site of the wonder, summit), checked in a test
  against plausible ranges.

## Correctness properties

1. `stepStop` stays within 0..n-1 and next then previous returns.
2. The projection of a stop through `stopRotation` is at the globe centre.
3. Every tour has 6-8 stops, valid coordinates and a bundled article in
   the committed packs.
