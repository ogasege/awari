# Defects caught by tests

Every correctness property in a spec's `design.md` has a test named `Property N:`.
These are the defects the tests (and the pack validators they share code with) caught,
with the commit that fixed or recorded each one.

| Spec | Test | What it caught | Commit |
| --- | --- | --- | --- |
| 05-quizzes | Property 6: hints never contain the answer | Year nudges such as "the 1960s" gave away an answer of 1960. Nudges are now written in words. | `be247ac` |
| 18-world-timeline | Property 2: a curated date that disagrees with Wikidata yields no event | 21 country independence days disagree with Wikidata's inception (Nigeria 1963 against 1960, the United States 1784 against 1776, Angola 1992 against 1975). They are left out rather than shown wrong. | `6084f8d` |
| 02-content-packs | Margin-note property (notes are suitable) | A fact note about an elephant being shot; 16 article notes and 1 Home note removed. | `b1a5071` |
| 01-app-shell 5.3 | Home facts are proved by their articles (example test) | Four Home notes (a lemur, "smoke that thunders", a 4,500-year claim, Kilimanjaro) were not in the articles they pointed to. Rewritten from real sentences. | `78df84a` |
| 06-castle 2.2 | A whole wing of twelve rooms can be completed (component test) | The last answer hid its own "Right!" and proof behind the finish panel. | `601248e` |
| 16-world-stamp-book | Property 4 over the real index | Confirmed Insular Oceania must be counted with Oceania (12 + 2 = 14), or two countries had no stamp page. | `8e5ba9d` |
| 09-offline | Property 2: precached paths are cache-first | Showed that a generated path like `/./0` is normalised by the URL parser; the generator was tightened, the code was right. | `0d21a79` |

The pack validators run on every build and failed it three times during this work: a
subject pack with 24 usable articles (needs 25), quiz folders with no credits entry, and
tour stops with no bundled article. Each was fixed before commit.
