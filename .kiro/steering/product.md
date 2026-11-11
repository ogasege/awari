---
inclusion: always
---

# Product: Awari

Awari (Yoruba for "discovery") resurrects the 1990s CD-ROM encyclopedia as
a free, offline-first web app for curious students aged roughly 9 to 14.
It is the Kiroween 2026 entry in the Resurrection category.

## What the CD-ROM era got right, and we bring back

- Everything on the disc: once loaded, the whole library works with no
  network. Awari ships its content as static JSON "packs" and caches them
  with a service worker, so after one visit it works in airplane mode.
- Wandering: one thing leads to another. Every article links to the atlas,
  its quiz and the castle; every word in an article can be tapped for its
  meaning.
- Play: a trivia castle and quizzes turn reading into a game.

## What we fix from that era

- Open, credited content (Simple English Wikipedia, Wikidata, Natural
  Earth, Open English WordNet, Wikimedia Commons) instead of a closed disc.
- Hints that teach (nudge, where to look, two wrong answers removed) and a
  proof sentence after every correct answer, so quizzes send students back
  to the text instead of rewarding guessing.
- Accessible by default: keyboard reachable, visible focus, WCAG AA,
  right/wrong always carried by words, reduced motion respected.

## Features (one spec each in `.kiro/specs/`)

1. App shell and design system
2. Content packs (Countries, Physics: electricity, Dictionary)
3. Articles and dictionary side card
4. Atlas globe with discovered countries
5. Quizzes with a hint ladder
6. The Castle (room-by-room trivia)
7. Timeline and On this day
8. Stamp book (Africa: count out of 54)
9. Offline (service worker + IndexedDB)
10. Quiz service (Lambda + Bedrock, optional)
11. Infrastructure (Terraform: S3, CloudFront, Lambda)
12. Submission pack

If time runs short, cut in this order: timeline, quiz service, Physics
pack, dictionary. Never cut offline, quizzes with hints, or the atlas.

## Audience and tone

Students, their teachers and parents. Copy is short, warm and concrete.
Questions invite ("Can you find…?") rather than test. Never patronise.

## Non-goals

- Accounts, sign-in, tracking or analytics. Progress lives on the device.
- Ads or paid tiers. The app stays free and online until 29 January 2027.
