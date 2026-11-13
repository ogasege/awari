# Requirements: Media library (multimedia encyclopedia)

Source: `docs/media-brief.md` (owner, 13 Nov). Starts after review 3 (spec 22) is committed.
Guardrails: no push, no deploy, no `terraform apply`, no spending.

## Requirements

### Licences come from the Commons API
1. `npm run licences` SHALL ask the Commons API (`prop=imageinfo`, `iiprop=extmetadata|url|size|sha1`,
   50 titles per request) for every bundled image, and save author, licence, restrictions, existence,
   sha1 and the verification date in `public/media/licences.json`.
2. THE script SHALL fail when a file is missing on Commons, its licence is off the allow-list, its
   metadata lists restrictions, or the author or licence differs from what Awari shows.
3. `submission-check` SHALL run it (or the cached result, no older than 7 days) and fail on any error.
4. EVERY image, including the ten design photos, SHALL record its Commons file title, never a guessed URL.
5. THE runbook, CREDITS and any list of owner tasks SHALL no longer ask the owner to confirm photo pages.

### What may be used
6. ONLY files hosted on Commons (`imagerepository: shared`).
7. Allow-list: public domain, CC0, CC BY and CC BY-SA, any version. Nothing with NC or ND, nothing
   whose licence cannot be read from the metadata.
8. SKIP files with listed restrictions, under 800 px on the long side, logos, signatures, coats of arms
   as lead images and collages, and anything violent, graphic, sexual or frightening (by Commons
   categories, title and description). Prefer Featured, Quality and Valued pictures.

### Collection
9. THE collector SHALL NOT use search. For each article it SHALL list images of the matching English
   Wikipedia article and of its Commons category (Wikidata P373) in as few requests as possible.
10. Every request SHALL carry a descriptive User-Agent with a contact address, `maxlag=5`, one at a
    time, at most one per second, a timeout, retry with backoff, and its response cached under
    `data/raw` so a rerun costs nothing. The job SHALL be resumable and write progress.

### Storage
11. EVERY image SHALL have a 480 px WebP thumbnail in the repo of about 25 KB; all bundled media
    SHALL stay under 150 MB.
12. THE 1280 px view SHALL load from Commons when a student opens a picture and be cached by the
    service worker; the offline badge and `offline-check` SHALL say so honestly.
13. Each image SHALL record: Commons title and page URL, author, licence name and URL, caption,
    subject and article, width and height, the date its licence was verified.
14. Captions SHALL come from the Commons description, shortened to plain English; never invented.

### Quantity
15. THE library SHALL hold at least 3,000 licensed images and no article SHALL have fewer than four.
16. EACH country SHALL have at least eight where Commons has good ones: flag, a map of where it is,
    and a landmark, a landscape, a city, wildlife and daily life.

### Screens
17. EVERY article SHALL show a strip of prints; opening one shows it large with caption, author and licence.
18. A Media gallery screen SHALL browse every picture by subject, continent and kind, with search and a
    "surprise me" pile, in the Home scrapbook style.
19. Home SHALL show a Picture of the day from the library, rotating like the rest of Home.
20. QUIZZES and the Castle SHALL get picture questions ("Which country is this landmark in?"),
    generated from the library and validated like every other question.

### Credit
21. EVERY picture SHALL show author and licence where it is viewed, a link to its Commons page and a
    note that it was resized.
22. THE credits page SHALL read from the media data, grouped by subject and paginated; `CREDITS.md`
    SHALL keep a summary and point to the machine-readable list.
23. `README.md` and `LICENSE` notes SHALL state that MIT covers the code and each picture and text
    keeps its own licence.

### Evidence
24. THE batch SHALL run through the conductor and the three crew members: the licence auditor checks
    a random 5% against Commons by hand, the design reviewer checks a sample of at least 150 pictures
    for suitability and the new screens against `design.md`.

Stretch, only when everything above is done: sounds from Commons under the same rules.
