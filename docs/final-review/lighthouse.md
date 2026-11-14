# Lighthouse (live site, headless Chrome, simulated throttling)

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Transferred |
|---|---|---|---|---|---|---|---|---|---|
| article-desktop | 96 | 100 | 100 | 92 | 0.2 s | 0.4 s | 0 ms | 0.122 | 663 KB |
| article-mobile | 99 | 100 | 100 | 92 | 0.8 s | 1.8 s | 0 ms | 0.004 | 663 KB |
| atlas-desktop | 100 | 100 | 100 | 92 | 0.2 s | 0.5 s | 0 ms | 0.012 | 282 KB |
| atlas-mobile | 99 | 100 | 100 | 92 | 0.8 s | 2.0 s | 13 ms | 0.000 | 282 KB |
| home-desktop | 91 | 100 | 100 | 92 | 0.3 s | 0.6 s | 0 ms | 0.190 | 1152 KB |
| home-mobile | 93 | 100 | 100 | 92 | 1.2 s | 3.2 s | 0 ms | 0.000 | 1078 KB |
| pictures-desktop | 99 | 100 | 100 | 92 | 0.2 s | 0.4 s | 0 ms | 0.016 | 1829 KB |
| pictures-mobile | 94 | 100 | 100 | 92 | 1.2 s | 3.0 s | 7 ms | 0.000 | 982 KB |

## Audits below 100 in accessibility and best practices
- atlas-desktop: Elements with visible text labels do not have matching accessible names.
- atlas-mobile: Elements with visible text labels do not have matching accessible names.
