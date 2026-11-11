# Kiro log

A dated record of which spec, hook or steering file drove each piece of work.

| Date (UTC) | Driven by | Spec / task | Work |
| --- | --- | --- | --- |
| 2026-11-11 20:41 | steering | setup 1-7 | Project created, brief saved verbatim, steering (product, tech, structure, design, hackathon-rules) and hooks (lint+test on save, credits check, kiro-log on task done, hard-rule guard) written from docs/brief.md |
| 2026-11-11 20:46 | KICKOFF.md | setup kit | awari-kit found in project: steering design.md and hackathon-rules.md switched to KICKOFF.md wording; rules check allows one plain inspiration mention in README and devpost |
| 2026-11-11 20:46 | steering/tech.md | 01-app-shell spec | Wrote requirements (EARS), design with 6 correctness properties, and tasks for the app shell; shared pack contract src/lib/packs/types.ts and lemmatiser with 5 properties |
| 2026-11-11 20:50 | steering | 10-quiz-service spec | Wrote requirements (EARS, 7 requirements), design with 12 correctness properties, and tasks for the quiz service |
| 2026-11-11 20:52 | spec | 10-quiz-service 1.1 | Shared question validator (validateQuestion, articleText, sectionOfSentence, articleFromText, isQuestionShape) with 20 example tests |
| 2026-11-11 20:53 | spec | 10-quiz-service 1.2 | fast-check Properties 1-9 for the validator and articleFromText (shuffle invariance, foreign proof, missing answer, leaky hints, re-spacing, text round trip) |
| 2026-11-11 20:56 | spec | 02-content-packs 1 | Content packs spec: EARS requirements (10), design with 11 correctness properties, tasks |
| 2026-11-11 20:57 | spec | 10-quiz-service 2.1 | Quiz Lambda package (Node 22, TS, esbuild bundle to dist/index.mjs, vitest) with request limits (64 KiB body, 200-40000 char text, no URL fetching) and origin allow-list CORS |
| 2026-11-11 20:58 | spec | 10-quiz-service 2.2 | Bedrock Converse call with submit_questions tool (auto choice, 4096 max tokens), validate/dedupe/retry-once loop, function URL handler (204/400/405/413/502/200, never 403/404); Properties 10-11; 37 Lambda tests |
| 2026-11-11 20:58 | spec | 02-content-packs 2 | Pure transforms: slugify, section/sentence splitting, summary, licence normalisation, image filter, Source builders; Properties 1, 2, 3, 11 |
| 2026-11-11 20:58 | spec | 10-quiz-service 3.1 | App client fetchRemoteQuiz: payload-hash header for CloudFront OAC, 50 s timeout, local re-validation, null on any failure; Property 12 |
| 2026-11-11 20:58 | spec | 02-content-packs 3 | Cached polite HTTP client (data/raw cache, AwariBuild User-Agent, serial queue with 150 ms gap, retries on 429/5xx) |
| 2026-11-11 21:00 | steering | 11-infrastructure spec | Wrote requirements (EARS, 7 requirements), design with 10 correctness properties checked by terraform test with mock providers, and tasks |
| 2026-11-11 21:01 | spec | 02-content-packs 4.1 | Wikidata API client (wbgetentities; SPARQL endpoint was rate-limited to 1 req/min) and claim helpers; Properties 4, 5; spec updated for iso3 from Natural Earth |
| 2026-11-11 21:02 | spec | 02-content-packs 6 | Margin notes: verbatim numeric article sentences under 70 chars, proof = exact sentence; Property 9 |
| 2026-11-11 21:03 | spec | 11-infrastructure 1.1 | Terraform providers (aws ~> 6.0, archive), validated variables, private site bucket (public access blocked, owner-enforced, SSE, versioning with 30-day expiry, CloudFront-only + TLS-only policy) |
| 2026-11-11 21:03 | spec | 11-infrastructure 1.2 | CloudFront with S3 OAC, SPA fallback (403/404 -> /index.html 200), HTTPS only, HTTP/2+3, security headers, cache tiers (assets 1y, packs 7d, html 60s, sw.js uncached); Properties 1-5 as terraform test with mock providers |
| 2026-11-11 21:04 | spec | 11-infrastructure 2.1 | Quiz Lambda (nodejs22.x arm64, 45 s, reserved concurrency 2), 14-day log group, least-privilege role (InvokeModel on chosen model/profile ARNs only), AWS_IAM function URL behind CloudFront lambda OAC on /api/quiz*; Properties 6-10 in terraform test |
| 2026-11-11 21:06 | spec | 11-infrastructure 3.1 | Outputs (site URL, bucket, distribution id, quiz endpoint, function URL), example.tfvars, README with build/deploy/upload/invalidate/verify commands and abuse/cost controls; fmt, validate and 13 terraform tests pass offline |
| 2026-11-11 21:19 | spec | 02-content-packs 4.2 | Countries: sovereign states on the Natural Earth 50m map with Simple English articles (alias table for NL, DK, Palestine), article builder, Wikidata facts, 54 African UN members check |
| 2026-11-11 21:19 | spec | 02-content-packs 5 | Physics pack: 12 electricity articles from Simple English Wikipedia with Commons photo search phrases |
| 2026-11-11 21:19 | spec | 02-content-packs 7 | Photos: Commons-only candidates, licence/author/restriction/flag-map filters, sharp resize to 800px under 90 KB |
| 2026-11-11 21:19 | spec | 02-content-packs 8 | Dictionary: OEWN 2025 LMF regex parser, lemma selection via lemmaCandidates, shards; Properties 6, 7 |
| 2026-11-11 21:19 | spec | 02-content-packs 9 | Atlas: Natural Earth 110m trimmed to iso3/name/id, 2-decimal coordinates, closed rings; Property 8 |
| 2026-11-11 21:19 | spec | 02-content-packs 10.1 | Credits region rewrite (Property 10), manifest, validatePacks shared by build and test |
| 2026-11-11 21:52 | spec | 02-content-packs 10.2 | npm run packs: staged build, validation, swap into public/packs, CREDITS region; 197 countries (54 African), 12 physics, 66 photos, 8998 lemmas, 7.06 MB; tighter place-photo rules |
| 2026-11-11 22:29 | steering/design.md | 01-app-shell 1.1-1.2 | Lagoon tokens, self-hosted fonts, contrast helper; Property 6 proves every text pair meets WCAG AA |
| 2026-11-11 22:29 | spec | 01-app-shell 2.1-2.2 | Pure router with round-trip and not-found properties; History API links, focus and title on navigation; credits screen renders CREDITS.md |
| 2026-11-11 22:29 | steering/design.md | 01-app-shell 3.1-3.2 | Seeded wobble generator (Properties 3-5) and hand-made Print, Strip, Tape, Pin, MarginNote, Doodle, TornEdge, Button, Stamp components |
| 2026-11-11 22:29 | spec | 01-app-shell 4.1 | Shared header with kit logo, nav with aria-current, search, offline badge; skip link; lazy routes |
| 2026-11-11 22:29 | design/home.png | 01-app-shell 5.1-5.2 | Home composed from design/home.html: kit doodle layers extracted, live stamps and doors from IndexedDB progress; 1440px matches reference (3951 vs 3953 px tall), 390px single column, no overflow |
