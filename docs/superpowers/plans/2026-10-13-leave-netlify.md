# Leave Netlify (phase 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Status, 2026-10-13: closed.** Tasks 1 to 3 and 6 are done. Tasks 4 and 5 are dropped: the domain is registered through Netlify and stays there by decision, so the nameservers never change (see `docs/cutover/2026-10-13-phase-5-outcome.md`). In task 7, the Netlify DNS zone is never deleted; the other leftovers are still open.

**Goal:** `patryksmakosz.com` is delegated to Cloudflare DNS with the same six records it has today, mail is proven before and after, and the Netlify site and `netlify.toml` are gone.

**Architecture:** The zone is built on Cloudflare first and compared record by record with the Netlify nameservers, so both sets of nameservers give the same answers before anyone is sent to the new ones. The nameserver change at name.com is then the only moment of risk, and because the answers are identical it has no visible effect while resolvers move over. Netlify is removed last, and its DNS zone outlives the site by at least 48 hours.

**Tech Stack:** Cloudflare API through the `cloudflare-api` MCP (`execute` tool, `cloudflare.request`), the logged-in `netlify` CLI, `dig`, `gh`, `ssh mydevil`, name.com in real Chrome (Claude in Chrome), mail-tester.com.

**Spec:** `docs/superpowers/specs/2026-10-13-mydevil-migration-design.md` (phase 5)

**Repo path:** `/Users/tasty/Projects/patryksmakosz`, written below as `REPO`. Branch `main`, in sync with `origin/main` at `e867152`.

## Facts read on 2026-10-13, before writing this

- Live Netlify zone `68a67413aeb0b649da74684e` holds six records and is identical to `docs/cutover/2026-10-13-netlify-zone-after.json` (hostname, type, value, TTL, priority). Nameservers `dns1-4.p07.nsone.net`
- No wildcard, no CAA, no DNSSEC (no DS at the registry, whois says `unsigned`). Nothing to carry over beyond the six
- Registrar name.com, expiry 2027-08-21, status `clientTransferProhibited` (that blocks transfers, not nameserver edits)
- `tastysites.pl` on Cloudflare uses `chad` and `olga.ns.cloudflare.com`. Account id `7984fb51687ff3979fecdcc0a2172e6f`. A new zone in the same account normally gets the same pair, but **read the pair from the API answer, never assume it**
- The `cloudflare-api` MCP is enabled for `REPO` and disabled for `/Users/tasty/Projects/patryklocalmind`. Tasks 2 and 3 must run in a session started in `REPO`
- No Cloudflare, name.com or Netlify token is in the shell environment. name.com has no API or CLI access from this Mac: it is a browser login
- The repo is linked to Netlify site `29665319-cd86-4b60-92f1-17135d099d74`, name **`tasty-sites-2025`**, repo `patsma/patryksmakosz`, no custom domain. A second site **`tastysites-2025`** (`f9f59d4c-...`, repo `nuxt-ui-pro3`) is a different project and is NOT touched
- GitHub repo carries Netlify's webhook `559138698` and deploy key `127355915` ("Netlify Deploy Key")
- Mailbox `me@patryksmakosz.com` is `~/mail/me@patryksmakosz.com` on MyDevil. Newest message 2026-10-11 16:13, the cutover was 2026-10-13 11:57. **No mail has arrived since the cutover**, so the before-test in task 1 is required
- The Netlify account also holds DNS zones for `akademiamolki.pl`, `agatarybka.pl`, `tastysites.pl` and `thetasty.dev`. None is in scope

## Global Constraints

- The six records are copied, never retyped: values come from `docs/cutover/2026-10-13-netlify-zone-after.json`
- Every Cloudflare record is **DNS only** (`proxied: false`). TTLs as in the snapshot: 3600 for the four mail records, 300 for the two A records
- Cloudflare DNSSEC stays off. Turning it on needs a DS record at name.com and is a separate decision
- The Netlify DNS zone is not deleted in this plan. The registry NS TTL for `.com` is 172800 s, so resolvers may ask the Netlify nameservers for 48 hours after the change. Deleting the zone is a leftover in task 7, not before 2026-10-15 plus the hour of the change
- The Netlify site and `netlify.toml` go only after task 5 passes: new nameservers answering everywhere AND a real mail in and out
- The repo is PUBLIC: no credential in any file, command or commit message
- `ssh mydevil` commands are single-quoted and carry no `$`. At most 2 concurrent requests to MyDevil
- Check DNS against the authoritative server or `@1.1.1.1`, never the bare local resolver (it caches NXDOMAIN for an hour)
- Commits: imperative title, bullet list, no trailers. Stage files by path. `git ls-remote origin main` before any push
- No em or en dashes anywhere
- Rollback before task 6: set the nameservers at name.com back to `dns1.p07.nsone.net` to `dns4.p07.nsone.net`. The Netlify zone is still there and still correct. After task 6 the site cannot be restored, the zone still can

## Review Focus

Failure modes the spec does not mention, most likely first. Each is pinned by a step below.

1. **Cloudflare imports records on zone creation.** A scan can add records (or proxy the A records) that are not in the snapshot. Task 2 step 3 lists the zone and deletes anything outside the six
2. **A TXT value changed in transit.** The DKIM key is 236 characters; one lost character fails every outgoing mail silently. Task 3 compares the raw `dig` answers of both nameserver sets as text, not by eye
3. **Two SPF records.** If the import already made one and step 2 adds another, SPF is a permerror. Task 3 asserts exactly one TXT answer on the apex
4. **Mail breaks and the cause is unknown.** Without a passing test before the move, a failure after it cannot be pinned on the move. Task 1 is a hard gate for task 4
5. **The wrong Netlify site is deleted.** Two sites differ by one hyphen. Task 6 reads the id from `.netlify/state.json` and asserts name and repo before the delete call

---

### Task 1: Prove mail works before anything moves

**Files:**
- Create: `REPO/docs/cutover/2026-10-13-mail-before.md`

**Interfaces:**
- Produces: a mail-tester score and an inbound delivery time, both dated before the nameserver change. Task 5 repeats the same two tests and compares

- [ ] **Step 1: Count the messages in the mailbox**

```bash
ssh mydevil 'find ~/mail/me@patryksmakosz.com -type f -newermt "2026-10-13 00:00" | wc -l'
```

Expected: `0`.

- [ ] **Step 2: One mail IN**

Send a mail from `patryksmakosz1@gmail.com` to `me@patryksmakosz.com`, subject `dns-move before`. Try Claude in Chrome on the Gmail tab first (call `tabs_context_mcp`, then compose). The Gmail tab refused Claude on 2026-10-13 because of another extension's frame; if it refuses again, do not retry: ask Patrick to send it and continue when he says sent.

- [ ] **Step 3: Verify it landed on MyDevil**

```bash
ssh mydevil 'find ~/mail/me@patryksmakosz.com -type f -newermt "2026-10-13 00:00" | wc -l'
```

Expected: `1` or more within two minutes. If Gmail has already fetched and removed it, the count can stay `0`: then the proof is the mail showing in the Gmail inbox addressed to `me@`.

- [ ] **Step 4: One mail OUT, to mail-tester**

Open `https://www.mail-tester.com` in the browser, copy the throwaway address. Send a mail FROM `me@patryksmakosz.com` (Gmail "Send mail as") to it, subject `dns-move before`, with two real sentences in the body and the normal signature. Same Chrome-first, Patrick-second rule as step 2.

- [ ] **Step 5: Read the result**

Open the result page in a browser (curl gets a stub). Expected: SPF pass, DKIM pass (`d=patryksmakosz.com`, selector `devil`), DMARC pass. The score on 2026-10-09 was 10/10.

If any of the three fails: STOP. The fault is older than this plan. Use superpowers:systematic-debugging and do not start task 2.

- [ ] **Step 6: Record and commit**

Write `docs/cutover/2026-10-13-mail-before.md` with: time of each test, inbound proof (file count or Gmail), mail-tester URL id, score, the three verdicts.

```bash
cd /Users/tasty/Projects/patryksmakosz
git add docs/cutover/2026-10-13-mail-before.md docs/superpowers/plans/2026-10-13-leave-netlify.md
git commit -m "Prove mail before the zone moves

- Add the phase 5 plan
- Record one inbound and one mail-tester result taken on the Netlify nameservers"
```

### Task 2: Build the zone on Cloudflare

**Files:** none in the repo.

**Interfaces:**
- Consumes: `docs/cutover/2026-10-13-netlify-zone-after.json`
- Produces: `CF_ZONE_ID` and `CF_NS` (the two nameserver names from the API answer). Tasks 3 and 4 use both

Runs in a session started in `REPO` (the `cloudflare-api` MCP is off elsewhere). Load the tools with `ToolSearch` query `cloudflare-api`, check the path shapes with `search` if a call is refused.

- [ ] **Step 1: Check the zone does not exist yet**

`execute`:

```js
const r = await cloudflare.request({ method: 'GET', path: '/zones', query: { name: 'patryksmakosz.com' } });
return r.result.map(z => ({ id: z.id, status: z.status, ns: z.name_servers }));
```

Expected: `[]`. If a zone exists, do not create a second one: use its id and go to step 3.

- [ ] **Step 2: Create it**

```js
const r = await cloudflare.request({
  method: 'POST', path: '/zones',
  body: { name: 'patryksmakosz.com', type: 'full', account: { id: '7984fb51687ff3979fecdcc0a2172e6f' } }
});
return { id: r.result.id, status: r.result.status, ns: r.result.name_servers, plan: r.result.plan.name };
```

Expected: status `pending`, plan `Free Website`, two nameservers. Note the id as `CF_ZONE_ID` and the pair as `CF_NS`.

- [ ] **Step 3: List what Cloudflare put there by itself, and remove it**

```js
const r = await cloudflare.request({ method: 'GET', path: `/zones/${CF_ZONE_ID}/dns_records`, query: { per_page: 100 } });
return r.result.map(x => ({ id: x.id, type: x.type, name: x.name, content: x.content, proxied: x.proxied, ttl: x.ttl }));
```

Wait 60 seconds and list again (the scan is asynchronous). Delete every record returned, so the zone is built only from the snapshot:

```js
await cloudflare.request({ method: 'DELETE', path: `/zones/${CF_ZONE_ID}/dns_records/${id}` });
```

- [ ] **Step 4: Create the six records from the snapshot**

Read the snapshot file and pass its array in as `snap` (do not retype values):

```js
const out = [];
for (const s of snap) {
  const body = { type: s.type, name: s.hostname, ttl: s.ttl, proxied: false };
  if (s.type === 'MX') { body.content = s.value; body.priority = s.priority; }
  else if (s.type === 'TXT') { body.content = `"${s.value}"`; }
  else { body.content = s.value; }
  const r = await cloudflare.request({ method: 'POST', path: `/zones/${CF_ZONE_ID}/dns_records`, body });
  out.push({ type: r.result.type, name: r.result.name, ttl: r.result.ttl, proxied: r.result.proxied });
}
return out;
```

Expected: six rows, every `proxied` false, TTL 3600 four times and 300 twice.

- [ ] **Step 5: Confirm DNSSEC is off and count the records**

```js
const d = await cloudflare.request({ method: 'GET', path: `/zones/${CF_ZONE_ID}/dnssec` });
const r = await cloudflare.request({ method: 'GET', path: `/zones/${CF_ZONE_ID}/dns_records`, query: { per_page: 100 } });
return { dnssec: d.result.status, count: r.result.length, proxied: r.result.filter(x => x.proxied).length };
```

Expected: `dnssec` `disabled`, `count` 6, `proxied` 0.

### Task 3: Compare both nameserver sets, record by record

**Files:**
- Create: `REPO/docs/cutover/compare-zones.sh`

**Interfaces:**
- Consumes: `CF_NS` from task 2
- Produces: `compare-zones.sh <nameserver-a> <nameserver-b>`, exit 0 when every answer matches. Task 5 reuses it

- [ ] **Step 1: Write the script**

```bash
#!/bin/sh
# Compare the answers of two nameservers for every record of patryksmakosz.com.
# Usage: compare-zones.sh dns1.p07.nsone.net chad.ns.cloudflare.com
set -u
a="$1"; b="$2"; fail=0
ask() { dig +norecurse +noall +answer "$2" "$3" "@$1" | awk '{ $1=tolower($1); print }' | sort; }
for q in "patryksmakosz.com A" "www.patryksmakosz.com A" "patryksmakosz.com MX" \
         "patryksmakosz.com TXT" "devil._domainkey.patryksmakosz.com TXT" \
         "_dmarc.patryksmakosz.com TXT" "patryksmakosz.com AAAA" "patryksmakosz.com CAA" \
         "zzz-probe.patryksmakosz.com A"; do
  set -- $q
  ra=$(ask "$a" "$1" "$2"); rb=$(ask "$b" "$1" "$2")
  if [ "$ra" = "$rb" ]; then echo "same  $1 $2"; else echo "DIFF  $1 $2"; echo "  $a: $ra"; echo "  $b: $rb"; fail=1; fi
done
spf=$(dig +short TXT patryksmakosz.com "@$b" | grep -c 'v=spf1')
[ "$spf" = "1" ] || { echo "DIFF  apex carries $spf SPF records on $b, want exactly 1"; fail=1; }
exit $fail
```

The last three queries are negative checks: no AAAA, no CAA and no wildcard on either side.

- [ ] **Step 2: Prove the script can fail**

```bash
cd /Users/tasty/Projects/patryksmakosz && chmod +x docs/cutover/compare-zones.sh
docs/cutover/compare-zones.sh dns1.p07.nsone.net dns1.mydevil.net; echo "exit $?"
```

Expected: `DIFF` lines and `exit 1` (MyDevil's own copy of the zone is not the same). A script that prints `same` here is broken.

- [ ] **Step 3: Run it for real, all four Netlify servers against both Cloudflare servers**

Replace the two Cloudflare names with `CF_NS` if they differ from chad and olga.

```bash
cd /Users/tasty/Projects/patryksmakosz
for n in 1 2 3 4; do for c in chad olga; do
  docs/cutover/compare-zones.sh dns$n.p07.nsone.net $c.ns.cloudflare.com >/dev/null && echo "ok dns$n vs $c" || echo "FAIL dns$n vs $c"
done; done
docs/cutover/compare-zones.sh dns1.p07.nsone.net chad.ns.cloudflare.com
```

Expected: eight `ok` lines, then nine `same` lines. Any `DIFF`: fix the record on Cloudflare (edit in place, never add a second), wait 5 minutes, run again. Do not start task 4 with a `DIFF`.

- [ ] **Step 4: Commit**

```bash
git add docs/cutover/compare-zones.sh
git commit -m "Add a record-by-record zone comparison

- Compare every record of the domain on two nameservers and fail on any difference
- Assert a single SPF record on the apex"
```

### Task 4: Change the nameservers at name.com

**Files:** none.

**Interfaces:**
- Consumes: `CF_NS`, a passing task 1 and a passing task 3
- Produces: the time of the change, written down for task 7's 48-hour mark

This is the one step that needs a login. There is no API access.

- [ ] **Step 1: Gate**

Task 1 step 5 passed and task 3 step 3 printed eight `ok` lines in this session. If either is missing, stop.

- [ ] **Step 2: Change them in Chrome**

Claude in Chrome, real Chrome, `https://www.name.com/account/domain/details/patryksmakosz.com#dns` (Nameservers section). If the page shows a login form, ask Patrick to log in and continue; never type or ask for the password. Remove the four `dns*.p07.nsone.net` entries, add the two `CF_NS` names, save. If the site asks for an email or 2FA confirmation, Patrick does that part.

Do not touch: contact data, transfer lock, auto-renew, DNSSEC, the domain's other tabs.

- [ ] **Step 3: Read it back from the registry**

```bash
dig +norecurse +noall +authority NS patryksmakosz.com @a.gtld-servers.net
```

Expected: two lines naming `CF_NS`, within a few minutes. Note the time.

### Task 5: New nameservers answer everywhere, mail proven again

**Files:**
- Create: `REPO/docs/cutover/2026-10-13-mail-after.md`

**Interfaces:**
- Consumes: `compare-zones.sh`, `CF_ZONE_ID`
- Produces: the gate for task 6

- [ ] **Step 1: The registry and three public resolvers name Cloudflare**

```bash
for s in a.gtld-servers.net m.gtld-servers.net; do dig +norecurse +noall +authority NS patryksmakosz.com @$s | awk '{print $5}' | sort | tr '\n' ' '; echo "<- $s"; done
for r in 1.1.1.1 8.8.8.8 9.9.9.9; do dig +short NS patryksmakosz.com @$r | sort | tr '\n' ' '; echo "<- $r"; done
```

Expected: every line shows only the two `CF_NS` names. Public resolvers may show the old four for up to 48 hours; poll every 10 minutes for the first hour, do not redo the change. Both sides give the same answers meanwhile, so nothing is broken while waiting.

- [ ] **Step 2: Cloudflare marks the zone active**

```js
const r = await cloudflare.request({ method: 'GET', path: `/zones/${CF_ZONE_ID}` });
return { status: r.result.status, ns: r.result.name_servers };
```

Expected: `active`. If still `pending` after the registry answers, trigger the check: `PUT /zones/${CF_ZONE_ID}/activation_check`.

- [ ] **Step 3: Records still match, site still up**

```bash
cd /Users/tasty/Projects/patryksmakosz
docs/cutover/compare-zones.sh dns1.p07.nsone.net chad.ns.cloudflare.com
node scripts/deploy.mjs production --check
```

Expected: nine `same`, then the deploy check 13/13.

- [ ] **Step 4: Mail in and out again**

Repeat task 1 steps 2 to 5 with subject `dns-move after`. The mail-tester page must show SPF, DKIM and DMARC pass, and its DNS lookups now come from Cloudflare. Expected: the same score as before.

A failure here with a pass in task 1 is caused by the move: compare the failing record with `compare-zones.sh`, fix it on Cloudflare. Rollback is the nameserver change reversed.

- [ ] **Step 5: Record and commit**

Write `docs/cutover/2026-10-13-mail-after.md`: time of the nameserver change, the outputs of steps 1 and 2, both mail results next to the before values, `CF_ZONE_ID` and `CF_NS`.

```bash
git add docs/cutover/2026-10-13-mail-after.md
git commit -m "Record the zone move to Cloudflare

- Note the nameserver change and what the registry and public resolvers answer
- Record mail in and out after the move beside the values before it"
```

### Task 6: Delete the Netlify site and netlify.toml

**Files:**
- Delete: `REPO/netlify.toml`
- Modify: `REPO/CLAUDE.md`, `REPO/README.md` (only lines that still describe Netlify as the host)
- Modify: `REPO/docs/superpowers/specs/2026-10-13-mydevil-migration-design.md:4`

**Interfaces:**
- Consumes: task 5 fully passed

The site delete cannot be undone. Everything it held is in git; the last Netlify build is from 2026-10-09 and older than what MyDevil serves.

- [ ] **Step 1: Assert the target**

```bash
cd /Users/tasty/Projects/patryksmakosz
id=$(python3 -c "import json;print(json.load(open('.netlify/state.json'))['siteId'])")
netlify api getSite --data "{\"site_id\":\"$id\"}" | python3 -c "
import json,sys
s=json.load(sys.stdin)
print(s['id'], s['name'], s['build_settings']['repo_url'], s.get('custom_domain'))
assert s['id']=='29665319-cd86-4b60-92f1-17135d099d74'
assert s['name']=='tasty-sites-2025'
assert s['build_settings']['repo_url'].endswith('patsma/patryksmakosz')
assert not s.get('custom_domain') and not s.get('domain_aliases')
print('target ok')"
```

Expected: `target ok`. Any assertion error: stop.

- [ ] **Step 2: Check nothing links to the site's netlify.app address**

```bash
grep -rn "tasty-sites-2025" --exclude-dir=node_modules --exclude-dir=.nuxt --exclude-dir=.output --exclude-dir=dist --exclude-dir=.git --exclude-dir=docs . ; echo "exit $?"
```

Expected: no lines, `exit 1`. (Read on 2026-10-13: none.) The many `*.netlify.app` links in `content/projects/` point at other sites and stay.

- [ ] **Step 3: Delete the site**

```bash
netlify api deleteSite --data '{"site_id":"29665319-cd86-4b60-92f1-17135d099d74"}'
netlify api getSite --data '{"site_id":"29665319-cd86-4b60-92f1-17135d099d74"}' 2>&1 | head -3
curl -s -o /dev/null -w "%{http_code}\n" https://tasty-sites-2025.netlify.app
```

Expected: the second call answers Not Found, the curl prints `404`.

- [ ] **Step 4: The zone survived the site**

```bash
netlify api getDnsRecords --data '{"zone_id":"68a67413aeb0b649da74684e"}' | python3 -c "import json,sys;print(len(json.load(sys.stdin)))"
docs/cutover/compare-zones.sh dns1.p07.nsone.net chad.ns.cloudflare.com
```

Expected: `6` and nine `same`. Resolvers still on the old nameservers depend on this for 48 hours. If the zone went with the site, recreate the six records in it from the snapshot with `netlify api createDnsRecord`.

- [ ] **Step 5: Remove what Netlify left on GitHub**

```bash
gh api repos/patsma/patryksmakosz/hooks --jq '.[] | [.id,.config.url] | @tsv'
gh api repos/patsma/patryksmakosz/keys --jq '.[] | [.id,.title] | @tsv'
```

For each row that is Netlify's and still there (webhook `559138698`, key `127355915` on 2026-10-13):

```bash
gh api -X DELETE repos/patsma/patryksmakosz/hooks/559138698
gh api -X DELETE repos/patsma/patryksmakosz/keys/127355915
```

Expected after: neither list names Netlify. Delete nothing else from either list.

- [ ] **Step 6: Remove the files**

```bash
cd /Users/tasty/Projects/patryksmakosz
git rm netlify.toml
/Users/tasty/.claude/bin/trash-safe .netlify
grep -n -i netlify CLAUDE.md README.md
```

Rewrite each line the grep prints that names Netlify as host, deploy target or fallback so it says what is true now (MyDevil, `node scripts/deploy.mjs production --go`). Leave `.gitignore` as it is. Set line 4 of the spec to `Status: all phases done on 2026-10-13`.

- [ ] **Step 7: The build does not need the file**

```bash
node scripts/deploy.mjs production
node scripts/deploy.mjs production --check
```

Expected: the dry run builds and prints its rsync, the check is 13/13. No upload is needed, `netlify.toml` was never part of the output.

- [ ] **Step 8: Commit and push**

```bash
git add netlify.toml CLAUDE.md README.md docs/superpowers/specs/2026-10-13-mydevil-migration-design.md
git commit -m "Remove Netlify from the project

- Delete netlify.toml, the Netlify site is gone
- Describe MyDevil as the only host in the project docs
- Mark the migration spec done"
git ls-remote origin main
git push origin main
```

### Task 7: Write it down, then the leftovers

**Files:**
- Modify: `/Users/tasty/Projects/patryklocalmind/wiki/entities/portfolio-site.md`
- Modify: `/Users/tasty/Projects/patryklocalmind/wiki/concepts/mail-authentication.md`
- Modify: the file `mind-index --current-log` prints

- [ ] **Step 1: Update the two pages to what is true now**

`portfolio-site.md`: summary and the DNS bullet say Cloudflare, the Netlify bullet and the phase 5 start prompt go, the mail line under "Open after the cutover" goes, `verified` and `verified_via` name today's checks. `mail-authentication.md`: the `patryksmakosz.com` bullet and the state table say Cloudflare with `CF_ZONE_ID`, the Proven cell carries the new mail-tester date, `verified: 2026-10-13`. Pages say what is true now, no "used to". Then:

```bash
cd /Users/tasty/Projects/patryklocalmind && mind-index && mind-index --current-log
```

Append one log entry under 1000 characters (`## [2026-10-13] update | patryksmakosz.com zone moved to Cloudflare, Netlify site deleted`). Commit by path, `git pull --rebase` first, straight to main.

- [ ] **Step 2: Ask Patrick about each leftover, one picker**

First question "take all recommended?", each lean in the description. Per-item questions only on a no.

| Leftover | Recommended |
|---|---|
| Delete the Netlify DNS zone for the domain | Yes, but not before 48 hours after the time noted in task 4. Leave a dated question in `wiki/.questions.jsonl` |
| Raise DMARC from `p=none` to `p=quarantine` | Yes. Two passing mail-tester runs, the page already calls it ready |
| `/sentry-example-page`, `/test`, `/scroll-test`, `/200.html` published and indexable | Remove the three pages from the build, noindex `/200.html` |
| `--check` with no local build throws a stack trace | Fix, one clear message |
| The `www` redirect carries no HSTS header | Fix in the generated `.htaccess` |
| Mobile first paint about 2.3 s, after the load event | Separate session with the `web-vitals-traps` skill, it needs measuring, not a guess |

Each yes that changes code gets its own short plan or, if it changes no behaviour, a fix and a verify. None of them is done inside this plan.
