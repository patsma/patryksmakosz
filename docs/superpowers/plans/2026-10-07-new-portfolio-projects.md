# New Portfolio Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five 2025-2026 projects to patryksmakosz.com, using footage that already exists.

**Architecture:** Each project is one markdown file in `content/projects/` plus one video in
`public/movies/web-optimized/`. The videos are not recorded or encoded here: they were encoded on
2026-10-07 for a private walkthrough page and are copied in under this site's slugs. Production
serves video from Cloudflare R2, so each file is also uploaded there.

**Tech Stack:** Nuxt 4, @nuxt/content 3, ffmpeg (only if a re-encode is wanted), wrangler for R2.

**Spec:** none. The background is in the mind: `/Users/tasty/Projects/patryklocalmind/wiki/concepts/portfolio-asset-status.md`
(masters and pipeline) and the contract terms page in the mind's `wiki/concepts/` (naming rules).

## Global Constraints

- **Two projects are anonymised by contract.** For `auto-service-platform` and `architecture-studio`
  the end client's name and the agency's name must not appear in any text we author: title, slug,
  summary, tags, file names, alt text, meta, commit messages. Video of the public site as displayed
  is allowed, and so is one plain link labelled exactly `View live site`. Read the contract page
  above before writing their copy. A compliant blurb to copy the tone from is on
  the architecture build's entity page in the mind's `wiki/entities/`
- No claim of authorship or creative credit on those two. Describe the role ("Front-end developer")
  and the work, not ownership
- `category` must be one of `banner`, `website`, `custom-animation`, `logo-animation`. All five here
  are `website`. `npm run check:categories` is the real guard, the zod enum is not
- No em or en dashes anywhere. Plain hyphens
- Do not push without Patrick's word. `main` is 3 commits ahead of `origin/main` as of 2026-10-07,
  and a push publishes all of them
- Numbers in copy come from this plan only. Do not invent metrics

## What already exists (do not redo)

Masters, outside any repo:

| Slug here | Master |
|---|---|
| `auto-service-platform` | `/Users/tasty/Movies/portfolio-masters/auto-service-platform/home-overview-2026-10-07.mov` |
| `architecture-studio` | `/Users/tasty/Movies/portfolio-masters/architecture-studio/home-overview-2026-10-07.mov` |
| `releasd` | `/Users/tasty/Movies/portfolio-masters/releasd/home-overview-2026-10-07.mov` |
| `halftone-lab` | `/Users/tasty/Movies/site-capture/halftone-lab/2026-10-07/desktop-variants.mp4` |
| `quorum` | `/Users/tasty/Movies/site-capture/quorum/2026-10-07/desktop-new-event.mp4` |

Web encodes, in `/Users/tasty/Projects/alten-walkthrough/public/clips/` (H.264, silent, faststart):

| Slug here | Full recording | 7 s preview | Poster of the full |
|---|---|---|---|
| `auto-service-platform` | `performance-rescue.mp4` (1920x1158, 61 s, 12.4 MB) | `performance-rescue-preview.mp4` | `performance-rescue.webp` |
| `architecture-studio` | `polish-and-speed.mp4` (1920x1158, 54 s, 9.0 MB) | `polish-and-speed-preview.mp4` | `polish-and-speed.webp` |
| `releasd` | `releasd.mp4` (1920x1158, 41 s, 6.9 MB) | `releasd-preview.mp4` | `releasd.webp` |
| `halftone-lab` | `raw-webgl.mp4` (1440x900, 12 s, 3.9 MB) | `raw-webgl-preview.mp4` | `raw-webgl.webp` |
| `quorum` | `quorum.mp4` (1440x900, 11 s, 0.3 MB) | `quorum-preview.mp4` | `quorum.webp` |

To change an encode (trim, crop, preview moment): edit
`/Users/tasty/Projects/alten-walkthrough/scripts/clips.json` and run
`node /Users/tasty/Projects/alten-walkthrough/scripts/encode-clips.mjs <clip id>` there, then copy
again. Do not use `npm run convert-videos` for these: it re-encodes everything in `public/movies/`.

## Review Focus

- **A video that works in dev and 404s in production.** Dev reads `public/`, production reads R2
  through `useVideoUrl`. Expected: every new file answers 200 from the R2 base URL before a push
- **A client name leaking through a derived field.** Expected: a grep of the two anonymised files
  and of the built output finds the brand names only inside the `liveLink` value
- **A 12 MB hero video set to `preload: auto` on a phone.** Expected: the two long recordings do
  not download in full on page load. Decide in Task 2 (preview as hero, or `preload: metadata`)
- **The first frame of the two long recordings is a preloader.** Expected: the static thumbnail on
  `/projects` shows the site, not a blank or logo-only frame
- **A project missing from places other than `/projects`.** `app/data/projects.js` and
  `app/pages/about.vue` hold their own project lists. Expected: a conscious choice per project

---

### Task 1: Bring the footage in

**Files:**
- Create: `public/movies/web-optimized/{auto-service-platform,architecture-studio,releasd,halftone-lab,quorum}.mp4`
- Create: `public/movies/web-optimized/<slug>-preview.mp4` for the same five

- [ ] **Step 1: Copy the encodes under this site's slugs**

```bash
SRC=/Users/tasty/Projects/alten-walkthrough/public/clips
DST=/Users/tasty/Projects/tastysites-2025/public/movies/web-optimized
for pair in performance-rescue:auto-service-platform polish-and-speed:architecture-studio \
            releasd:releasd raw-webgl:halftone-lab quorum:quorum; do
  from=${pair%%:*}; to=${pair##*:}
  cp -n "$SRC/$from.mp4" "$DST/$to.mp4"
  cp -n "$SRC/$from-preview.mp4" "$DST/$to-preview.mp4"
done
ls -la "$DST" | grep -E "auto-service|architecture-studio|releasd|halftone-lab|quorum"
```

Expected: ten files. Check first whether `public/movies/` is git-ignored (`git check-ignore -v
public/movies/web-optimized/quorum.mp4`) and follow what the repo already does with videos.

- [ ] **Step 2: Make the thumbnails**

Look at how an existing website project gets its still on `/projects`
(`app/pages/projects/index.vue:57` reads `preview`, then `cover`) and at
`public/movies/web-optimized-jpgs/` and `web-optimized-gifs/`, then produce the same kind of file
for the five. For the two long recordings take the frame from a few seconds in, past the preloader:

```bash
ffmpeg -v error -y -ss 6 -i public/movies/web-optimized/auto-service-platform.mp4 \
  -frames:v 1 -vf "scale=1280:-2" public/movies/web-optimized-jpgs/auto-service-platform.jpg
```

Open each still with the Read tool and confirm it shows the site.

- [ ] **Step 3: Commit** the files the repo tracks, by name.

### Task 2: The three projects that can be named

**Files:**
- Create: `content/projects/releasd.md`, `content/projects/quorum.md`, `content/projects/halftone-lab.md`

- [ ] **Step 1: Read two existing website projects end to end** as the pattern:
  `content/projects/pushups-tracker.md` and `content/projects/riverscape.md`. Reuse their MDC
  components (`HeroVideo`, `OppositeDirectionMarquees`, `SimultaneousWords`). Do not build new ones.

- [ ] **Step 2: Decide the hero once, for all five.** The existing pattern loops `video` with
  `preload: auto`. That is fine for the 11 s and 12 s files. For the 41 to 61 s files either point
  `HeroVideo` at `<slug>-preview.mp4` and keep `video:` as the full recording, or set
  `preload: metadata`. Pick one, write it in the commit message, apply it to every long one.

- [ ] **Step 3: Write the three files.** Frontmatter, with facts that are confirmed:

```yaml
---
title: "Releasd"
slug: "releasd"
category: "website"
video: "/movies/web-optimized/releasd.mp4"
liveLink: "https://www.releasd.com/"
summary: "Marketing site for a PR reporting SaaS. Started as maintenance of a Nuxt 2 site and became a full rebuild on Nuxt 4, Nuxt UI 4 and Nuxt Content."
tags: ["nuxt4", "nuxt-ui", "nuxt-content", "typescript", "saas"]
date: 2025-09-01
---
```

```yaml
---
title: "Quorum"
slug: "quorum"
category: "website"
video: "/movies/web-optimized/quorum.mp4"
liveLink: "https://quorum.tastysites.pl/"
liveLinkLabel: "Open the live app"
summary: "Group scheduling with no database server. Browsers sync with each other directly and every write is signed with a per-device key. Built on Nuxt 4, RxDB and WebRTC, tested with Playwright runs that prove two browsers converge."
tags: ["nuxt4", "rxdb", "webrtc", "playwright", "local-first"]
date: 2026-09-01
---
```

```yaml
---
title: "Halftone Lab"
slug: "halftone-lab"
category: "website"
video: "/movies/web-optimized/halftone-lab.mp4"
liveLink: "https://halftone-lab-drab.vercel.app/"
liveLinkLabel: "Open the live lab"
summary: "A halftone shader lab: dot-field shaders on one full-screen canvas with a panel to switch six variants and tune them live. One variant raymarches a small 3D scene and draws it as halftone. Raw WebGL and GLSL, no dependencies, no build step."
tags: ["webgl", "glsl", "shaders", "creative-coding"]
date: 2026-09-01
---
```

The `date` values for Quorum and Halftone Lab are approximate. Confirm them from each repo's first
commit (`/Users/tasty/Projects/quorum`, and the halftone lab repo named on
`/Users/tasty/Projects/patryklocalmind/wiki/entities/halftone-lab.md`) before committing. Add
`cover:` or `preview:` pointing at the Task 1 still, in whatever form the pattern files use.

- [ ] **Step 4: Verify**

```bash
npm run check:categories
npm run dev
```

Open `/projects`, the Website tab, and each of the three pages. Expected: each appears in the tab,
its still shows, the hero plays, the live link works, console clean. Check at 390 px wide too.

- [ ] **Step 5: Commit**

### Task 3: The two anonymised projects

**Files:**
- Create: `content/projects/auto-service-platform.md`, `content/projects/architecture-studio.md`

- [ ] **Step 1: Read the contract terms page in the mind's `wiki/concepts/`**
  (the "Portfolio" section) and the compliant blurb on the architecture build's entity page.

- [ ] **Step 2: Write the two files.** The title is the kind of work, never a brand:

```yaml
---
title: "Performance rescue"
slug: "auto-service-platform"
category: "website"
video: "/movies/web-optimized/auto-service-platform.mp4"
liveLink: "LIVE_SITE_URL"
liveLinkLabel: "View live site"
summary: "Marketing site for a SaaS product company. Front-end build on WordPress with GSAP, Three.js and a custom animated preloader, then a performance pass: mobile largest contentful paint from 21.1 s to 3.0 s and page weight from 21.2 MB to 5.8 MB."
tags: ["wordpress", "gsap", "threejs", "performance", "core-web-vitals"]
date: 2026-08-01
---
```

```yaml
---
title: "Polish plus speed"
slug: "architecture-studio"
category: "website"
video: "/movies/web-optimized/architecture-studio.mp4"
liveLink: "LIVE_SITE_URL"
liveLinkLabel: "View live site"
summary: "Site for an architecture and workplace-design consultancy. Custom WordPress theme with page transitions, scroll-driven animation, smooth scroll and a physics interaction, on a site its owners edit themselves. 99 on desktop PageSpeed with all motion on."
tags: ["wordpress", "gsap", "scrolltrigger", "lenis", "barba", "matterjs"]
date: 2026-08-01
---
```

`LIVE_SITE_URL` is each site's public address, from its entity page in the mind. This repo is
public, so the names are not written here; `CLIENT_A`, `CLIENT_B` and `AGENCY` in the grep below
stand for them. Measured with PageSpeed Insights on the live sites, August 2026. In the body, the marquee
`projectName` and `meta` lines follow the same rule: sector and product type only.

- [ ] **Step 3: Prove nothing leaked**

```bash
grep -n -i "CLIENT_A\|CLIENT_B\|AGENCY" content/projects/auto-service-platform.md content/projects/architecture-studio.md
```

Expected: exactly two lines, both the `liveLink:` values. Then `npm run generate` and grep the
output folder for the same three words: hits only inside those two `href`s.

- [ ] **Step 4: Verify in the browser** as in Task 2 Step 4, then **commit** with a message that
  names no client.

### Task 4: The other lists, R2, the tracker

**Files:**
- Modify: `todos/portfolio-tracker.md`
- Maybe modify: `app/data/projects.js`, `app/pages/about.vue`

- [ ] **Step 1: Decide the other lists.** `app/data/projects.js` (the drag grid) and the project
  links in `app/pages/about.vue` are hand-kept. Read both, add the new projects where an equivalent
  older one sits, and ask Patrick only if it is unclear which of the five belong on `/about`.

- [ ] **Step 2: Upload to R2.** One command per file, as in this repo's `CLAUDE.md`:

```bash
for f in auto-service-platform architecture-studio releasd halftone-lab quorum; do
  for v in "$f" "$f-preview"; do
    npx wrangler r2 object put "tastysites-videos/movies/web-optimized/$v.mp4" \
      --file "public/movies/web-optimized/$v.mp4" --content-type "video/mp4" --remote
  done
done
npm run check:r2
```

`npx wrangler login` is interactive. If it is not logged in, ask Patrick to run `! npx wrangler login`.
Upload the stills too if the existing ones are served from R2.

- [ ] **Step 3: Add five rows to "Already Imported"** in `todos/portfolio-tracker.md` and bump the
  count in its heading. The backup column is the master path from the table above.

- [ ] **Step 4: Full check, then stop**

```bash
npm run build
```

Expected: exit 0. Report to Patrick what is ready and that nothing was pushed.

- [ ] **Step 5: After Patrick says push:** push, wait for the deploy, then on the live site check
  each of the five pages plays its video (a 200 from the R2 URL), and update the "patryksmakosz.com"
  column on `/Users/tasty/Projects/patryklocalmind/wiki/concepts/portfolio-asset-status.md`.

## Not in this plan

A custom overlay player like the walkthrough's (that one is an Angular component and does not
port), Resolve-cut case study videos, Upwork portfolio items, re-recording any footage.
