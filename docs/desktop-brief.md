# Desktop brief: Awari as a download (owner, 14 Nov)

Do this only after the runbook is finished and the live site is verified. New spec `25-desktop`. It must not delay or change the web app, which is what the judges open.

## Why

The CD-ROM encyclopedias worked the moment you put the disc in. The website needs one online visit before it works offline. A desktop download gives the full "works from first launch, no internet" experience.

## What to build

- A desktop wrapper around the existing built site (`dist/`), with every pack and every thumbnail inside it, so articles, quizzes, the Castle, the Atlas, the Timeline and the Pictures screen work with the network off from the first launch. Pick the wrapper that keeps the download smallest and the code simplest, and say why in the spec's design.
- Large versions of pictures still come from Wikimedia Commons when there is a connection, exactly as on the web. Offline, show the thumbnail with a plain note. Do not bundle the large pictures.
- Windows (`.exe` installer), macOS (`.dmg`, Apple silicon and Intel) and Linux (`.AppImage`).
- One code path: the desktop app loads the same build as the site. No features that exist only on desktop.

## Where it lives

- **In the repo**: the wrapper's source and config (for example `desktop/`), the build scripts, and a GitHub Actions workflow that builds all three platforms on their own runners. The rules ask for all source and instructions in the repo.
- **Not in the repo**: the built installers. Never commit an `.exe`, `.dmg` or `.AppImage`. The workflow attaches them to a GitHub Release (`v1.0.0`), and the README links to the Releases page.
- The installers are **not code-signed**. Say so plainly in the README with the exact steps to open them (macOS: right-click, Open; Windows: More info, Run anyway), and do not call them "signed", "notarised" or "verified".

## Checks

- A test that the desktop bundle contains every file the offline check expects, and that the installers are ignored by git.
- Run the macOS build locally on this Mac and open it with the network off: Home, the Nigeria article, a quiz with a hint, a Castle room, the Atlas, the Pictures screen. Screenshot it for `docs/screenshots/desktop-*.png`.
- You cannot run the Windows and Linux builds here. Say that in the report; rely on the workflow's build passing and do not claim they were tested by hand.
- Licences: the download carries the same pictures and text, so include the credits screen and a `CREDITS` file in the bundle, and state in the Release notes that code is MIT and content keeps its own licences.
- Update `README.md`, `docs/devpost.md`, `docs/judges.md` and `docs/video-script.md` with one short section on the download. `submission-check` must still pass.

## Guardrails

Publishing the workflow and a Release on the existing public repo is approved. Still no spending, no code-signing purchases, no Devpost submission, no social posts. Commit after each task; keep the turn alive during long builds.
