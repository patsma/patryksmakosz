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
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SSH_HOST,
  TARGETS,
  remoteDocroot,
  buildHtaccess,
  ASSETS_HTACCESS,
  rsyncExcludes,
  ipxHtaccess,
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
const ipxRoot = join(OUT, "_ipx");
for (const entry of existsSync(ipxRoot) ? readdirSync(ipxRoot, { withFileTypes: true }) : []) {
  const text = entry.isDirectory() ? ipxHtaccess(entry.name) : null;
  if (text) writeFileSync(join(ipxRoot, entry.name, ".htaccess"), text);
}

for (const file of ["index.html", "404.html", "projects/index.html", "_nuxt/.htaccess"]) {
  if (!existsSync(join(OUT, file))) throw new Error(`Build output is missing ${file}`);
}

/* 3. Sync. The docroot must already exist: creating a site is a deliberate act. */
const docroot = remoteDocroot(target);
run("ssh", [SSH_HOST, `test -d ${docroot}`]);

// -z: without it git quotes and escapes any non-ASCII file name, and the exclude would miss it.
const untracked = capture("git", ["ls-files", "-z", "--others", "--directory", "--", "public"]).split("\0");
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
  fetch(target.siteUrl + path, {
    redirect: "manual",
    headers: { "accept-encoding": "gzip", ...headers },
  });

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

// No trailing slash and no redirect: the form every existing link uses.
const projects = await get("/projects");
checks.push(["projects answers 200 without a redirect", projects.status === 200]);

const script = html.match(/\/_nuxt\/[^"']+\.js/)?.[0];
checks.push(["home references a script", Boolean(script)]);
if (script) {
  const asset = await get(script);
  checks.push(["script answers 200", asset.status === 200]);
  checks.push(["script is compressed", Boolean(asset.headers.get("content-encoding"))]);
  checks.push(["script is cached long", (asset.headers.get("cache-control") ?? "").includes("immutable")]);
}

// The host replaces any 404 body with its own page, so a missing page is
// rewritten to Nuxt's 404.html and answers 200. A missing file stays a 404.
// A converted image keeps its source file name, so its type has to be forced.
const converted = (existsSync(ipxRoot) ? readdirSync(ipxRoot, { withFileTypes: true }) : []).find(
  (entry) => entry.isDirectory() && ipxHtaccess(entry.name),
);
if (converted) {
  const type = ipxHtaccess(converted.name).trim().split(" ")[1];
  const folder = join(ipxRoot, converted.name);
  const image = readdirSync(folder, { recursive: true, withFileTypes: true }).find(
    (entry) => entry.isFile() && entry.name !== ".htaccess",
  );
  const path = image ? `${image.parentPath.slice(OUT.length)}/${image.name}` : null;
  const served = path ? await get(encodeURI(path)) : null;
  checks.push([`a converted image is served as ${type}`, served?.headers.get("content-type") === type]);
}

const missing = await get("/no-such-page-here");
checks.push([
  "a missing page shows the site's 404 page",
  missing.status === 200 && (await missing.text()).includes('id="__nuxt"'),
]);
const gone = await get("/_nuxt/gone.js");
checks.push(["a missing file is still a 404", gone.status === 404]);

for (const [label, ok] of checks) console.log(`${ok ? "ok  " : "FAIL"} ${label}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
console.log(`\nLive at ${target.siteUrl}`);
