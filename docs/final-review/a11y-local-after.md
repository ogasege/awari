# Accessibility local-after

Base: http://127.0.0.1:4173. axe-core 4.14.0, rules wcag2a, wcag2aa, wcag21a, wcag21aa and best-practice.

- Screens and states checked: 40 (both widths)
- Serious or critical violations: 6 on 6 screens

## Serious and critical
- [1440] Atlas / loaded: **label-content-name-mismatch** (serious) Elements must have their visible text as part of their accessible name; 6 nodes; e.g. `<a href="/stamps/africa" class="stamp-sheet__link" aria-label="Africa 1 of 54. Open this stamp page">`
- [1440] Atlas with a country / loaded: **label-content-name-mismatch** (serious) Elements must have their visible text as part of their accessible name; 6 nodes; e.g. `<a href="/stamps/africa" class="stamp-sheet__link" aria-label="Africa 1 of 54. Open this stamp page">`
- [1440] Stamps / loaded: **label-content-name-mismatch** (serious) Elements must have their visible text as part of their accessible name; 6 nodes; e.g. `<a href="/stamps/africa" class="stamp-sheet__link" aria-label="Africa 1 of 54. Open this stamp page">`
- [390] Atlas / loaded: **label-content-name-mismatch** (serious) Elements must have their visible text as part of their accessible name; 6 nodes; e.g. `<a href="/stamps/africa" class="stamp-sheet__link" aria-label="Africa 1 of 54. Open this stamp page">`
- [390] Atlas with a country / loaded: **label-content-name-mismatch** (serious) Elements must have their visible text as part of their accessible name; 6 nodes; e.g. `<a href="/stamps/africa" class="stamp-sheet__link" aria-label="Africa 1 of 54. Open this stamp page">`
- [390] Stamps / loaded: **label-content-name-mismatch** (serious) Elements must have their visible text as part of their accessible name; 6 nodes; e.g. `<a href="/stamps/africa" class="stamp-sheet__link" aria-label="Africa 1 of 54. Open this stamp page">`

## Keyboard walks (Tab x70 per screen)

| Screen | Distinct stops | Unnamed | Without a focus indicator |
|---|---|---|---|
| Home (1440) | 37 | none | none |
| Search results (1440) | 30 | none | none |
| Country article (1440) | 33 | none | none |
| Quiz (1440) | 15 | none | none |
| Castle (1440) | 28 | none | none |
| Atlas (1440) | 22 | none | none |
| Pictures (1440) | 69 | none | none |
| Home (390) | 34 | none | none |
| Search results (390) | 30 | none | none |
| Country article (390) | 33 | none | none |
| Quiz (390) | 15 | none | none |
| Castle (390) | 28 | none | none |
| Atlas (390) | 22 | none | none |
| Pictures (390) | 69 | none | none |

## Moderate and minor axe findings, text zoom, motion, colour scheme
- [1440] Search results/loaded: landmark-unique(moderate,1)
- [1440] Search, no hits/loaded: landmark-unique(moderate,1)
- [1440] Country article/loaded: image-redundant-alt(minor,10)
- [1440] Subject article/loaded: image-redundant-alt(minor,6)
- [1440] Pictures/loaded: image-redundant-alt(minor,60)
- [1440] Credits/loaded: landmark-unique(moderate,1)
- [1440] Pictures/large view open: image-redundant-alt(minor,60)
- [1440] 200% text on Home: no horizontal overflow
- [1440] 200% text on Country article: no horizontal overflow
- [1440] 200% text on Quiz: no horizontal overflow
- [1440] 200% text on Pictures: no horizontal overflow
- [1440] 200% text on Credits: no horizontal overflow
- [390] Search results/loaded: landmark-unique(moderate,1)
- [390] Search, no hits/loaded: landmark-unique(moderate,1)
- [390] Country article/loaded: image-redundant-alt(minor,10)
- [390] Subject article/loaded: image-redundant-alt(minor,6)
- [390] Pictures/loaded: image-redundant-alt(minor,60)
- [390] Credits/loaded: landmark-unique(moderate,1)
- [390] Pictures/large view open: image-redundant-alt(minor,60)
- [390] 200% text on Home: no horizontal overflow
- [390] 200% text on Country article: no horizontal overflow
- [390] 200% text on Quiz: no horizontal overflow
- [390] 200% text on Pictures: no horizontal overflow
- [390] 200% text on Credits: no horizontal overflow
- reduced motion on /: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- reduced motion on /atlas: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- reduced motion on /castle: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- reduced motion on /media: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- reduced motion on /article/countries/nigeria: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- dark colour scheme on /: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- dark colour scheme on /atlas: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- dark colour scheme on /castle: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- dark colour scheme on /media: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- dark colour scheme on /article/countries/nigeria: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- light colour scheme on /: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- light colour scheme on /atlas: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- light colour scheme on /castle: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- light colour scheme on /media: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
- light colour scheme on /article/countries/nigeria: overflow no, running animations 0, body rgb(255, 255, 255) on rgb(16, 24, 40)
