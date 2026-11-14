# Findings (spec 26-final-review)

Severity: blocker, major, minor, polish. Status is `fixed` only when the fix was exercised.

| Id | Screen | What is wrong | Severity | Evidence | Status | Commit |
|---|---|---|---|---|---|---|
| F-001 | Article, "More pictures" strip (and Pictures, picture quizzes, large view) | Offline, 10 of 12 pictures on `/article/countries/nigeria` show the browser's broken-image icon with alt text spilling out, right after the app says it works without a connection. Cause: library thumbnails (3,720 files, about 87 MB) are deliberately not in the install-time save, only kept once looked at, and the wording and the strip did not say so. Found by the owner on the live site, 14 Nov 20:15 UTC. | blocker | Owner report (brief section 8). Reproduced and fixed with `offline-check` steps "Unsaved pictures offline" and "Save all pictures on Credits". | fixed in the browser; desktop app not affected (all thumbnails are bundled, checked by `scripts/check-bundle.ts`) but not re-run since the change | see git log, "26-final-review F-001" |
| F-002 | Credits (`CREDITS.md` content) | List items render as a bullet plus a loose paragraph. | minor | Seen in task 8 screenshots. | open | |
| F-003 | Repo | `docs/kiro-evidence/hook-firings.jsonl` is rewritten by the hooks and contains the banned product name, so `npm run rules` fails on the working tree whenever it is modified. | major for submission (the check fails) | `npm run submission-check` output, 14 Nov. | open: needs the owner to decide (do not commit the modified file; or the hook must bracket the name) | |

## F-001: what was decided and what "works offline" now covers

- **Saved on the first visit (about 3 MB gzip, 1,575 files):** every article and quiz in the packs, the dictionary, the atlas and
  maps, the timeline, the Castle, the stamp sheets, and every article's lead photo.
- **Kept as you look at them:** the 3,720 extra library pictures (480 px copies, 87 MB). The larger view of a picture also needs
  a connection the first time.
- **Optional:** Credits has a "Save all pictures (about 87 MB)" button, with progress, for a visitor on a good connection.
- **Never a broken icon:** a picture that cannot load is replaced by a placeholder of the same size ("Needs a connection" offline,
  "Picture not available" online), and the strip adds one plain line saying some pictures need a connection the first time.
- **One true wording** in the header notice, the Credits line, README, devpost, judges guide, runbook and video script.
  The desktop app says plainly that every picture is included.
