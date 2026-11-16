# Requirements: 27-quiz-variety

Source: spec 26 final review (`docs/final-review/design-review-3.md` findings D-4 and D-8, and the owner's
decision of 16 Nov that the shape of the quizzes is not accepted as a known issue). The quizzes are about
79% fill-the-gap questions, and a fill-the-gap proof is the question's own sentence. This spec adds question
shapes built from facts the packs already hold, so a quiz of ten questions reads as ten different kinds of
thinking. Status: written, **not started**.

Ground rules that carry over from specs 20 to 26 and do not bend:
- Every question has a proof that really proves its answer (26 N-3). A question without one is not generated.
- No hint names the answer (22, 26 D-xx). Capitalisation, length and region never give the answer away.
- Suitability: nothing in `src/lib/text/suitability.ts` reaches a child (26 N-2). The scan covers the new shapes.
- Offline: every shape works from the saved packs, with no network (spec 20).
- Facts come from the packs already on disk (`countries/facts.json`, `timeline.json`, the atlas, the picture
  library, article text). No new download and no new source are introduced by this spec.
- Pass-or-drop: a question that cannot be generated cleanly from the data is dropped, never padded.

## Req 1. Question shapes
Each shape is a `kind` on the question record. A quiz of ten questions mixes shapes; no shape is more than
40% of any quiz and none is more than 40% of all questions in the committed quizzes (the cloze share falls
from 79% to at most 40%).

1.1 **Capital.** "What is the capital of X?" and the reverse, "Which country has the capital Y?". Facts: `capital`.
    Distractors are capitals of other countries in the same continent (or a close-by one), never the same
    country, never a name that contains the answer.
1.2 **Continent.** "Which continent is X in?" Distractors are the other continents. Transcontinental countries
    (Turkey, Russia, Egypt, Kazakhstan and the rest of the documented list) are skipped.
1.3 **Currency.** "What money is used in X?" Facts: `currency`. The proof sentence names the currency (26 R-1).
    Countries that share a currency (the euro) are not offered as distractors of each other.
1.4 **Neighbours.** "Which of these shares a land border with X?" Facts: `neighbours`, already restricted to land
    borders. Island states and countries with no land neighbour are skipped (26 N-1). The three wrong options
    are countries that do not border X. "Which one does NOT border X?" is allowed, with three real neighbours.
1.5 **Flag.** "Whose flag is this?" and "Which flag belongs to X?" with the flag shown as a picture. Flags are
    taken from the Commons flag files already licence-checked in the picture library; a country without a
    verified flag file gets no flag question. Flag alt text is empty in the options and the question text names
    what to do, so no screen reader user is given the answer by an alt text.
1.6 **Picture.** "What is in this picture?" Built from the lead picture of an article and its title, with
    distractors from the same subject. Pictures that are diagrams, maps or body pictures are never used
    (the same rule as 26 `dailyRejection`).
1.7 **Which came first?** Two or three events from `timeline.json` with dated years; the answer is the earliest.
    Events less than 10 years apart, events in BC/AD mixes without a clear year, and events whose text names
    the date of the other are skipped. The proof is the two dates, shown as the year and the sentence.
1.8 **True or false.** A statement built from one fact (capital, continent, currency, border, area rank) is shown
    as true, or with the fact swapped for a wrong one of the same kind. The two options are "True" and "False".
    Half of the statements are false. The false statement must be false with certainty (a swapped capital that
    is also a real capital of the same country is skipped).
1.9 **Biggest or smallest.** "Which of these has the largest area (or population)?" Four countries whose values
    differ by at least 20%, with the proof naming the figure and its year.
1.10 The existing fill-the-gap shape remains, with its present guards (cloze proof is the gap's own sentence).

## Req 2. Hints and proofs for the new shapes
2.1 Each new shape has the three-step hint ladder of spec 22 (a nudge, where to look, two removed options),
    written per shape, and none of the three names the answer (`hints.property.test.ts` runs over all shapes).
2.2 True/false has a nudge and a where-to-look but no "removed options" step (there are only two options);
    this is the one allowed difference and is stated in the design.
2.3 The proof is a sentence or a fact line from the source (for example "The capital is Andorra la Vella.") that
    contains the answer, and is never the question with the gap filled in.
2.4 "Where to look" names the article section that holds the fact, and that section exists in the article.

## Req 3. Where they appear
3.1 The quiz screen renders each shape: flag and picture questions show the image with its caption below, true or
    false shows two large buttons, "which came first" shows the events as cards.
3.2 Every shape is operable by keyboard, has a visible focus, targets at least 44 px, and passes axe.
3.3 The result screen and the per-article quiz list show the shapes mixed, and the "make a quiz" form is unchanged.
3.4 The Quizzes index states the shapes ("capitals, flags, pictures, first or later, true or false").

## Req 4. Generator
4.1 `scripts/quizzes/build.ts` gains one generator per shape, each a pure function over the pack data, so each is
    unit tested without a network.
4.2 The generator is deterministic: the same packs produce the same quizzes (seeded by article id and shape).
4.3 A build prints a table of questions per shape and per pack, and the number dropped per shape with the reason.
4.4 The committed quiz files are regenerated and the diff is reviewed: no existing, passing question is lost
    without a stated reason, and the total number of questions does not fall by more than 10%.

## Req 5. Gates (every one must pass before the spec is done)
5.1 `npm run suitability` passes over all new questions and proofs.
5.2 Property tests over all committed questions: answer is one of the options; options are distinct; no option
    contains the answer unless it is the answer; the proof contains the answer; the first hint does not name the
    answer; no two questions in a quiz have the same answer and shape.
5.3 Mix test: the cloze share of all committed questions is at most 40%, every shape appears in at least 30
    quizzes, and no quiz of ten has more than four questions of one shape.
5.4 Fact test: for the capital, continent, currency, neighbour, area and event shapes, every question's answer is
    re-derived from the pack data and equals the stored answer (a stale answer fails).
5.5 `offline-check` plays one question of each shape with the network off. `a11y.ts` finds no serious or
    critical issue on a quiz screen of each shape at 1440 and 390 px.
5.6 An independent design review (the `awari-design-reviewer` crew member) plays one quiz of each shape on the live
    build and reports; its blockers and majors are fixed before the spec is closed.

## Req 6. Out of scope
New facts, new data sources, user accounts, scoring or streaks, sound, and any change to the make-a-quiz form.
