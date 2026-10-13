# MyDevil Cutover (phase 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `https://patryksmakosz.com` and `www` are served by MyDevil from the static build, with a valid certificate, while mail for the domain keeps working untouched.

**Architecture:** The files go up first and are verified over plain HTTP against the MyDevil IP, so the DNS change is the only moment of risk. The web records then change inside the Netlify zone, the certificates are issued the moment the authoritative servers answer, and the deploy script's own live checks run last, once the local resolver sees the new address. Netlify keeps the site and the zone: phase 5 is not in this plan.

**Tech Stack:** Nuxt 4.3 static generation, Node 22 ESM scripts, `node --test`, rsync over SSH, Apache `.htaccess` behind nginx on MyDevil, the `netlify` CLI against Netlify DNS (NS1), Let's Encrypt through `devil ssl`.

**Spec:** `docs/superpowers/specs/2026-10-13-mydevil-migration-design.md` (phase 4)

**Repo path:** `/Users/tasty/Projects/patryksmakosz`, written below as `REPO`. Branch `main`, in sync with `origin/main` at `85afd27`.

## Facts read on 2026-10-13, before writing this

- Netlify zone `68a67413aeb0b649da74684e` holds six records. Two are web, type `NETLIFY`, managed, TTL 3600: `68a674ef6b17a00008e0a065` (apex) and `68a674f06b17a00008e0a066` (`www`). Four are mail: MX `69a8f489a00556ebba76d3bc`, SPF `69a8f49a852629e9142fd9b7`, DKIM `6ac8e7267bc795ede52a0c3a`, DMARC `6ac8e729b35357795b5b781a`
- Netlify site `29665319-cd86-4b60-92f1-17135d099d74` (`tasty-sites-2025`), `custom_domain` `patryksmakosz.com`, no aliases, `managed_dns` true
- Netlify today: `www` answers 301 to the apex, HTTP answers 301 to HTTPS, both send `strict-transport-security: max-age=31536000`, a missing page is a real 404
- MyDevil has no `patryksmakosz.com` vhost yet. It already has the mail domain and the mailbox `me@patryksmakosz.com` (`~/mail/me@patryksmakosz.com`)
- No PageSpeed numbers for the Netlify site exist anywhere, so the baseline is taken in task 1 while Netlify still serves the domain

## Global Constraints

- Phase 5 is NOT in this plan: the zone stays on Netlify DNS, the nameservers at name.com are not changed, the Netlify site and `netlify.toml` are not deleted
- The four mail records (MX, SPF, DKIM, DMARC) are never created, edited or deleted. Every DNS step ends by comparing them with the snapshot
- The repo is PUBLIC: no credential goes into any file, command in this plan, or commit message. The staging pair reaches scripts through `STAGE_AUTH_USER` and `STAGE_AUTH_PASS` in the environment of one command; it is in Patrick's notes
- Decision (Patrick, 2026-10-13): a missing page on production answers **200 with the site's 404 page and `X-Robots-Tag: noindex`**. A missing file stays a real 404
- Headers use `Header set`, never `Header always set` (silently dropped on this host)
- At most 2 concurrent requests from a script to MyDevil. If `ssh mydevil` starts refusing, stop and wait five minutes; do not retry in a loop
- The deploy script's live checks read the domain over DNS. They run only once `dig +short patryksmakosz.com A` on this Mac answers `212.91.26.93`
- Rollback at any point after task 5: delete the two A records and re-attach the domain in Netlify (task 5, last step)
- Commits: imperative title, bullet list, no trailers. Stage files by path. `git ls-remote origin main` before any push
- No em or en dashes anywhere

## Two things this plan adds to the spec, and one order it changes

- **`www` redirects to the apex with a 301** and **the site sends HSTS**. Netlify does both today; dropping either would be a silent regression
- **The cutover order.** The spec says detach the domain, then add the records. Detaching first means every resolver that cached Netlify's answer (TTL 3600) is sent to a Netlify that no longer knows the domain, for up to an hour. So task 5 first tries to swap the records while the domain is still attached, which lets those visitors keep seeing the old site, and detaches only after the hour. If Netlify refuses to change its managed records, task 5 falls back to the spec's order and the hour is accepted
- **What cannot be avoided:** between the new A record and the certificate (a minute or two) a visitor on a fresh resolver gets a certificate error. Let's Encrypt cannot issue before the records point at MyDevil

## Review Focus

1. **A mail record lost or altered by a web change.** Netlify owns the managed records and may tidy the zone on detach. Expected: the four mail records identical to the snapshot. Pinned by the comparison at the end of tasks 5 and 6, and by a real mail each way in task 7
2. **A visitor on a stale resolver during the cutover.** Expected: the old site, not Netlify's "Site not found". Pinned by the order in task 5 and its fallback note
3. **`www.patryksmakosz.com` and deep links on `www`.** Expected: one 301 to the same path on the apex. Pinned by the `buildHtaccess` test in task 2, the IP check in task 4 and the live check in task 6
4. **The 404 page indexed as a real page.** It answers 200. Expected: `X-Robots-Tag: noindex` on it and on nothing else in production. Pinned by tests in task 2, proven on staging in task 3, live check in task 6
5. **The live checks reading Netlify by mistake.** A cached resolver makes `production --check` test the old host and fail (or worse, pass in part). Expected: checks run only after local DNS shows `212.91.26.93`. Pinned by the `dig` gate in task 6

---

### Task 1: Snapshot the zone and take the Netlify baseline

**Files:**
- Create: `REPO/docs/cutover/2026-10-13-netlify-zone-before.json`
- Create: `REPO/docs/cutover/2026-10-13-pagespeed.md`

**Interfaces:**
- Produces: the snapshot file every later DNS step is compared against; the "before" medians task 8 compares with

- [ ] **Step 1: Snapshot the zone**

```bash
cd /Users/tasty/Projects/patryksmakosz && mkdir -p docs/cutover && netlify api getDnsRecords --data '{"zone_id":"68a67413aeb0b649da74684e"}' > docs/cutover/2026-10-13-netlify-zone-before.json && python3 -c "import json; r=json.load(open('docs/cutover/2026-10-13-netlify-zone-before.json')); print(len(r)); [print(x['type'], x['hostname']) for x in r]"
```

Expected: `6`, then two `NETLIFY`, one `MX`, three `TXT` lines.

- [ ] **Step 2: Take the PageSpeed baseline while Netlify serves the domain**

Read the `web-vitals-traps` skill first. With the `pagespeed-insights` MCP run `https://patryksmakosz.com/` and `https://patryksmakosz.com/projects`, mobile and desktop, three runs each (clear the MCP cache between runs). Write the medians of performance score, LCP, CLS, TBT and TTFB into `docs/cutover/2026-10-13-pagespeed.md` under a `## Before (Netlify)` heading, one table row per URL and strategy.

- [ ] **Step 3: Commit**

```bash
cd /Users/tasty/Projects/patryksmakosz && git add docs/cutover/2026-10-13-netlify-zone-before.json docs/cutover/2026-10-13-pagespeed.md docs/superpowers/plans/2026-10-13-mydevil-cutover.md && git commit -m "Snapshot the Netlify zone before the cutover

- Add the six zone records as read on 2026-10-13
- Add the PageSpeed baseline of the Netlify site, medians of 3
- Add the phase 4 plan"
```

---

### Task 2: Production `.htaccess` rules and a deploy that can upload without checking

**Files:**
- Modify: `REPO/scripts/deploy/htaccess.mjs`
- Modify: `REPO/scripts/deploy/test/htaccess.test.js`
- Modify: `REPO/scripts/deploy.mjs`
- Modify: `REPO/CLAUDE.md` (Build & Deployment section)

**Interfaces:**
- Produces: `TARGETS.production.aliases: string[]`, `TARGETS.production.hsts: true`; CLI flags `--go --no-checks` (upload only) and `--check` (live checks only, against the existing build output)

- [ ] **Step 1: Write the failing tests**

In `scripts/deploy/test/htaccess.test.js` replace the test `"production has no gate and no noindex"` with these, and append the rest:

```js
test("production has no gate, and noindex only on the 404 page", () => {
  const text = buildHtaccess(TARGETS.production);
  assert.doesNotMatch(text, /Auth|Require/);
  const outside = text.replace(/<Files "404\.html">[\s\S]*?<\/Files>/, "");
  assert.doesNotMatch(outside, /X-Robots-Tag/);
});

test("the 404 page is noindex on both targets, since it answers 200", () => {
  for (const target of Object.values(TARGETS)) {
    assert.match(
      buildHtaccess(target),
      /<Files "404\.html">\nHeader set X-Robots-Tag "noindex"\n<\/Files>/,
    );
  }
});

test("www redirects to the apex with the path, before any page rewrite", () => {
  const text = buildHtaccess(TARGETS.production);
  assert.match(text, /^RewriteCond %\{HTTP_HOST\} \^www\\\.patryksmakosz\\\.com\$ \[NC\]$/m);
  assert.match(text, /^RewriteRule \^ https:\/\/patryksmakosz\.com%\{REQUEST_URI\} \[R=301,L\]$/m);
  assert.ok(text.indexOf("R=301") < text.indexOf("$1/index.html"));
});

test("staging has no alias redirect", () => {
  assert.doesNotMatch(buildHtaccess(TARGETS.staging), /HTTP_HOST/);
});

test("production sends HSTS, staging does not", () => {
  assert.match(
    buildHtaccess(TARGETS.production),
    /^Header set Strict-Transport-Security "max-age=31536000"$/m,
  );
  assert.doesNotMatch(buildHtaccess(TARGETS.staging), /Strict-Transport-Security/);
});
```

- [ ] **Step 2: Run them and see them fail**

Run: `cd /Users/tasty/Projects/patryksmakosz && npm run deploy:test`
Expected: FAIL on the four new tests (no `<Files>` block, no `HTTP_HOST`, no HSTS).

- [ ] **Step 3: Implement in `scripts/deploy/htaccess.mjs`**

Typedef and target table:

```js
/** @typedef {{ domain: string, siteUrl: string, gated: boolean, aliases?: string[], hsts?: boolean }} Target */
```

```js
  production: {
    domain: "patryksmakosz.com",
    siteUrl: "https://patryksmakosz.com",
    gated: false,
    aliases: ["www.patryksmakosz.com"],
    hsts: true,
  },
```

In `buildHtaccess`, build the alias rules and put them right after `"RewriteEngine On"`:

```js
  // An alias (www) shares the docroot through a pointer domain; send it to
  // the main domain in one hop, path kept.
  const aliasRules = (target.aliases ?? []).flatMap((alias) => [
    `RewriteCond %{HTTP_HOST} ^${alias.replaceAll(".", "\\.")}$ [NC]`,
    `RewriteRule ^ ${target.siteUrl}%{REQUEST_URI} [R=301,L]`,
  ]);
```

```js
    "DirectorySlash Off",
    "RewriteEngine On",
    ...aliasRules,
    "RewriteCond %{REQUEST_FILENAME} -d",
```

After the 404 rewrite rule, still inside the `lines` array:

```js
    "RewriteRule ^ /404.html [L]",
    "",
    // The 404 page answers 200, so it must never be indexed.
    '<Files "404.html">',
    'Header set X-Robots-Tag "noindex"',
    "</Files>",
  ];
  if (target.hsts) lines.push("", 'Header set Strict-Transport-Security "max-age=31536000"');
```

- [ ] **Step 4: Run the tests and see them pass**

Run: `cd /Users/tasty/Projects/patryksmakosz && npm run deploy:test`
Expected: all pass.

- [ ] **Step 5: Give the CLI an upload-only and a check-only mode**

In `scripts/deploy.mjs`, header comment, add:

```js
 *   node scripts/deploy.mjs production --go --no-checks   upload only (before DNS points here)
 *   node scripts/deploy.mjs production --check            live checks only, against the last build
```

Replace the flag parsing and the two guards:

```js
const [name, ...flags] = process.argv.slice(2);
const target = TARGETS[name];
const checkOnly = flags.includes("--check");
const live = flags.includes("--go");
const willCheck = checkOnly || (live && !flags.includes("--no-checks"));

if (!target || (checkOnly && live)) {
  console.error("Usage: node scripts/deploy.mjs <staging|production> [--go [--no-checks] | --check]");
  process.exit(1);
}
```

```js
if (willCheck && target.gated && !(user && pass)) {
```

Change the banner to `checkOnly ? "checks only" : live ? "LIVE" : "dry run"`. Wrap step 1 (build) and step 2 (writing the `.htaccess` files) in `if (!checkOnly) { ... }`, leaving the `const ipxRoot` line and the "Build output is missing" loop outside it. Wrap step 3 (the `ssh test -d`, the rsync and the dry-run exit) in `if (!checkOnly) { ... }` too, then add after it:

```js
if (!willCheck) {
  console.log(`\nUploaded to ${target.domain}. Live checks skipped: run --check once DNS points here.`);
  process.exit(0);
}
```

In the checks, after the `"home is indexable"` push:

```js
if (target.hsts) {
  const hsts = home.headers.get("strict-transport-security") ?? "";
  checks.push(["home sends HSTS", hsts.includes("max-age=31536000")]);
}
for (const alias of target.aliases ?? []) {
  const hop = await fetch(`https://${alias}/projects`, { redirect: "manual" });
  checks.push([
    `${alias} redirects to the main domain`,
    hop.status === 301 && hop.headers.get("location") === `${target.siteUrl}/projects`,
  ]);
}
```

After the `"a missing page shows the site's 404 page"` push:

```js
checks.push(["the 404 page is noindex", (missing.headers.get("x-robots-tag") ?? "").includes("noindex")]);
```

- [ ] **Step 6: Prove the CLI still parses and the dry run still works**

Run: `cd /Users/tasty/Projects/patryksmakosz && node scripts/deploy.mjs production --go --check; echo "exit $?"`
Expected: the usage line, `exit 1`.

Run: `cd /Users/tasty/Projects/patryksmakosz && node scripts/deploy.mjs staging 2>&1 | tail -5`
Expected: ends with `Dry run only, nothing was uploaded.`

- [ ] **Step 7: Update `CLAUDE.md`, Build & Deployment**

Add two bullets after the staging bullet:

```markdown
- Production: `https://patryksmakosz.com` on MyDevil, `www` is a pointer domain that 301s to the apex. `node scripts/deploy.mjs production --go`
- `--go --no-checks` uploads without reading the live site; `--check` reads it without building. A missing page answers 200 with the site's 404 page and `X-Robots-Tag: noindex`, because the host replaces any real 404 body with its own page
```

and replace the `netlify.toml` bullet with:

```markdown
- `netlify.toml` and the Netlify site stay until the zone leaves Netlify DNS: re-attaching the domain there is the rollback
```

- [ ] **Step 8: Commit**

```bash
cd /Users/tasty/Projects/patryksmakosz && git add scripts/deploy/htaccess.mjs scripts/deploy/test/htaccess.test.js scripts/deploy.mjs CLAUDE.md && git commit -m "Prepare the deploy for the production domain

- Redirect www to the apex and send HSTS on production, as Netlify did
- Mark the 404 page noindex, since it answers 200
- Add an upload-only and a check-only mode for a cutover
- Describe the production deploy in CLAUDE.md"
```

---

### Task 3: Prove the new rules on staging

**Files:** none

**Interfaces:**
- Consumes: the task 2 commit, `STAGE_AUTH_USER` / `STAGE_AUTH_PASS` from Patrick's notes, passed inline
- Produces: proof that `<Files>` with `Header set` is honoured on this host, before production depends on it

- [ ] **Step 1: Deploy staging**

Run `node scripts/deploy.mjs staging --go` from `REPO` with the two variables set inline for that one command.
Expected: every line `ok`, including `the 404 page is noindex`, ending `Live at https://patryksmakosz.tastysites.pl`.

- [ ] **Step 2: Read the 404 header by hand**

`curl -sI` with the staging pair on `https://patryksmakosz.tastysites.pl/no-such-page-here` and on `/`.
Expected: the missing page shows `x-robots-tag: noindex` exactly; the home page shows `noindex, nofollow`. The difference proves the `<Files>` block is the one answering. If both show `noindex, nofollow` the block is not applied: stop, and switch the rule to an environment flag set by the rewrite (`RewriteRule ^ /404.html [L,E=NOTFOUND:1]` plus `Header set X-Robots-Tag "noindex" env=REDIRECT_NOTFOUND`) with its own test before going on.

---

### Task 4: Create the production vhost and upload, without touching DNS

**Files:** none

**Interfaces:**
- Consumes: `--go --no-checks` from task 2
- Produces: a complete, verified site at `212.91.26.93` for the host names `patryksmakosz.com` and `www.patryksmakosz.com`, on port 80

- [ ] **Step 1: Create the vhost and the pointer**

```bash
ssh mydevil 'devil www add patryksmakosz.com php && devil www add www.patryksmakosz.com pointer patryksmakosz.com && devil www options patryksmakosz.com gzip on; devil www list | grep patryksmakosz; ls -la ~/domains/patryksmakosz.com/public_html'
```

Expected: three `patryksmakosz` lines (staging, apex `php`, `www` `pointer`), and a docroot holding only the host's placeholder `index.html`. `sslonly` stays off until the certificate exists.

- [ ] **Step 2: Upload**

Run: `cd /Users/tasty/Projects/patryksmakosz && node scripts/deploy.mjs production --go --no-checks 2>&1 | tail -8`
Expected: ends with `Uploaded to patryksmakosz.com. Live checks skipped`.

- [ ] **Step 3: Verify against the IP over HTTP, one request at a time**

```bash
for p in / /projects /projects/aeroflux /no-such-page-here /_nuxt/gone.js; do printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' --resolve patryksmakosz.com:80:212.91.26.93 "http://patryksmakosz.com$p"; done
curl -sI --resolve patryksmakosz.com:80:212.91.26.93 http://patryksmakosz.com/no-such-page-here | grep -i x-robots
curl -sI --resolve patryksmakosz.com:80:212.91.26.93 http://patryksmakosz.com/ | grep -i -E 'x-robots|strict-transport'
curl -sI --resolve www.patryksmakosz.com:80:212.91.26.93 http://www.patryksmakosz.com/projects | grep -i -E '^HTTP|^location'
```

Expected: `200 200 200 200 404`; `x-robots-tag: noindex` on the missing page; on `/` only `strict-transport-security: max-age=31536000` and no `x-robots-tag`; `www` answers `301` with `location: https://patryksmakosz.com/projects`.

Do not go on to task 5 unless every line matches.

---

### Task 5: Repoint the web records

**Files:**
- Create: `REPO/docs/cutover/2026-10-13-netlify-zone-after.json`

**Interfaces:**
- Consumes: the snapshot from task 1, the verified vhost from task 4
- Produces: apex and `www` A records to `212.91.26.93`, TTL 300; the four mail records untouched

- [ ] **Step 1: Try to add the A records next to the managed ones**

```bash
netlify api createDnsRecord --data '{"zone_id":"68a67413aeb0b649da74684e","body":{"type":"A","hostname":"patryksmakosz.com","value":"212.91.26.93","ttl":300}}'
```

If it is accepted, do the same for `www.patryksmakosz.com`, then delete the two managed records (step 2's delete commands). If it is refused as a conflict, go to step 2.

- [ ] **Step 2: Swap each name in one command, so no name is ever empty for longer than a second**

```bash
netlify api deleteDnsRecord --data '{"zone_id":"68a67413aeb0b649da74684e","dns_record_id":"68a674ef6b17a00008e0a065"}' && netlify api createDnsRecord --data '{"zone_id":"68a67413aeb0b649da74684e","body":{"type":"A","hostname":"patryksmakosz.com","value":"212.91.26.93","ttl":300}}'
netlify api deleteDnsRecord --data '{"zone_id":"68a67413aeb0b649da74684e","dns_record_id":"68a674f06b17a00008e0a066"}' && netlify api createDnsRecord --data '{"zone_id":"68a67413aeb0b649da74684e","body":{"type":"A","hostname":"www.patryksmakosz.com","value":"212.91.26.93","ttl":300}}'
```

**Fallback, only if Netlify refuses to delete a managed record:** follow the spec's order. Detach the domain (`netlify api updateSite --data '{"site_id":"29665319-cd86-4b60-92f1-17135d099d74","body":{"custom_domain":""}}'`), re-read the zone to see the two managed records are gone, then run the two `createDnsRecord` commands. Known cost: resolvers holding Netlify's old answer reach a Netlify that no longer serves the domain, for up to an hour. Skip step 5 below in that case, it is already done.

- [ ] **Step 3: Read the authoritative servers**

```bash
for ns in dns1 dns2 dns3 dns4; do for h in patryksmakosz.com www.patryksmakosz.com; do printf '%s %s ' "$ns" "$h"; dig +short @$ns.p07.nsone.net $h A | tr '\n' ' '; echo; done; done
```

Expected: `212.91.26.93` and nothing else, eight times. Poll every 20 s until so; do not redo the edit. Then go straight to task 6 step 1 (the certificate) and come back for step 4.

- [ ] **Step 4: Compare the zone with the snapshot**

```bash
cd /Users/tasty/Projects/patryksmakosz && netlify api getDnsRecords --data '{"zone_id":"68a67413aeb0b649da74684e"}' > docs/cutover/2026-10-13-netlify-zone-after.json && python3 - <<'EOF'
import json
key = lambda r: (r["type"], r["hostname"], r["value"], r["ttl"])
before = json.load(open("docs/cutover/2026-10-13-netlify-zone-before.json"))
after = json.load(open("docs/cutover/2026-10-13-netlify-zone-after.json"))
mail_before = sorted(key(r) for r in before if r["type"] in ("MX", "TXT"))
mail_after = sorted(key(r) for r in after if r["type"] in ("MX", "TXT"))
print("mail records identical:", mail_before == mail_after, len(mail_after))
for r in after:
    if r["type"] not in ("MX", "TXT"): print(r["type"], r["hostname"], r["value"], r["ttl"])
EOF
```

Expected: `mail records identical: True 4`, then exactly two `A` lines to `212.91.26.93`. Anything else: restore the missing record from the snapshot with `createDnsRecord` before doing anything more.

- [ ] **Step 5: Detach the domain from the Netlify site, one hour after step 2**

Only after 3600 s have passed since the swap, so no resolver still holds Netlify's address:

```bash
netlify api updateSite --data '{"site_id":"29665319-cd86-4b60-92f1-17135d099d74","body":{"custom_domain":""}}' | python3 -c "import json,sys; s=json.load(sys.stdin); print(s.get('custom_domain'), s.get('url'))"
```

Expected: `None` (or empty) and the `netlify.app` URL. Then run step 4 again: the mail records must still be identical and the two A records still there.

- [ ] **Rollback (do not run unless the cutover is abandoned)**

Delete the two A records (`deleteDnsRecord` with their new ids from the after-file), then re-attach: `netlify api updateSite --data '{"site_id":"29665319-cd86-4b60-92f1-17135d099d74","body":{"custom_domain":"patryksmakosz.com"}}'` and read the zone until the two `NETLIFY` records are back.

---

### Task 6: Certificates, HTTPS and the script's own live checks

**Files:** none

**Interfaces:**
- Consumes: authoritative A records from task 5 step 3, `--check` from task 2

- [ ] **Step 1: Issue both certificates the moment the authoritative servers answer**

```bash
ssh mydevil 'devil ssl www add 212.91.26.93 le le patryksmakosz.com; devil ssl www add 212.91.26.93 le le www.patryksmakosz.com; devil ssl www list | grep patryksmakosz'
```

Expected: three certificate lines (staging, apex, `www`), Let's Encrypt on. If one fails on validation, wait 60 s and run that one command again; no more than three tries.

- [ ] **Step 2: Read the certificates off the IP**

```bash
for h in patryksmakosz.com www.patryksmakosz.com; do echo | openssl s_client -connect 212.91.26.93:443 -servername $h 2>/dev/null | openssl x509 -noout -subject -issuer -enddate; done
```

Expected: `subject=CN=patryksmakosz.com` and `subject=CN=www.patryksmakosz.com`, issuer Let's Encrypt, an end date about 90 days out.

- [ ] **Step 3: Force HTTPS**

```bash
ssh mydevil 'devil www options patryksmakosz.com sslonly on; devil www options www.patryksmakosz.com sslonly on'
curl -sI --resolve patryksmakosz.com:80:212.91.26.93 http://patryksmakosz.com/projects | grep -i -E '^HTTP|^location'
```

Expected: `301` to `https://patryksmakosz.com/projects`. If the pointer refuses the option, that is fine: check `http://www.patryksmakosz.com/projects` still ends at the apex over HTTPS.

- [ ] **Step 4: Check over HTTPS against the IP, without waiting for any cache**

```bash
for p in / /projects /projects/aeroflux /no-such-page-here /_nuxt/gone.js; do printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' --resolve patryksmakosz.com:443:212.91.26.93 "https://patryksmakosz.com$p"; done
curl -sI --resolve www.patryksmakosz.com:443:212.91.26.93 https://www.patryksmakosz.com/projects | grep -i -E '^HTTP|^location'
```

Expected: `200 200 200 200 404`, and `www` a `301` to `https://patryksmakosz.com/projects`. No certificate error (curl would exit 60).

- [ ] **Step 5: Go back and do task 5 step 4**

- [ ] **Step 6: Run the script's live checks once this Mac resolves the new address**

Gate: `dig +short patryksmakosz.com A` and `dig +short www.patryksmakosz.com A` both answer `212.91.26.93` and nothing else. Until then the checks would read Netlify. The old TTL was 3600 s, so this can take up to an hour; poll once a minute.

Run: `cd /Users/tasty/Projects/patryksmakosz && node scripts/deploy.mjs production --check`
Expected: every line `ok`, including `home is indexable`, `home sends HSTS`, `www.patryksmakosz.com redirects to the main domain`, `the 404 page is noindex`; ends `Live at https://patryksmakosz.com`.

- [ ] **Step 7: Look at it in a real browser**

With chrome-devtools: open `https://patryksmakosz.com/`, `/projects` and one of the new-clip projects. Expected: no failed requests in the network list, no mp4 requested from `patryksmakosz.com` (they come from the R2 host), no console errors that staging did not have, a video plays.

---

### Task 7: One mail in, one mail out

**Files:** none

**Interfaces:**
- Consumes: the finished DNS state from task 5

- [ ] **Step 1: The public mail records, read from the authoritative server**

```bash
dig +short @dns1.p07.nsone.net patryksmakosz.com MX; dig +short @dns1.p07.nsone.net patryksmakosz.com TXT; dig +short @dns1.p07.nsone.net _dmarc.patryksmakosz.com TXT; dig +short @dns1.p07.nsone.net devil._domainkey.patryksmakosz.com TXT | cut -c1-40
```

Expected: `1 mail18.mydevil.net.`, the one SPF string ending `-all`, `v=DMARC1; p=none; adkim=r; aspf=r`, and a string starting `"v=DKIM1; k=rsa; p=`.

- [ ] **Step 2: Mail in**

From Gmail in Chrome (Claude in Chrome, the logged-in `patryksmakosz1@gmail.com`), send a mail to `me@patryksmakosz.com`, subject `cutover in 2026-10-13`. Then:

```bash
ssh mydevil 'grep -rl "cutover in 2026-10-13" ~/mail/me@patryksmakosz.com 2>/dev/null | head -3'
```

Expected: at least one file within two minutes. If Gmail has already fetched and removed it, finding it in the Gmail inbox addressed to `me@` counts instead.

- [ ] **Step 3: Mail out**

Open `https://www.mail-tester.com` in the same browser, copy the throwaway address, send a mail to it from Gmail with the From set to `me@patryksmakosz.com` and a real sentence as the body, then read the result page.
Expected: SPF pass, DKIM pass, DMARC pass, sent through `mydevil.net`, score as on 2026-10-09 (10/10; a point lost to content is not a DNS fault).

---

### Task 8: PageSpeed after, record it, push

**Files:**
- Modify: `REPO/docs/cutover/2026-10-13-pagespeed.md`
- Modify: `REPO/docs/superpowers/specs/2026-10-13-mydevil-migration-design.md` (status line)

**Interfaces:**
- Consumes: the "before" table from task 1

- [ ] **Step 1: Measure**

Same tool, same two URLs, same two strategies, three runs each, MCP cache cleared between runs. Add a `## After (MyDevil)` table and a `## Difference` paragraph that says in plain words what moved and what did not. Field data (CrUX) does not change for 28 days: say so and do not compare it.

- [ ] **Step 2: Mark the spec**

Change its status line to `Status: phases 0 to 4 done on 2026-10-13, phase 5 not started`.

- [ ] **Step 3: Commit and push**

```bash
cd /Users/tasty/Projects/patryksmakosz && git ls-remote origin main && git add docs/cutover/2026-10-13-netlify-zone-after.json docs/cutover/2026-10-13-pagespeed.md docs/superpowers/specs/2026-10-13-mydevil-migration-design.md && git commit -m "Record the cutover to MyDevil

- Add the zone as it stands after the web records moved
- Add PageSpeed after the move, next to the Netlify baseline
- Mark phases 0 to 4 done in the spec" && git push origin main
```

Expected: `ls-remote` shows the commit this branch started from or one of this plan's; the push is a fast-forward.

- [ ] **Step 4: Patrick's notes**

In `/Users/tasty/Projects/patryklocalmind`: bring `wiki/entities/portfolio-site.md` to the new state (production on MyDevil, how to deploy, what the cutover taught, the phase 5 start prompt in place of the phase 4 one), fix any other page that still says the site is on Netlify (`grep -rn -i netlify wiki/entities wiki/concepts`), note in `wiki/concepts/mail-authentication.md` that the zone now also holds the two A records and that mail was re-proven on this date, run `mind-index`, append one log entry to the file `mind-index --current-log` names, commit those files by path.
