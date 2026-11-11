# Design: The Castle

Screen design: `design/screens/README.md` (Castle).

```
src/features/castle/castle.ts        WINGS, buildPool, castleReduce (pure)
src/features/castle/CastleScreen.tsx wing chooser with drawn door rows
src/features/castle/WingScreen.tsx   the wall of doors + QuestionCard
src/features/castle/Doors.tsx        twelve hand-drawn doors (shared)
```

`buildPool(sets)` interleaves questions round-robin across the wing's
quiz sets (first question of each set, then the second, …), so neighbours
come from different articles. The wing plays through the pool with the
quiz reducer from spec 05, starting at the saved lit count; a room lights
when the reducer reports `right`. On `revealed`, `next` moves to the
next pool question while the lit count stays the same. The pool is long
(every country or physics article), so twelve rooms are always reachable.

Africa uses the quizzes of the 54 African countries; Electricity uses the
physics quizzes.

## Correctness properties

1. *Round robin*: in `buildPool`, no two neighbouring questions share an
   article unless only one article is left. (Req 1.3)
2. *Pool covers everything*: the pool contains every question of every
   set exactly once. (Req 1.2)
3. *Lit count*: lit rooms equal the saved count plus right answers this
   visit, capped at 12, and never decrease. (Req 2.2, 2.3, 2.5)
4. *Completable*: answering every pool question correctly lights all
   twelve rooms within twelve questions. (Req 2.4)
