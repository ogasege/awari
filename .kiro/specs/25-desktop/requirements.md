# Requirements: 25-desktop

Source: `docs/desktop-brief.md` (owner, 14 Nov). The web app is what judges open; this spec must not
delay or change it.

## Req 1. Works offline from first launch
1.1 The desktop app ships the built site (`dist/`) with every pack and every thumbnail inside it.
1.2 With the network off from the very first launch, Home, articles, quizzes (with hints), the Castle,
    the Atlas, the Timeline and the Pictures screen work.
1.3 Large pictures come from Wikimedia Commons when online, exactly as on the web; offline the
    thumbnail shows with the same plain note. Large pictures are not bundled.

## Req 2. One code path
2.1 The desktop app loads the same `dist/` build as the site, with no desktop-only features.
2.2 The web build and deploy are unchanged: `npm run build` output and `scripts/deploy-live.sh`
    behave as before.

## Req 3. Platforms
3.1 Windows `.exe` (NSIS installer), macOS `.dmg` for Apple silicon and Intel, Linux `.AppImage`.

## Req 4. Where it lives
4.1 Wrapper source, config and build scripts are in `desktop/`.
4.2 A GitHub Actions workflow builds all three platforms on their own runners and attaches the
    installers to the GitHub Release `v1.0.0`.
4.3 Installers are never committed; git ignores them.
4.4 README links to the Releases page.

## Req 5. Honesty about signing
5.1 The installers are not code-signed or notarised. README states this, with the exact steps to open
    them (macOS: right-click, Open; Windows: More info, Run anyway).
5.2 No document calls them signed, notarised or verified.

## Req 6. Licences
6.1 The bundle includes the Credits screen and a `CREDITS` file plus `LICENSE` and `NOTICE`.
6.2 Release notes state the code is MIT and the content keeps its own licences.

## Req 7. Checks
7.1 A test checks the desktop bundle holds every file the service worker precaches, and that installer
    extensions are git-ignored.
7.2 The macOS build is run on this Mac and opened with the network off; screenshots go to
    `docs/screenshots/desktop-*.png`.
7.3 Windows and Linux are not run by hand; the report relies on the workflow passing and says so.
7.4 README, `docs/devpost.md`, `docs/judges.md` and `docs/video-script.md` get one short section on the
    download; `submission-check` still passes.

## Guardrails
Publishing the workflow and a Release on the public repo is approved. No spending, no code-signing
purchases, no Devpost submission, no social posts.
