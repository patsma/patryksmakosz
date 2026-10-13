# MyDevil Migration (phases 0 to 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The portfolio is called `patryksmakosz` locally, builds with `nuxt generate`, and one command publishes it to a gated staging copy at `https://patryksmakosz.tastysites.pl`.

**Architecture:** A pure module (`scripts/deploy/htaccess.mjs`) owns the target table, the generated `.htaccess` text and the rsync exclude list, and is unit tested with `node --test`. A thin CLI (`scripts/deploy.mjs`) runs `generate`, writes the `.htaccess` files into `.output/public`, rsyncs over the `mydevil` SSH alias (dry run unless `--go`) and then checks the live responses, because on this host a setting that did not arrive looks the same as one nobody made.

**Tech Stack:** Nuxt 4.3 static generation, Node 22 ESM scripts, `node --test`, rsync over SSH, Apache `.htaccess` behind nginx on MyDevil, Cloudflare R2 for video.

**Spec:** `docs/superpowers/specs/2026-10-13-mydevil-migration-design.md`

**Repo path:** `/Users/tasty/Projects/tastysites-2025` in tasks 1 to 3, `/Users/tasty/Projects/patryksmakosz` from the last step of task 4 onward. Written below as `REPO`.

## Global Constraints

- Phases 4 and 5 (DNS, `patryksmakosz.com` on MyDevil, deleting Netlify) are NOT in this plan. Nothing here touches the Netlify zone or creates a `patryksmakosz.com` vhost
- Static only: `nuxt generate` plus `rsync` to `public_html`. No Node process, no Passenger
- Videos stay on R2. The bucket keeps its name `tastysites-videos`. `app/composables/useVideoUrl.js` is not changed
- The GitHub repo stays `patsma/patryksmakosz`. It is PUBLIC: no credential, no client restriction and no contract note goes into any file or commit message
- `netlify.toml` stays
- Links to `*.tastysites.pl` demos in `content/` stay: they are real hosts
- The staging gate uses the standard throwaway staging pair from Patrick's notes, never a generated password. It reaches scripts through `STAGE_AUTH_USER` and `STAGE_AUTH_PASS` in the environment of one command
- `.htpasswd` lives above the docroot at mode 644; `AuthUserFile` is spelled `/usr/home/tastysites/...`, never `/home/...`
- Headers use `Header set`, never `Header always set` (silently dropped on this host)
- At most 2 concurrent requests from a script to MyDevil. If `ssh mydevil` starts refusing, stop and wait five minutes; do not retry in a loop
- The four open points (trailing slashes, `/_ipx/` 404s, Nuxt Content, R2 CORS) are settled by measuring on staging in task 8, not earlier and not by reasoning
- Commits: imperative title, bullet list, no trailers. Stage files by path
- No em or en dashes anywhere

## Review Focus

1. **Local-only files under `public/` going live.** Netlify built from git; a local build copies everything in `public/`, including the ignored `public/movies/banner-sources/` and `public/oldportfolio/`. Expected: only git-tracked files are uploaded. Pinned by the `rsyncExcludes` tests in task 5 and the dry-run read in task 6
2. **A wrong `AuthUserFile` or a 640 `.htpasswd`.** Anonymous requests still answer 401, so the gate looks fine while every authenticated request is a 500. Expected: authenticated 200. Pinned by the `buildHtaccess` path test in task 5 and the authenticated checks in the CLI (task 6)
3. **Deep links without a trailing slash** (`/projects/x`, the form every existing backlink uses). Expected: the page, in at most one hop, never a 404 or a directory listing. Measured and pinned in task 8
4. **A missing path.** `ErrorDocument 404` is known to be replaced by nginx's own page on this host. Expected: the site's 404 page. Measured and pinned in task 8
5. **An mp4 requested from the site origin instead of R2.** mp4 files are not uploaded, so any component that bypasses `useVideoUrl` breaks only on MyDevil. Expected: zero mp4 requests to the staging host. Checked in the network read in task 8

---

### Task 1: Phase 0 preflight

**Files:** none changed. Output is a short list for the hand-off report.

- [ ] **Step 1: Confirm what the remote has and what a push would send**

```bash
cd /Users/tasty/Projects/tastysites-2025
git status --short
git ls-remote origin main
git log --oneline origin/main..HEAD
```

Expected: clean tree apart from this plan file, remote `main` at `c84a3f2`, four commits ahead (`5833efa`, `a695f5b`, `78ac953`, `83ee6cb`).

- [ ] **Step 2: Videos in sync with R2**

```bash
npm run check:r2
```

Expected: `All video files are synced with R2.` If it uploads something, run it again and expect the clean line.

- [ ] **Step 3: Every video path in content exists locally and on R2**

```bash
grep -h -o -E '/movies/[A-Za-z0-9_./-]+\.mp4' content/projects/*.md | sort -u > /tmp/claude-video-paths.txt
wc -l < /tmp/claude-video-paths.txt
while read -r p; do
  [ -f "public$p" ] || echo "MISSING LOCAL $p"
  code=$(curl -s -o /dev/null -w '%{http_code}' -I "https://pub-c9bfd14ac21c42f2b7f26ea1ddaf0e7e.r2.dev$p")
  [ "$code" = 200 ] || echo "R2 $code $p"
done < /tmp/claude-video-paths.txt
```

Expected: a count, then no `MISSING LOCAL` and no `R2` lines.

- [ ] **Step 4: Local entries against the live page**

```bash
ls content/projects/*.md | xargs -n1 basename | sed 's/\.md$//' | sort > /tmp/claude-local.txt
curl -s https://patryksmakosz.com/projects | grep -o 'href="/projects/[^"/#?]*' | sed 's|.*/||' | sort -u > /tmp/claude-live.txt
wc -l /tmp/claude-local.txt /tmp/claude-live.txt
comm -23 /tmp/claude-local.txt /tmp/claude-live.txt
```

Expected: 83 local, about 78 live, and the names staging will show that production does not. Keep the list for the hand-off report. If the live count is 0 the page markup changed: read the HTML and fix the pattern, do not skip the step.

- [ ] **Step 5: Push**

```bash
git push origin main
git ls-remote origin main
```

Expected: remote `main` equals local `HEAD`. Netlify skips the build; that is expected. This pushes four commits, one more than the spec lists: the fourth is the spec itself.

---

### Task 2: Rename inside the repo

**Files:**
- Modify: `package.json` (name), `package-lock.json` (two `name` fields), `README.md` (title), `CLAUDE.md` (project name only; the deploy section is rewritten in task 6, when the script exists)

- [ ] **Step 1: Rename the package**

In `package.json` change `"name": "nuxt-app"` to `"name": "patryksmakosz"`, then:

```bash
npm install --package-lock-only --ignore-scripts
git diff --stat package.json package-lock.json
```

Expected: `package.json` 1 line, `package-lock.json` 2 lines (the root `name` and `packages[""].name`). Any other lockfile change: `git checkout package-lock.json` and edit the two `name` lines by hand.

- [ ] **Step 2: README title**

Change line 1 of `README.md` from `# TastySites 2025` to `# patryksmakosz.com`.

- [ ] **Step 3: Find every other mention in tracked files**

```bash
git grep -n -i -E 'tastysites-2025|tastysites 2025|nuxt-app' -- . ':!docs/superpowers' ':!package-lock.json'
```

Change each hit that names the project or its folder to `patryksmakosz`. Leave `tastysites-videos` (the bucket), `*.tastysites.pl` hosts and anything under `content/`.

- [ ] **Step 4: Drop the stale remote**

```bash
git remote remove heroku && git remote -v
```

Expected: only `origin`.

- [ ] **Step 5: Verify and commit**

```bash
npm run check:categories
git add package.json package-lock.json README.md CLAUDE.md
git commit -m "Rename the project to patryksmakosz

- Set the package name to patryksmakosz
- Retitle the README
- Replace the old folder name in CLAUDE.md"
```

Add any other file step 3 changed to the `git add` by path.

---

### Task 3: References outside the repo

**Files (all outside the repo):**
- Modify: `/Users/tasty/Projects/patryklocalmind/claude-config/shell/dev-pins.txt:25`
- Modify: `/Users/tasty/Projects/alten-walkthrough/scripts/clips.json:23,32`
- Modify: `/Users/tasty/Projects/colibrity-work-diary/pipeline/config.mjs:76`
- Modify: every hit of the grep in step 4 under `/Users/tasty/Projects/patryklocalmind`

- [ ] **Step 1: Launcher pin**

Replace line 25 of `dev-pins.txt`, keeping the column alignment of its neighbours:

```
patryksmakosz       ~/Projects/patryksmakosz
```

- [ ] **Step 2: Walkthrough masters**

In `clips.json` change both `"master": "~/Projects/tastysites-2025/public/movies/web-optimized/..."` values to `~/Projects/patryksmakosz/public/movies/web-optimized/...` (same file names: `nuxt-gsap-portfolio.mp4`, `pushups-tracker.mp4`).

- [ ] **Step 3: Work diary exclusion**

`config.mjs:76` becomes (old name kept, old transcripts still carry it):

```js
export const EXCLUDED_CWD = ['akademiamolki', 'akademia-molki', 'tastysites-2025', 'patryksmakosz', 'marketing-site']
```

Check that `patryksmakosz` cannot wrongly match a billable project path: read how `EXCLUDED_CWD` is compared a few lines below and confirm.

- [ ] **Step 4: The mind**

```bash
cd /Users/tasty/Projects/patryklocalmind
grep -rn 'tastysites-2025' claude-config wiki --include='*.md' --include='*.txt' | grep -v '^wiki/log'
```

For each hit: a path or a current folder name becomes `patryksmakosz`; the alias list on `wiki/entities/portfolio-site.md` keeps `tastysites-2025` (people still search for it). Logs stay as written. On `portfolio-site.md` also: rewrite the "Next" section to the state after this session, fix the open-source table row (`patryksmakosz`), set `last_updated: 2026-10-13`. Every other edited page that has no `verified:` field gets one set to the date it already had. Then:

```bash
mind-index
f=$(mind-index --current-log)
```

Append to `$f` (under 1000 characters):

```
## [2026-10-13] rename | Portfolio folder is patryksmakosz
tastysites-2025 moved to /Users/tasty/Projects/patryksmakosz, phase 1 of the MyDevil migration. Pin, walkthrough masters, work-diary exclusion and every page naming the folder updated; the alias stays on the entity page.
Files touched: [[portfolio-site]], plus each page from the grep
```

- [ ] **Step 5: Commit the three repos, by path**

In each of `alten-walkthrough`, `colibrity-work-diary` and `patryklocalmind`: `git status --short` first, then `git add` only the files edited here and commit with a title like `Point at the renamed portfolio folder`. In the mind: `git pull --rebase` first, commit to main, and if `wiki/log/2026-10.md` still carries another session's uncommitted lines, leave the log file uncommitted for `mind-auto` to sweep. Read each repo's `CLAUDE.md` and run `git ls-remote` before any push; push the mind with `sync-pi-mind`.

---

### Task 4: The move

**Files:** the folder itself, and `~/.claude/projects/-Users-tasty-Projects-tastysites-2025/memory/`.

- [ ] **Step 1: Nothing holds the old path**

```bash
cd /Users/tasty/Projects/tastysites-2025
git worktree list
lsof -a -d cwd -c node 2>/dev/null | grep tastysites-2025
ls -ld /Users/tasty/node_modules
ls -e /Users/tasty/Projects/patryksmakosz
```

Expected: one worktree, no node process with its cwd in the folder (if `nuxt dev` is running there, stop and tell Patrick; do not kill it), no `~/node_modules`, and the new path does not exist.

- [ ] **Step 2: Move**

```bash
mv /Users/tasty/Projects/tastysites-2025 /Users/tasty/Projects/patryksmakosz
```

- [ ] **Step 3: Claude's project memory**

```bash
mkdir -p /Users/tasty/.claude/projects/-Users-tasty-Projects-patryksmakosz
mv /Users/tasty/.claude/projects/-Users-tasty-Projects-tastysites-2025/memory /Users/tasty/.claude/projects/-Users-tasty-Projects-patryksmakosz/memory
ls /Users/tasty/.claude/projects/-Users-tasty-Projects-patryksmakosz/memory | wc -l
```

Expected: 16. Old transcripts stay in the old slug folder.

- [ ] **Step 4: Rebuild what carried the absolute path**

```bash
cd /Users/tasty/Projects/patryksmakosz
ls -l dist
~/.claude/bin/trash-safe dist
rm -rf .nuxt .output
npx nuxt prepare
grep -rIl 'tastysites-2025' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs --exclude-dir=.netlify 2>/dev/null | head
```

`dist` is a symlink to the old absolute path; `generate` recreates it. Expected from the grep: nothing, or only local tool state (`.idea`, `.claude/settings.local.json`); fix those by hand.

- [ ] **Step 5: Phase 1 checks**

```bash
(PORT=3001 npm run dev > /tmp/claude-dev.log 2>&1 &) ; sleep 25
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/projects
pkill -f 'nuxt dev' ; true
grep -n patryksmakosz /Users/tasty/Projects/patryklocalmind/claude-config/shell/dev-pins.txt
node -e "const c=require('/Users/tasty/Projects/alten-walkthrough/scripts/clips.json');const fs=require('fs');const os=require('os');for(const m of JSON.stringify(c).match(/~\/Projects\/[^\"]+\.mp4/g)||[])console.log(fs.existsSync(m.replace('~',os.homedir()))?'ok  ':'MISSING',m)"
git -C /Users/tasty/Projects/patryksmakosz status --short
```

Expected: `200`, `200`, the pin line, `ok` for every master, clean tree. Only kill the dev server this step started.

---

### Task 5: Deploy library

**Files:**
- Create: `scripts/deploy/htaccess.mjs`
- Test: `scripts/deploy/test/htaccess.test.js`
- Modify: `package.json` (one script)

**Interfaces:**
- Produces: `SSH_HOST: string`, `TARGETS: Record<'staging'|'production', {domain: string, siteUrl: string, gated: boolean}>`, `remoteDocroot(target): string`, `buildHtaccess(target): string`, `ASSETS_HTACCESS: string`, `rsyncExcludes(untracked: string[]): string[]`

- [ ] **Step 1: Write the failing tests**

`scripts/deploy/test/htaccess.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TARGETS,
  remoteDocroot,
  buildHtaccess,
  ASSETS_HTACCESS,
  rsyncExcludes,
} from "../htaccess.mjs";

test("staging is gated and noindex", () => {
  const text = buildHtaccess(TARGETS.staging);
  assert.match(text, /^AuthType Basic$/m);
  assert.match(text, /^Require valid-user$/m);
  assert.match(text, /^Header set X-Robots-Tag "noindex, nofollow"$/m);
});

test("the password file path is /usr/home and sits above the docroot", () => {
  const text = buildHtaccess(TARGETS.staging);
  assert.match(
    text,
    /^AuthUserFile \/usr\/home\/tastysites\/domains\/patryksmakosz\.tastysites\.pl\/\.htpasswd$/m,
  );
  assert.doesNotMatch(text, /public_html\/\.htpasswd/);
});

test("production has no gate and no noindex", () => {
  const text = buildHtaccess(TARGETS.production);
  assert.doesNotMatch(text, /Auth|Require|X-Robots-Tag/);
});

test("both targets turn listings off and name the 404 page", () => {
  for (const target of Object.values(TARGETS)) {
    const text = buildHtaccess(target);
    assert.match(text, /^Options -Indexes$/m);
    assert.match(text, /^ErrorDocument 404 \/404\.html$/m);
  }
});

test("no header uses the form this host drops", () => {
  const all = Object.values(TARGETS).map(buildHtaccess).join("\n") + ASSETS_HTACCESS;
  assert.doesNotMatch(all, /Header always/);
});

test("hashed assets are cached for a year", () => {
  assert.match(ASSETS_HTACCESS, /^Header set Cache-Control "public, max-age=31536000, immutable"$/m);
});

test("the docroot is home-relative and ends in a slash", () => {
  assert.equal(remoteDocroot(TARGETS.staging), "domains/patryksmakosz.tastysites.pl/public_html/");
});

test("mp4 files under movies are never uploaded", () => {
  assert.ok(rsyncExcludes([]).includes("--exclude=/movies/**.mp4"));
});

test("untracked files and folders under public are excluded, anchored", () => {
  const args = rsyncExcludes(["public/movies/banner-sources/", "public/oldportfolio/a b.html"]);
  assert.ok(args.includes("--exclude=/movies/banner-sources/"));
  assert.ok(args.includes("--exclude=/oldportfolio/a b.html"));
});

test("paths outside public are ignored, and empty lines too", () => {
  const args = rsyncExcludes(["scripts/x.json", "", "publicity/y"]);
  assert.deepEqual(args, rsyncExcludes([]));
});
```

- [ ] **Step 2: Run them, expect failure**

Add to `package.json` scripts: `"deploy:test": "node --test \"scripts/deploy/test/*.test.js\""`

Run: `npm run deploy:test`
Expected: FAIL, `Cannot find module ... htaccess.mjs`.

- [ ] **Step 3: Implement**

`scripts/deploy/htaccess.mjs`:

```js
/**
 * Pure helpers for the MyDevil deploy: the target table, the .htaccess text
 * written into the build output, and the rsync exclude list. No I/O here, so
 * all of it is covered by scripts/deploy/test.
 */

/** @typedef {{ domain: string, siteUrl: string, gated: boolean }} Target */

export const SSH_HOST = "mydevil";

const REMOTE_HOME = "/usr/home/tastysites";

/** @type {Record<"staging" | "production", Target>} */
export const TARGETS = {
  staging: {
    domain: "patryksmakosz.tastysites.pl",
    siteUrl: "https://patryksmakosz.tastysites.pl",
    gated: true,
  },
  production: {
    domain: "patryksmakosz.com",
    siteUrl: "https://patryksmakosz.com",
    gated: false,
  },
};

/**
 * Docroot relative to the SSH user's home, with a trailing slash for rsync.
 * @param {Target} target
 * @returns {string}
 */
export function remoteDocroot(target) {
  return `domains/${target.domain}/public_html/`;
}

/**
 * The root .htaccess for a target. It is written into the build output on
 * every deploy, so rsync --delete can never remove it.
 *
 * Host rules it has to respect: the password file path must be spelled
 * /usr/home (Apache does not follow the /home symlink and answers 500 to every
 * authenticated request), and headers must use "Header set" ("Header always
 * set" is dropped without an error).
 * @param {Target} target
 * @returns {string}
 */
export function buildHtaccess(target) {
  const lines = ["Options -Indexes", "ErrorDocument 404 /404.html"];
  if (target.gated) {
    lines.push(
      "",
      "AuthType Basic",
      'AuthName "Staging"',
      `AuthUserFile ${REMOTE_HOME}/domains/${target.domain}/.htpasswd`,
      "Require valid-user",
      "",
      'Header set X-Robots-Tag "noindex, nofollow"',
    );
  }
  return `${lines.join("\n")}\n`;
}

/** .htaccess for /_nuxt/: every file name there carries a content hash. */
export const ASSETS_HTACCESS = 'Header set Cache-Control "public, max-age=31536000, immutable"\n';

/**
 * rsync exclude arguments. Videos load from R2, so mp4 files under movies/ stay
 * home. Everything git does not track under public/ stays home too: Netlify
 * built from git, a local build copies the whole folder, ignored files included.
 * @param {string[]} untracked - output lines of `git ls-files --others --directory -- public`
 * @returns {string[]}
 */
export function rsyncExcludes(untracked) {
  const local = untracked
    .filter((path) => path.startsWith("public/") && path.length > "public/".length)
    .map((path) => `--exclude=/${path.slice("public/".length)}`);
  return ["--exclude=.DS_Store", "--exclude=/movies/**.mp4", ...local];
}
```

- [ ] **Step 4: Run them, expect pass**

Run: `npm run deploy:test`
Expected: 10 passing, 0 failing.

- [ ] **Step 5: Commit**

```bash
git add scripts/deploy/htaccess.mjs scripts/deploy/test/htaccess.test.js package.json
git commit -m "Add the MyDevil deploy helpers

- Add the staging and production target table
- Generate the root and asset .htaccess text per target
- Build the rsync exclude list from untracked files under public
- Cover all three with node tests"
```

---

### Task 6: Deploy CLI

**Files:**
- Create: `scripts/deploy.mjs`
- Modify: `CLAUDE.md` ("Build & Deployment" section), `.env.example` (two key names, no values)

**Interfaces:**
- Consumes: everything task 5 produces
- Produces: `node scripts/deploy.mjs <staging|production> [--go]`, exit 0 only when every live check passes

- [ ] **Step 1: Write the CLI**

`scripts/deploy.mjs`:

```js
#!/usr/bin/env node
/**
 * Build the static site and publish it to MyDevil.
 *
 *   node scripts/deploy.mjs staging         build, then list what rsync would change
 *   node scripts/deploy.mjs staging --go    upload, then check the live responses
 *   node scripts/deploy.mjs production ...  the same for the live domain
 *
 * Staging sits behind a Basic-auth gate. The live checks read the pair from
 * STAGE_AUTH_USER and STAGE_AUTH_PASS; it is never written in this repo.
 *
 * On this host a setting that did not arrive looks exactly like one nobody
 * made, so the script ends by reading the real responses.
 */
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SSH_HOST,
  TARGETS,
  remoteDocroot,
  buildHtaccess,
  ASSETS_HTACCESS,
  rsyncExcludes,
} from "./deploy/htaccess.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".output", "public");
const VIDEO_BASE_URL = "https://pub-c9bfd14ac21c42f2b7f26ea1ddaf0e7e.r2.dev";

const [name, ...flags] = process.argv.slice(2);
const target = TARGETS[name];
const live = flags.includes("--go");

if (!target) {
  console.error("Usage: node scripts/deploy.mjs <staging|production> [--go]");
  process.exit(1);
}

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts });
const capture = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8" });

const { STAGE_AUTH_USER: user, STAGE_AUTH_PASS: pass } = process.env;
if (live && target.gated && !(user && pass)) {
  console.error("Set STAGE_AUTH_USER and STAGE_AUTH_PASS: the live checks have to pass the gate.");
  process.exit(1);
}
if (live && capture("git", ["status", "--porcelain"]).trim()) {
  console.error("Working tree is dirty. Commit first, so the live site matches a commit.");
  process.exit(1);
}

console.log(`\n== ${name} -> ${target.domain} (${live ? "LIVE" : "dry run"}) ==\n`);

/* 1. Build. Same switches Netlify used, plus the target's own URL. */
run("npm", ["run", "generate"], {
  env: {
    ...process.env,
    NUXT_PUBLIC_SITE_URL: target.siteUrl,
    NUXT_PUBLIC_VIDEO_BASE_URL: VIDEO_BASE_URL,
    DISABLE_SENTRY: "1",
    SENTRY_TELEMETRY_DISABLED: "1",
    NODE_OPTIONS: "--max_old_space_size=4096",
  },
});

/* 2. Generated server config goes into the output, so --delete keeps it. */
writeFileSync(join(OUT, ".htaccess"), buildHtaccess(target));
writeFileSync(join(OUT, "_nuxt", ".htaccess"), ASSETS_HTACCESS);

for (const file of ["index.html", "404.html", "projects/index.html", "_nuxt/.htaccess"]) {
  if (!existsSync(join(OUT, file))) throw new Error(`Build output is missing ${file}`);
}

/* 3. Sync. The docroot must already exist: creating a site is a deliberate act. */
const docroot = remoteDocroot(target);
run("ssh", [SSH_HOST, `test -d ${docroot}`]);

const untracked = capture("git", ["ls-files", "--others", "--directory", "--", "public"]).split("\n");
const rsyncArgs = ["-avz", "--delete", ...rsyncExcludes(untracked), `${OUT}/`, `${SSH_HOST}:${docroot}`];

if (!live) {
  run("rsync", ["--dry-run", ...rsyncArgs]);
  console.log(`\nDry run only, nothing was uploaded. Add --go to publish to ${target.siteUrl}`);
  process.exit(0);
}
run("rsync", rsyncArgs);

/* 4. Read the live responses, one at a time: this host blocks an IP that sends many at once. */
const auth = target.gated
  ? { authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}` }
  : {};
const get = (path, headers = auth) =>
  fetch(target.siteUrl + path, { headers: { "accept-encoding": "gzip", ...headers } });

const checks = [];
if (target.gated) {
  const anonymous = await get("/", {});
  checks.push(["an anonymous visitor gets 401", anonymous.status === 401]);
}
const home = await get("/");
const html = await home.text();
const robots = home.headers.get("x-robots-tag") ?? "";
checks.push(["home answers 200", home.status === 200]);
checks.push([
  target.gated ? "home is noindex" : "home is indexable",
  robots.includes("noindex") === target.gated,
]);

const projects = await get("/projects/");
checks.push(["projects answers 200", projects.status === 200]);

const script = html.match(/\/_nuxt\/[^"']+\.js/)?.[0];
checks.push(["home references a script", Boolean(script)]);
if (script) {
  const asset = await get(script);
  checks.push(["script answers 200", asset.status === 200]);
  checks.push(["script is compressed", Boolean(asset.headers.get("content-encoding"))]);
  checks.push(["script is cached long", (asset.headers.get("cache-control") ?? "").includes("immutable")]);
}

const missing = await get("/no-such-page-here");
checks.push(["a missing path answers 404", missing.status === 404]);

for (const [label, ok] of checks) console.log(`${ok ? "ok  " : "FAIL"} ${label}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
console.log(`\nLive at ${target.siteUrl}`);
```

- [ ] **Step 2: Usage error path**

Run: `node scripts/deploy.mjs nowhere; echo "exit $?"`
Expected: the usage line, `exit 1`.

- [ ] **Step 3: First generate, read what it built**

The staging docroot does not exist yet, so the script stops at the `test -d` line after building. That is the point of this step: prove `generate` works, which has never been the live build.

Run: `node scripts/deploy.mjs staging; echo "exit $?"`
Expected: a full generate, then a non-zero exit from `ssh ... test -d`. Then:

```bash
cat .output/public/.htaccess
ls .output/public/404.html .output/public/200.html .output/public/projects/index.html
find .output/public/projects -name index.html | wc -l
find .output/public -path '*_ipx*' -type f | wc -l
find .output/public -path '*__nuxt_content*' -type f | head
du -sh .output/public
```

Expected: the gate block, the three files, at least 84 project `index.html` files (83 entries plus the listing). Note the `_ipx` and `__nuxt_content` counts for task 8. If `generate` fails, use superpowers:systematic-debugging; do not switch to `nuxt build`.

- [ ] **Step 4: Document it**

Replace the "Build & Deployment" bullets in `CLAUDE.md` with:

```markdown
### Build & Deployment
- Static build: `nuxt generate`, output in `.output/public`
- Deploy is local: `node scripts/deploy.mjs staging` is a dry run, add `--go` to publish. It builds, writes the target's `.htaccess` into the output, rsyncs over the `mydevil` SSH alias and then checks the live responses
- Staging: `https://patryksmakosz.tastysites.pl`, behind a Basic-auth gate, noindex. `--go` needs `STAGE_AUTH_USER` and `STAGE_AUTH_PASS` in the environment; the pair is never written in this repo
- mp4 files under `public/movies/` are not uploaded (videos load from R2), and neither is anything under `public/` that git does not track
- `netlify.toml` stays until the domain is cut over: Netlify is the fallback
- Tests for the deploy helpers: `npm run deploy:test`
```

Append to `.env.example` with the Edit tool (key names only):

```
# Staging gate, read by scripts/deploy.mjs for its live checks
STAGE_AUTH_USER=
STAGE_AUTH_PASS=
```

- [ ] **Step 5: Commit**

```bash
npm run deploy:test
git add scripts/deploy.mjs CLAUDE.md .env.example
git commit -m "Add a one-command static deploy to MyDevil

- Add scripts/deploy.mjs with staging and production targets
- Dry run by default, --go uploads and checks the live responses
- Document the deploy and the staging gate variables"
```

---

### Task 7: Staging vhost, gate, first upload

**Files:** none in the repo. Server state on `mydevil`.

- [ ] **Step 1: Create the site**

```bash
ssh mydevil 'devil www list | grep -i patryksmakosz'
ssh mydevil 'devil www add patryksmakosz.tastysites.pl php'
ssh mydevil 'devil ssl www add 212.91.26.93 le le patryksmakosz.tastysites.pl'
ssh mydevil 'devil www options patryksmakosz.tastysites.pl sslonly on'
ssh mydevil 'devil www options patryksmakosz.tastysites.pl gzip on'
```

Expected: the first line prints nothing (if it prints a site, stop: something already owns the name). One command per SSH call, no parallel calls.

- [ ] **Step 2: Gate before any upload**

With `STAGE_AUTH_USER` and `STAGE_AUTH_PASS` set inline for the command (the password travels on stdin, never in the command string):

```bash
printf '%s' "$STAGE_AUTH_PASS" | ssh mydevil "htpasswd -ciB /usr/home/tastysites/domains/patryksmakosz.tastysites.pl/.htpasswd $STAGE_AUTH_USER && chmod 644 /usr/home/tastysites/domains/patryksmakosz.tastysites.pl/.htpasswd"
node -e "import('./scripts/deploy/htaccess.mjs').then(m=>process.stdout.write(m.buildHtaccess(m.TARGETS.staging)))" | ssh mydevil 'cat > domains/patryksmakosz.tastysites.pl/public_html/.htaccess'
ssh mydevil 'rm domains/patryksmakosz.tastysites.pl/public_html/index.html; ls -la domains/patryksmakosz.tastysites.pl domains/patryksmakosz.tastysites.pl/public_html'
```

Expected: `.htpasswd` at `-rw-r--r--` beside `public_html`, and `public_html` holding only `.htaccess`.

- [ ] **Step 3: The gate answers before there is a site**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://patryksmakosz.tastysites.pl/
curl -s -o /dev/null -w '%{http_code}\n' -u "$STAGE_AUTH_USER:$STAGE_AUTH_PASS" https://patryksmakosz.tastysites.pl/
echo | openssl s_client -servername patryksmakosz.tastysites.pl -connect patryksmakosz.tastysites.pl:443 2>/dev/null | openssl x509 -noout -subject -issuer
```

Expected: `401`, then `403` or `404` (an empty docroot with listings off; a `500` means the password file path or mode is wrong: fix it before going on), and `CN=patryksmakosz.tastysites.pl` issued by Let's Encrypt.

- [ ] **Step 4: Dry run, read the file list**

Run: `node scripts/deploy.mjs staging | tee /tmp/claude-dryrun.txt`

```bash
grep -c '\.mp4$' /tmp/claude-dryrun.txt
grep -E 'banner-sources|oldportfolio' /tmp/claude-dryrun.txt | head
grep -E '^\.htaccess$|^_nuxt/\.htaccess$' /tmp/claude-dryrun.txt
tail -3 /tmp/claude-dryrun.txt
```

Expected: `0` mp4 lines, no local-only folders, both `.htaccess` files listed, and a total size far under the 628 MB of `public/`.

- [ ] **Step 5: Publish**

Run: `node scripts/deploy.mjs staging --go`
Expected: every line `ok`, except possibly `a missing path answers 404`, which task 8 settles. Any other `FAIL`: superpowers:systematic-debugging, starting from the response headers.

---

### Task 8: Settle the open points by measurement

**Files:**
- Modify: `scripts/deploy/htaccess.mjs`, `scripts/deploy/test/htaccess.test.js`, `scripts/deploy.mjs` (only where a measurement says so)
- Possibly modify: `nuxt.config.ts` (only for the image point)

All `curl` calls below carry `-u "$STAGE_AUTH_USER:$STAGE_AUTH_PASS"`, written here as `$A`. `S=https://patryksmakosz.tastysites.pl`.

- [ ] **Step 1: Missing paths**

```bash
curl -s $A -o /tmp/claude-404.html -w '%{http_code}\n' $S/no-such-page-here
grep -c -i 'nie znaleziono' /tmp/claude-404.html
```

If the body is the site's own 404 page: nothing to do. If it is MyDevil's page (the known behaviour here), replace the `ErrorDocument` line in `buildHtaccess` with a rewrite that hands extension-less misses to Nuxt's generated 404 page, and update the two tests that name `ErrorDocument`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !\.[A-Za-z0-9]+$
RewriteRule ^ /404.html [L]
```

That answers 200 with the 404 page. Change the CLI check to `["a missing path shows the site's 404 page", body.includes(<a string read from .output/public/404.html>)]` and keep `a missing file is still a 404` for `/_nuxt/gone.js`. Record the status-code trade-off in the hand-off report: it is Patrick's call whether a soft 404 is acceptable for production.

- [ ] **Step 2: Trailing slashes**

Pick one project slug `X` from task 1's list.

```bash
curl -s $A -o /dev/null -w '%{http_code} %{redirect_url}\n' $S/projects
curl -s $A -o /dev/null -w '%{http_code} %{redirect_url}\n' $S/projects/X
curl -s    -o /dev/null -w '%{http_code}\n' https://patryksmakosz.com/projects/X
git grep -n -i 'canonical' -- app nuxt.config.ts
```

Production answers 200 with no slash. If staging answers 301 to the slash form, probe whether the fix is allowed before shipping it (a directive this host refuses is a 500 on every request):

```bash
ssh mydevil 'mkdir -p domains/patryksmakosz.tastysites.pl/public_html/_probe/sub && printf ok > domains/patryksmakosz.tastysites.pl/public_html/_probe/sub/index.html && printf "DirectorySlash Off\nRewriteEngine On\nRewriteCond %%{REQUEST_FILENAME} -d\nRewriteCond %%{REQUEST_FILENAME}/index.html -f\nRewriteRule ^(.+[^/])$ \$1/index.html [L]\n" > domains/patryksmakosz.tastysites.pl/public_html/_probe/.htaccess'
curl -s $A -w '\n%{http_code}\n' $S/_probe/sub
curl -s $A -w '\n%{http_code}\n' $S/_probe/sub/
```

Expected for a pass: `ok` and `200` on both. On a pass, add those five lines to `buildHtaccess` (before the 404 rewrite), add a test asserting `DirectorySlash Off` is present for both targets, redeploy, and re-run the two `curl` lines: both 200, no redirect. On a fail (500, or still 301): keep Apache's redirect, and say so in the hand-off report with the measured hop count. The next deploy's `--delete` removes `_probe/`; confirm with `curl` that `$S/_probe/sub/` is gone.

- [ ] **Step 3: Images**

```bash
git grep -n -E 'NuxtImg|NuxtPicture|useImage\(' -- app | wc -l
find .output/public/_ipx -type f | wc -l
```

Then in a real browser (chrome-devtools MCP, signed in through the gate) open `/`, `/projects` and three project pages, scroll each to the bottom, and list every request whose URL contains `/_ipx/` with its status. Any 404: add the exact failing routes to `nitro.prerender.routes` in `nuxt.config.ts`, regenerate, and repeat until the list is clean. Zero `/_ipx/` requests means nothing to do.

- [ ] **Step 4: Nuxt Content**

In the same browser session: `/projects` renders 83 cards, each of the four filter tabs shows a non-zero count that sums to 83, a click through to a project renders its body, and a hard reload on that project page renders it again. In the network list, every request under `/__nuxt_content/` and every `_payload.json` answers 200. A failure here is a blocker: debug with superpowers:systematic-debugging before going on.

- [ ] **Step 5: Video and R2 CORS**

Still in the browser: the console shows no CORS error, the network list shows zero `.mp4` requests to `patryksmakosz.tastysites.pl` and 200 or 206 for the ones to `r2.dev`, and one video on `/projects` plus one `HeroVideo` actually play. Only if a request fails on CORS: read the current rule (`npx wrangler r2 bucket cors list tastysites-videos`), add `https://patryksmakosz.tastysites.pl` to its allowed origins, and re-test. Do not change the rule on suspicion.

- [ ] **Step 6: Commit and redeploy what changed**

```bash
npm run deploy:test
git add scripts/deploy/htaccess.mjs scripts/deploy/test/htaccess.test.js scripts/deploy.mjs
git commit -m "Settle the static-host behaviours measured on staging

- <one bullet per change actually made, in the words of the result>"
STAGE_AUTH_USER=... STAGE_AUTH_PASS=... node scripts/deploy.mjs staging --go
```

Add `nuxt.config.ts` to the `git add` if step 3 changed it. Expected: every check `ok`. If no file changed in this task, skip the commit.

---

### Task 9: Staging acceptance and hand-off

**Files:**
- Modify: `/Users/tasty/Projects/patryklocalmind/wiki/entities/portfolio-site.md` (state, and the phase 4 start prompt)

- [ ] **Step 1: By URL**

For `/`, `/projects`, three project pages (one per new-clip entry from task 1's list) and `/no-such-page-here`:

```bash
for p in / /projects /projects/A /projects/B /projects/C /no-such-page-here; do
  printf '%s  anon %s  auth %s\n' "$p" \
    "$(curl -s -o /dev/null -w '%{http_code}' $S$p)" \
    "$(curl -sL $A -o /dev/null -w '%{http_code}' $S$p)"
done
curl -s $A -o /dev/null -w '%{http_code}\n' $S/.htpasswd
curl -sI $A $S/ | grep -i -E 'x-robots-tag|content-encoding'
```

Expected: anonymous 401 everywhere, authenticated 200 on the five pages and the task 8 outcome on the missing path, `403` on `/.htpasswd`, `noindex` present.

- [ ] **Step 2: In the browser, against production**

Side by side with `https://patryksmakosz.com`: page transitions between home, projects and a project; the projects grid, filters and scroll-triggered playback; the hamburger menu; the theme switch. The network panel shows no failed request on any of the pages visited, and the console no error that production does not also show.

- [ ] **Step 3: Performance**

Read the `web-vitals-traps` skill first. PageSpeed Insights cannot pass the gate, so measure both sides with the same tool: chrome-devtools `lighthouse_audit`, mobile, three runs each on `/` and `/projects` for staging and for production, report medians. State in the report that the numbers are lab numbers from one machine.

- [ ] **Step 4: Record and stop**

Update the "Next" section of `portfolio-site.md` to: staging URL, the commit it was built from, each task 8 outcome in one line, the entries staging shows that production does not, and a paste-ready start prompt for phases 4 and 5 that names `/Users/tasty/Projects/patryksmakosz` and says both need Patrick's explicit go. Bump `last_updated`, run `mind-index`, append a log entry, commit by path.

**Stop. Patrick reviews staging. Phases 4 and 5 are not started.**
