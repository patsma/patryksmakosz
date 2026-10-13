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
