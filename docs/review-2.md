# Review 2: defects seen in docs/screenshots (12 Nov)

From the owner, after looking at every screenshot in `docs/screenshots/`. Fix these in order, with a spec task and a test for each, then retake the screenshots. Guardrails unchanged: no push, no deploy, no `terraform apply`, no spending.

## Broken

1. **Tours globe is a solid black shape** (`tours-rivers-stop-2-1440.png`). Find the cause, fix it at 1440 and 390, and add a test that the tour globe's sea and land take their fills from the design tokens. Open every tour and every stop once in a real browser before ticking this.
2. **Open spec tasks**: 14-any-article task 5 (offline proof for a read Wikipedia article) and 19-home-world task 4. Finish both.

## Home says things that are not true of what it shows

Design rule 3 says a note shares a fact about "the thing" its arrow points at. The daily rotation broke that.

3. **Hero**: notes about koalas and suspension insulators point at the Earth photo, and "Ever wondered about Amazon River?" circles a patch of the Indian Ocean. Notes whose arrows touch the Earth photo must be facts about the Earth, each with its proof sentence. Only draw the circle when the note is about a place that is on the visible face of this photo, at that place. Put the rotating "ever wondered" prompt somewhere it does not point at anything.
4. **Subject pile**: the print for "The human body" is a pan of frying meat, "Inventions" is a bridge at night, "Famous people" is a park. Each subject needs a hand-picked cover photo that a ten-year-old would recognise as that subject. Keep the choice in one reviewed list, and run `awari-licence-auditor` over it.
5. **Notes beside the wrong print**: "Violin?" sits by the human body, the nebula fact by Electricity, "Digestion?" by Famous people. A note may only sit beside a print from the same subject. Make that a property test. Also fix the grammar of the prompt ("Ever wondered about the violin?" or "how digestion works?").
6. **On this day**: "Coming up on the calendar:" is drawn on top of the year 1866. A 14 November event sits under the heading for 12 November with nothing marking it as later. Label coming-up cards clearly and keep the label clear of the years at every width. The small chart doodle points at a birthday; remove it or make it mean something.
7. **Castle panel**: the button says "Enter The Asia wing" beside a photo of a castle in Ethiopia. Match the photo to the wing or use a neutral one, and fix the capital T.
8. **Home footer credits** name photos that are not on the page (the Milky Way, elephants, lightning). Generate the line from the photos actually shown that day.

## Screens a template could have made

`design.md` ends with: "could a template have made this? If yes, add one human touch that carries meaning, then remove one that doesn't." Run `awari-design-reviewer` on each of these and act on it.

9. **Atlas**: two thirds of the page is empty and the globe is small. Make the globe the hero (about half the width at 1440). Replace the 197 grey squares with drawn progress, for example a stamp sheet by continent.
10. **Every subject, Stamp book, Quiz**: plain bordered boxes on grid paper. Bring in prints, strips, tape and one meaningful note each. Keep form controls and body text straight and calm.
11. **Timeline**: the page is 34,650 px tall and almost every card is "X was born on". Show one century at a time with a way to move between them, and by default mix kinds of event so births are less than half of what is shown.
12. **Article lead photos**: Nigeria, the article the judges open first, leads with an aerial view of dirt tracks. Review the lead photo of every article on the judges' path in `docs/judges.md` and of the thirty most populous countries; use a recognisable landmark.

## Check

13. `subject-wildlife-1440.png` still shows the note about an elephant being shot, which the design reviewer already flagged. Confirm the fix is in the pack and retake the screenshot.
14. Retake all screenshots at 1440 and 390 after the fixes, and reply with a list of what changed and anything you could not fix.
