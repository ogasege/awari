# Media brief: make Awari feel like a multimedia encyclopedia (owner, 13 Nov)

Do this after `docs/review-3.md` is finished. New spec: `23-media-library`. Guardrails unchanged: no push, no deploy, no `terraform apply`, no spending.

The CD-ROM encyclopedias people remember were full of pictures: every article had several, and you could browse the media on its own. Awari has about one photo per article (475 for 483 articles). That is the gap. Target: **at least 3,000 licensed images**, and no article with fewer than four.

## 1. Licences come from the internet, not from me

I checked the ten design photos against the Wikimedia Commons API on 13 Nov: all ten exist and their author and licence match `CREDITS.md`. Remove the "owner confirms the photo pages" step from the runbook, CREDITS and your list of things you need from me. Replace it with a script:

- `npm run licences`: for every bundled image, ask the Commons API (`prop=imageinfo`, `iiprop=extmetadata|url|size|sha1`, 50 titles per request) for the current author, licence, restrictions and whether the file still exists. Save the answer with the date in `public/media/licences.json`. Fail if a file is missing on Commons, its licence is not on the allow-list, or the author or licence differs from what we show.
- Add it to `submission-check`. Record the Commons file title for every image (the ten design photos included), never a guessed URL.

## 2. What may be used

- Only files hosted on Wikimedia Commons (`imagerepository: shared`). Never a file that is local to a Wikipedia; those are often fair use.
- Licence allow-list: public domain, CC0, CC BY (any version), CC BY-SA (any version). Nothing with NC or ND, nothing with a licence you cannot read from the metadata.
- Skip files whose metadata lists restrictions (trademark, personality rights and similar), files under 800 px on the long side, logos, signatures, coats of arms as lead images, and collages.
- The audience is 9 to 14. Skip anything violent, graphic, sexual or frightening, using the Commons categories as well as the title and description. Have `awari-design-reviewer` look at a sample of at least 150.
- Prefer files Commons has assessed as Featured, Quality or Valued pictures (the `Assessments` field).

## 3. How to collect at this scale without being throttled

Last time the Commons search throttled you. Do not use search for this.

- For each article, list the images of the matching **English** Wikipedia article and of its Commons category (Wikidata P373) with `generator=images` / `generator=categorymembers` plus `prop=imageinfo`, so one request returns candidates with their licences.
- Follow the API etiquette: a descriptive User-Agent with a contact address, `maxlag=5`, one request at a time, at most one per second, every response cached on disk under `data/raw` so a rerun costs nothing, a timeout and retry with backoff on every request.
- Download thumbnails through the API's thumbnail URL at standard widths. Run it as a resumable job that writes progress, so an interruption loses nothing.

## 4. What to store

- A thumbnail in the repo for every image: WebP, 480 px wide, about 25 KB. Keep all bundled media under 150 MB.
- The large view (1280 px) loads from Commons when a student opens a picture, and the service worker caches it, so pictures already seen work offline. The offline badge and `offline-check` must stay honest about this.
- For every image: Commons title, page URL, author, licence name and URL, a caption, the subject and article it belongs to, width and height, and the date the licence was verified.
- Captions come from the Commons description, shortened into plain English. Never invent what a picture shows.

## 5. Where students see them

1. **Article gallery**: a strip of prints on every article; opening one shows it large with its caption, author and licence.
2. **Media gallery**: a new screen to browse every picture by subject, continent and kind, with search and a "surprise me" pile, in the Home scrapbook style.
3. **Countries**: at least eight each: flag, a map showing where it is, and photos of a landmark, landscape, city, wildlife and daily life where Commons has good ones.
4. **Picture of the day** on Home, from the library, rotating like the rest of Home.
5. **Picture questions** in quizzes and the Castle ("Which country is this landmark in?"), generated from the library and validated like every other question.

Stretch, only if everything above is done: sounds from Commons under the same rules (national anthems, animal calls), with a player on the article.

## 6. Credit properly

- Every picture shows author and licence where it is viewed, with a link to its Commons page and a note that it was resized.
- The credits page reads from the media data and is paginated or grouped by subject; `CREDITS.md` keeps a summary and points to the full machine-readable list.
- State clearly in `README.md` and `LICENSE` notes that the MIT licence covers the code, and that each picture and text keeps its own licence.

## 7. Evidence

Use the conductor and the crew members as in review 3: the licence auditor checks a random 5% against Commons by hand, the design reviewer checks the sample for suitability and the new screens against `design.md`. Properties to test include: every bundled image has a verified allow-listed licence; no article has fewer than four; no picture appears twice on one page; every caption traces to its Commons description. Log it all, then reply with the counts and anything you could not get.
