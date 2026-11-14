# Requirements: 26-final-review

Source: `docs/final-review.md` (owner, 14 Nov). The last spec before submission: an assessment first,
a fix list second. Nothing is marked as passing that was not exercised; a check that could not run is
reported as not run, with the reason.

Targets: the live site https://d3txwsv4mn6ye9.cloudfront.net after the latest deploy, and the
packaged macOS desktop app. Local preview only to reproduce a defect.

## Req 1. Click everything (brief section 1)
1.1 `scripts/final-review/crawl.ts` (Playwright, kept in the repo) starts at Home and activates every
    link, button, tab, card, chip, form control, hotspot, pager, filter, stamp, marker, picture and
    keyboard shortcut, following every in-app route until no new screen or state appears.
1.2 Each activation records screen, accessible name and role, result, console errors, failed requests
    and a sense check (blank screen, dead control, silent no-op, 404, wrong article).
1.3 Breadth: all 11 subjects, all 197 country pages, at least 150 articles across all subjects, every
    tour, every Castle room, every quiz type, the make-a-quiz form (good, bad, empty, offline), the
    Atlas, the Timeline, Pictures, word cards, search edge cases, stamp book, On this day (several
    days and both year ends), Credits (paging and search), About.
1.4 At least 40 deep links loaded directly and refreshed; unknown URLs show a helpful not-found screen.
1.5 Browser behaviour: back and forward, reload mid-quiz, two tabs, 200% text zoom, reduced motion,
    light and dark system themes.
1.6 Both 1440 and 390 px: no horizontal overflow, no clipped text, no control under 44 px on the phone,
    no overlap. Every image loads or shows its fallback.
1.7 Output `docs/final-review/crawl.json` and a table with totals (screens, controls, failures).

## Req 2. Against the CD-ROM encyclopedias of the 1990s (section 2)
2.1 A feature-by-feature table (present or missing, how close, what is weaker, what was fixed),
    critical, with no third-party name, logo, layout or artwork in the product.
2.2 Sound stated as a known difference; no third-party audio added.
2.3 The three places that still feel like a website, named and improved.

## Req 3. User experience (section 3)
3.1 `awari-design-reviewer` reviews fresh screenshots of every screen at both widths independently; a
    failure is reported, and the fallback review is marked as not independent.
3.2 Copy: at least 100 article leads and 200 captions sampled. Content: 60 articles and 60 quizzes.
3.3 Accessibility: axe on every screen type with zero serious or critical issues; keyboard paths;
    visible focus; names; contrast.
3.4 Performance on the live site: Lighthouse mobile and desktop for Home, an article, Pictures and the
    Atlas; first load size; time to usable on slow 3G.

## Req 4. Fix (section 4)
4.1 `docs/final-review/findings.md`: id, screen, what, severity, evidence, status, commit.
4.2 All blockers and majors fixed, and minors under 15 minutes; a regression test per fix where one
    can exist; the rest listed as known issues.
4.3 The crawl re-run from the start with before and after totals, until a run has no blocker or major.

## Req 5. Ready to submit (section 5)
5.1 `docs/final-review/readiness.md`: each rules item, yes or no, with evidence and real output tails.
5.2 Desktop installers per platform: built, where, opened and tested or only built.
5.3 AWS resources running and the expected monthly cost.
5.4 `docs/final-review/report.md`: one page, verdict, numbers, fixes, known issues, owner-only list.

## Req 6. Kiro screenshots (section 6)
6.1 `docs/kiro-evidence/screenshots/` committed; the strongest embedded beside the prompt each one
    supports in README, devpost and the blog post, with accurate alt text and captions that match
    `docs/kiro-evidence/crew/README.md`; listed in `docs/judges.md`.

## Req 7. Judging criteria (section 7)
7.1 `docs/final-review/judging.md`: each criterion's questions, our answer, evidence, changes.
7.2 Impact: a "Who it is for and why it matters" section with cited figures (ITU, UNICEF/Giga, GSMA
    or A4AI); unverifiable figures are left out; what it is not.
7.3 Technology: a "Kiro powers" answer (one installed and used for real, or one honest line); the
    post-batch workflow, the conductor and `awari-builder` used for real and recorded with failures; a
    "What I tried that did not work" paragraph; the real hook count; Crew features used; IDE and Web
    still stated as not used.
7.4 Innovation: a fair comparison (Wikipedia online, Kiwix, children's encyclopedia sites), each claim
    checked against the code.
7.5 Presentation: the video script re-checked against the live site, the problem and audience in the
    first 20 seconds, no brands or copyrighted music; `docs/video-recording.md` written.
7.6 Bonus prizes: the blog post ready to paste; `docs/social-post.md` notes only, beginning with
    `#KiroweenHackathon26` and saying the owner writes it; the other prizes listed as the owner's
    decision.

## Guardrails
No new features, no spending, no claims without evidence. Commit after each task. Say when there are
unpushed commits or the site needs a redeploy; the owner pushes and deploys.
