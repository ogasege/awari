# Design: Castle wings

`WINGS` is generated from `CONTINENTS` and `SUBJECTS` (`castle.ts`);
`Wing` gains `group: 'world' | 'subject'`. The pool loader is unchanged
(it already filters country quizzes by continent). `CastleScreen` renders
two groups.

## Correctness properties

1. Wing ids are unique; there are 16 wings, each with a source.
2. Every wing's pool from the committed packs has at least 12 questions.
3. A full wing of twelve rooms can be completed from its pool
   (extends 06-castle Property 4 to every wing).
