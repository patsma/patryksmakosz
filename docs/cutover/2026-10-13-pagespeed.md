# PageSpeed before and after the move to MyDevil

Lab numbers from the PageSpeed Insights API (Lighthouse, Google's machines), performance category
only. Three runs per URL and strategy, 80 seconds or more apart so each is a fresh analysis, median
reported, the three scores in brackets. Field data (CrUX) is a 28-day window and is not compared.

## Before (Netlify), 2026-10-13 08:47 to 08:54 UTC

| URL | Strategy | Score (runs) | FCP | LCP | TBT | CLS | SI | TTFB |
|---|---|---|---|---|---|---|---|---|
| / | mobile | 93 (97, 93, 93) | 2.10 s | 2.40 s | 28 ms | 0.000 | 4.27 s | 87 ms |
| / | desktop | 98 (98, 98, 98) | 0.28 s | 0.37 s | 20 ms | 0.000 | 1.62 s | 87 ms |
| /projects | mobile | 87 (84, 87, 90) | 2.40 s | 2.78 s | 126 ms | 0.001 | 5.49 s | 165 ms |
| /projects | desktop | 81 (96, 73, 81) | 0.50 s | 0.54 s | 320 ms | 0.001 | 2.48 s | 176 ms |

`/projects` on desktop is not stable on Netlify: 96, 73 and 81 within six minutes, the spread
coming from blocking time. Read its median with that in mind.
