# Requirements: Offline

## Introduction

The CD-ROM encyclopedia worked with no network because everything was on
the disc. Awari does the same: after one visit, a hand-written service
worker holds the whole app and every pack, and progress lives in
IndexedDB, so every pack feature works in airplane mode. The quiz
service is the one optional exception and is never needed.

## Glossary

- **Precache**: the list of every file in the built site (app, packs,
  photos, fonts, logo), saved by the service worker on install.
- **Version**: a hash of the precache's paths and contents; it names the
  cache.
- **Pack feature**: Home, articles, tap-a-word dictionary, atlas, quizzes,
  castle, timeline, On this day, stamp book and search.

## Requirements

### Requirement 1: Saving the site

1. WHEN a production build finishes, THE Build SHALL write `dist/sw.js`
   with the precache list and a version computed from the built files.
2. THE precache SHALL list `/`, `/index.html` and every built file except
   `sw.js` itself and source maps.
3. WHEN the service worker installs, THE Service_Worker SHALL fetch every
   precache file into a cache named for the version, and SHALL fail the
   install, leaving any earlier version in charge, IF any file cannot be
   saved.
4. WHEN a new version activates, THE Service_Worker SHALL delete caches
   of older versions and no other caches.

### Requirement 2: Answering requests

1. THE Service_Worker SHALL answer a request for a precached file from
   the cache first.
2. THE Service_Worker SHALL answer every page navigation to a same-origin
   path with the cached `/index.html`, so any route opens offline.
3. THE Service_Worker SHALL send non-GET requests, cross-origin requests
   and `/api/` requests (the quiz service) straight to the network and
   SHALL never cache them.
4. IF a same-origin request is not in the precache, THEN THE
   Service_Worker SHALL try the network and fall back to the cache.

### Requirement 3: Telling the student

1. THE header badge SHALL say in words whether the site is still being
   saved ("Saving for offline…"), saved ("Works offline"), or neither
   ("Not saved for offline yet"), and SHALL say "Offline, still working"
   only when the site is saved and the network is gone.
2. THE app SHALL work without a service worker (private browsing,
   unsupported browsers, development); offline support is progressive.

### Requirement 4: Proof

1. THE repository SHALL include `npm run offline-check`, which serves the
   built site on localhost, visits it once, goes offline and opens every
   pack feature, failing if any of them shows an error or loses content.
2. WHEN the check runs, THE Nigeria article SHALL render, the word
   "delta" SHALL resolve, the Nigeria quiz SHALL play, a Castle wing
   SHALL open, and the timeline, atlas, stamp book and search SHALL load.
