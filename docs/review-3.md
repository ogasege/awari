# Review 3: what is still wrong after review 2 (13 Nov)

From the owner, after looking at the retaken screenshots and reading `docs/kiro-evidence/crew/design-review-review-2.md`. Review 2 fixed the tours globe, the Home hero and covers, the footer credits, the Timeline length and the Nigeria lead photo. This is the rest. Guardrails unchanged: no push, no deploy, no `terraform apply`, no spending.

## How to run this batch

Run it the Crew way this time, so the evidence is real:

- Give this file to the **conductor** as one goal. Let it split the items into work items and hand the building to the `awari-builder` crew member.
- After each screen is fixed, have `awari-design-reviewer` check that screen before the item closes. Run `awari-licence-auditor` on every new or changed photo.
- When the batch is done, **run** the workflow `.kiro/workflows/awari-post-batch-verification.py` instead of doing its steps by hand.
- If any of these cannot be used, say exactly why in `docs/kiro-evidence/crew/README.md` and do the work in the main session. Commit after every item either way. Do not stop to ask between items.

## Every open item from the design reviewer

1. Fix all of N3 to N7, N9, N11 to N14 and N16 to N18 in `design-review-review-2.md`, and the items it marked PARTLY (4, 6, 7, 9, 10, 11, 12). Each one gets a task in a new spec `22-review-3` and a test where a test is possible.

## What I saw myself

2. **On this day is empty on some days.** On 13 November the Timeline says "No events are filed for 13 November yet" and Home shows three cards that are all for 14 November. Every day of the year needs at least two real events of its own (366 days), with their dates checked the same way as the rest. Add a test that fails if any day has fewer than two. "Coming up" cards may fill a third slot only.
3. **Subjects page** (`subjects-1440.png`) is still eleven plain boxes, and its note says "10 subjects". Each subject should be its cover print with a handwritten label, in the Home style; take the count from the data.
4. **Stamp book** (`stamps-1440.png`): the six continent boxes are plain rectangles and Oceania wraps onto its own row. Make each continent a small stamp sheet showing its found stamps and blank perforated slots.
5. **Atlas** (`atlas-c-nigeria-1440.png`): progress is still rows of grey squares. Use the same continent stamp sheets as the stamp book, so one component serves both.
6. **Home, Castle panel**: the photo beside "The Castle" is the children's flag drawing already used as the Countries cover. Use a castle or a door for the Castle; never use the same photo twice on one page (make that a test).
7. **Nigeria article**: Quick facts says 211,400,708 people (2021) and the first paragraph says over 232,679,478. Show one population figure with its year and source, across every country article, or label the two clearly. The "Cities" heading has nothing under it; drop empty sections in the pack build and test for it.
8. **Search** (`search-q-nile-1440.png`): snippets stop mid-word and one starts with raw coordinates. Cut snippets at a sentence or word boundary with an ellipsis, and strip coordinate strings.
9. **Timeline cards**: colour by kind of event, not by column, and say what the colours mean.
10. **Generated numbers**: `docs/generated/stats.json` still says 20 specs and 70 commits. Regenerate it as part of `submission-check` so the README and write-up cannot go stale, and fail the gate if they differ.

## Finish

11. Retake all screenshots at 1440 and 390, run `submission-check` and `offline-check`, update the write-up with the Crew features that really ran, and reply with what changed, what could not be fixed, and what you need from me.
