import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TARGETS,
  remoteDocroot,
  buildHtaccess,
  ASSETS_HTACCESS,
  rsyncExcludes,
  ipxHtaccess,
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

test("both targets turn listings off", () => {
  for (const target of Object.values(TARGETS)) {
    assert.match(buildHtaccess(target), /^Options -Indexes$/m);
  }
});

test("a page answers without a trailing slash and without a redirect", () => {
  for (const target of Object.values(TARGETS)) {
    const text = buildHtaccess(target);
    assert.match(text, /^DirectorySlash Off$/m);
    assert.match(text, /^RewriteRule \^\(\.\+\[\^\/\]\)\$ \$1\/index\.html \[L\]$/m);
  }
});

test("a missing page gets the site's 404 page, a missing file does not", () => {
  for (const target of Object.values(TARGETS)) {
    const text = buildHtaccess(target);
    assert.match(text, /^RewriteCond %\{REQUEST_URI\} !\\\.\[A-Za-z0-9\]\+\$$/m);
    assert.match(text, /^RewriteRule \^ \/404\.html \[L\]$/m);
    // ErrorDocument is replaced by the host's own page, so it must not be relied on
    assert.doesNotMatch(text, /ErrorDocument/);
  }
});

test("the page rewrite comes before the 404 rewrite", () => {
  const text = buildHtaccess(TARGETS.production);
  assert.ok(text.indexOf("$1/index.html") < text.indexOf("/404.html"));
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

test("a converted image is served as its real format, whatever its file name says", () => {
  assert.equal(ipxHtaccess("f_webp"), "ForceType image/webp\n");
  assert.equal(ipxHtaccess("f_avif&q_80"), "ForceType image/avif\n");
  assert.equal(ipxHtaccess("s_300x200,f_jpeg"), "ForceType image/jpeg\n");
  assert.equal(ipxHtaccess("f_jpg"), "ForceType image/jpeg\n");
  assert.equal(ipxHtaccess("f_png"), "ForceType image/png\n");
});

test("an image folder with no format change gets no override", () => {
  assert.equal(ipxHtaccess("s_300x200"), null);
  assert.equal(ipxHtaccess("_"), null);
  assert.equal(ipxHtaccess("fit_cover"), null);
});
