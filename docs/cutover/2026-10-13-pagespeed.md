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

## After (MyDevil), 2026-10-13 08:57 to 09:04 UTC

Taken right after the records moved. Every run reports a server response of 1 to 29 ms, against 82
to 177 ms before, so all twelve read the new host.

| URL | Strategy | Score (runs) | FCP | LCP | TBT | CLS | SI | TTFB |
|---|---|---|---|---|---|---|---|---|
| / | mobile | 91 (100, 89, 91) | 2.10 s | 2.63 s | 16 ms | 0.000 | 5.20 s | 1 ms |
| / | desktop | 99 (99, 83, 99) | 0.44 s | 0.52 s | 9 ms | 0.000 | 1.18 s | 2 ms |
| /projects | mobile | 86 (86, 67, 86) | 2.55 s | 2.99 s | 128 ms | 0.001 | 5.39 s | 3 ms |
| /projects | desktop | 86 (87, 79, 86) | 0.52 s | 0.60 s | 280 ms | 0.001 | 1.80 s | 20 ms |

## Difference

The move is neutral on the score: the medians sit within the run-to-run spread on both hosts (home
93 to 91 on mobile and 98 to 99 on desktop, projects 87 to 86 and 81 to 86). What moved for certain
is the server response, from about 90 to 175 ms down to a few milliseconds. Layout shift stays at
zero and blocking time is unchanged, which is expected: the JavaScript is the same build.

One thing is worse and not explained. On mobile, the browser's real first paint landed at about
2.3 s in two of three runs on each page, after the load event (0.5 to 1.2 s); in the third home run
it was 0.23 s. On Netlify first paint was 1.1 to 1.7 s and always before load. So the new host is
either much faster or somewhat slower to the first frame, run by run, and that is what pulls mobile
LCP from 2.40 to 2.63 s on the home page. The page preloads no fonts, so the known cause of a held
first frame on this host does not apply. It is a follow-up, not a reason to roll back.
