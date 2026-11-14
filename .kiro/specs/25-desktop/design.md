# Design: 25-desktop

## Wrapper choice: Electron

| | Tauri 2 | Electron |
|---|---|---|
| Runtime in the download | ~5-10 MB (system webview) | ~90-100 MB (Chromium) |
| Content (`dist/`) | ~140 MB | ~140 MB |
| Toolchain | Rust + platform webview SDKs | Node, already used by the repo |
| Engine | WebKit on macOS/Linux, WebView2 on Windows | Chromium everywhere (same as the offline check) |
| Built and tested on this Mac today | No: no Rust toolchain installed | Yes |

Content is about 140 MB either way, so Tauri saves roughly 40% of the download. Electron is chosen
because the code is simpler (one ~80-line main file, no Rust), it runs the same engine the offline
check already proves, and it can be built and opened here as Req 7.2 demands. The size cost is
stated in the README.

## How it loads the site

- `desktop/main.cjs` registers a privileged custom scheme `app://awari/` (standard, secure, fetch,
  service workers allowed) and serves files from the bundled `site/` folder (a copy of `dist/`).
- Unknown paths fall back to `index.html`, like the CloudFront single-page fallback, so deep links
  such as `/atlas` work.
- Because the scheme is secure and allows service workers, the same `sw.js` registers and saves the
  site from the local files in seconds, so the "Works offline" badge behaves exactly as on the web.
  No desktop-only code is added to `src/` (Req 2.1).
- Requests to any other origin (Wikipedia, Commons) go to the network as on the web; when offline
  they fail and the app shows its existing notes (Req 1.3).
- Links that leave the app (`http(s)` to another site) open in the system browser; the window never
  navigates away from `app://awari`.
- Security: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, no preload.

## Build

- `desktop/package.json` holds Electron and electron-builder, kept apart from the web app's
  dependencies so the web build and bundle are untouched (Req 2.2).
- `npm run desktop:prepare` (root) runs the normal `npm run build` and copies `dist/` plus
  `LICENSE`, `NOTICE` and `CREDITS.md` into `desktop/site/`.
- `npm --prefix desktop run dist -- --mac|--win|--linux` makes the installers in `desktop/release/`.
- Git ignores `desktop/site/`, `desktop/release/` and `*.exe`, `*.dmg`, `*.AppImage`, `*.blockmap`.

## Workflow

`.github/workflows/desktop.yml`: on a `v*` tag push (or manual dispatch), a matrix of
`macos-latest`, `windows-latest` and `ubuntu-latest` builds and uploads artifacts; a final job
creates or updates the Release with `gh release` and attaches them with the notes in
`desktop/RELEASE_NOTES.md`. No signing secrets; `CSC_IDENTITY_AUTO_DISCOVERY=false`.

## Properties

- P1: every path in the service worker's precache list exists under `desktop/site/`.
- P2: `.exe`, `.dmg`, `.AppImage` paths are ignored by git (`git check-ignore`).
- P3: the bundle carries `LICENSE`, `NOTICE` and `CREDITS.md`.
