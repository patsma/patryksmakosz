# Move patryksmakosz.com off Netlify to MyDevil, under its real name

Date: 2026-10-13
Status: phases 0 to 4 done on 2026-10-13, phase 5 not started

## Context

The portfolio lives in a local folder called `tastysites-2025` and deploys to Netlify. Both are
leftovers: the site is patryksmakosz.com, and Netlify now skips every deploy with "account credit
usage exceeded", so three commits of new clips cannot go live. MyDevil is already paid for, already
hosts mail for the domain, and has about 11 GB free.

Goal: the project is called `patryksmakosz` everywhere, builds as a static site, and deploys to
MyDevil with one command. First as a gated staging copy on `patryksmakosz.tastysites.pl`, then, on
Patrick's word, as the live site.

## Decisions taken (Patrick, 2026-10-13)

1. **Static.** `nuxt generate` plus `rsync` to `public_html`. No Node process, no Passenger
2. **Keep the GitHub repo** `patsma/patryksmakosz` and its history. Rename only the local folder
3. **Videos stay on R2**, unchanged (`app/composables/useVideoUrl.js`, `NUXT_PUBLIC_VIDEO_BASE_URL`)
4. **Staging** at `patryksmakosz.tastysites.pl`, standard Basic-auth gate plus noindex
5. **Cutover in two steps:** repoint the web records inside Netlify DNS first, move the zone later
6. **Deploy is a local script**, like the other MyDevil sites

## Facts the design rests on

- The site needs no server: `server/` holds one Sentry test route, no forms, no functions
- `package.json` already has `generate`; `CLAUDE.md` says static generation is supported, but
  Netlify runs `build`, so a generated build has never been the live one
- `*.tastysites.pl` resolves through a Cloudflare wildcard; no DNS record needed for staging
- Static sites on MyDevil are `devil www add <domain> php`, files in
  `~/domains/<domain>/public_html`, published with `rsync -avz --delete` over the `mydevil` SSH
  alias (pattern: section-lab `deploy.mjs`, dry run by default, `--go` to publish)
- `devil www add` alone gives the shared cert: `devil ssl www add 212.91.26.93 le le <domain>`
- Gate traps already paid for: `.htpasswd` above the docroot at 644, `AuthUserFile /usr/home/...`,
  the standard throwaway staging pair, never a generated password. The pair is not written in this
  repo (it is public); it lives in Patrick's notes
- patryksmakosz.com DNS is a Netlify zone (`netlify api getDnsRecords`), mail for it runs on
  MyDevil, registrar is name.com

## Phases

Each phase ends with a check. Phases 4 and 5 each need Patrick's explicit go.

### Phase 0 - Preflight: is everything in the repo that should be live

- Push the three local commits (`5833efa`, `a695f5b`, `78ac953`) to GitHub. Netlify will skip the
  build; that is expected
- `npm run check:r2` clean; every `video:` and `HeroVideo src` path in `content/projects/*.md`
  exists locally and answers 200 on R2
- Count `content/projects/*.md` against the live `/projects` page (83 local vs 78 live on
  2026-10-07) and list what staging will show that production does not
- Releasd detail clips stay out of scope; they wait on its home page

### Phase 1 - Rename (local only, reversible)

- Move `/Users/tasty/Projects/tastysites-2025` to `/Users/tasty/Projects/patryksmakosz`
- In the repo: `package.json` name (`nuxt-app`), `README.md` title, `CLAUDE.md` deploy section,
  drop the stale `heroku` remote. The R2 bucket keeps its name `tastysites-videos` (renaming means
  re-uploading 220 files for nothing). Links to `*.tastysites.pl` demos in content stay: they are
  real hosts
- The four hard paths outside the repo: the launcher pin list (`dev-pins.txt`), two masters in
  `alten-walkthrough/scripts/clips.json`, `colibrity-work-diary/pipeline/config.mjs`
  (`EXCLUDED_CWD`: add the new name, keep the old one, old transcripts still carry it)
- Claude's per-project folder: move `memory/` (16 files) from the old project slug to the new one
- Check the `~/node_modules` symlink does not dangle
- Patrick's notes: the portfolio pages, two skills, the Mac config file, two memory files. Logs are
  history and stay as written
- Check: `npm run dev` serves from the new folder, the `p` launcher opens it, the walkthrough
  encoder resolves both masters

### Phase 2 - Static build and a deploy script

- New `scripts/deploy.mjs <staging|production>`: runs `generate` with the right env, writes the
  target's `.htaccess` into the output, prints the `rsync` it would run; `--go` runs it
- `.htaccess` per target: `ErrorDocument 404 /404.html`, long cache for `/_nuxt/`, and for staging
  the auth block plus `X-Robots-Tag: noindex`. It is generated, so `rsync --delete` cannot wipe it
- `rsync` skips the mp4 files under `movies/` (they load from R2); GIFs, posters and stills ship
- Open points to settle by measurement on staging, not by guessing:
  - **Trailing slashes.** Apache redirects `/projects/x` to `/projects/x/`; Netlify does not.
    Decide between a rewrite and accepting the redirect, and keep canonical tags consistent
  - **`@nuxt/image`.** Images are only pre-rendered if the crawler reaches them; look for 404s
    under `/_ipx/`
  - **Nuxt Content** in a generated build: the `/projects` filter and every project page load
  - **R2 CORS** allows patryksmakosz.com and localhost only; add the staging origin if any video
    request needs it
- `netlify.toml` stays until cutover, so Netlify remains a fallback

### Phase 3 - Staging on MyDevil

- `devil www add patryksmakosz.tastysites.pl php`, Let's Encrypt cert, `sslonly` and `gzip` on,
  gate in place before the first upload, placeholder `index.html` removed
- `node scripts/deploy.mjs staging --go`
- Check by URL: 401 anonymous and 200 authenticated on `/`, `/projects`, three project pages (one
  per new-clip entry) and a made-up path (404 page); 403 on `/.htpasswd`; no failed requests in the
  browser network panel; videos play from R2; page transitions and the projects grid behave as on
  production. Then PageSpeed against production, medians of 3
- **Stop here. Patrick reviews staging.**

### Phase 4 - Cutover (needs Patrick's go)

- Snapshot the Netlify zone (`netlify api getDnsRecords`) into `docs/` before any change
- Add `patryksmakosz.com` and `www` on MyDevil, deploy the production target
- In Netlify: detach the custom domain from the site, then point apex and `www` at
  `212.91.26.93`. MX, SPF, DKIM and DMARC records are not touched
- Issue the certificate the moment the records resolve; verify cert subject, 200s, and one test
  mail in and out
- Rollback: re-attach the domain in Netlify

### Phase 5 - Leave Netlify (separate, later, needs Patrick's go)

- Move the zone to Cloudflare, next to `tastysites.pl`, then change nameservers at name.com
- Delete the Netlify site and `netlify.toml`
- Worth doing soon after phase 4: mail for the domain depends on a zone held by an account that is
  already over its credit

## Out of scope

- Any change to how videos are stored or served
- Renaming the R2 bucket or the GitHub repo
- Releasd detail clips
