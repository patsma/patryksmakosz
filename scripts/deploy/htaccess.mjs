/**
 * Pure helpers for the MyDevil deploy: the target table, the .htaccess text
 * written into the build output, and the rsync exclude list. No I/O here, so
 * all of it is covered by scripts/deploy/test.
 */

/** @typedef {{ domain: string, siteUrl: string, gated: boolean, aliases?: string[], hsts?: boolean }} Target */

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
    aliases: ["www.patryksmakosz.com"],
    hsts: true,
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
  // An alias (www) shares the docroot through a pointer domain; send it to
  // the main domain in one hop, path kept.
  const aliasRules = (target.aliases ?? []).flatMap((alias) => [
    `RewriteCond %{HTTP_HOST} ^${alias.replaceAll(".", "\\.")}$ [NC]`,
    `RewriteRule ^ ${target.siteUrl}%{REQUEST_URI} [R=301,L]`,
  ]);
  const lines = [
    "Options -Indexes",
    "",
    // Netlify answered /projects/x with no redirect. Apache would 301 to the
    // slash form, so serve the page's index.html in place instead.
    "DirectorySlash Off",
    "RewriteEngine On",
    ...aliasRules,
    "RewriteCond %{REQUEST_FILENAME} -d",
    "RewriteCond %{REQUEST_FILENAME}/index.html -f",
    "RewriteRule ^(.+[^/])$ $1/index.html [L]",
    "",
    // ErrorDocument does nothing here: nginx in front replaces any 404 body
    // with the host's own page. A missing page gets Nuxt's 404.html (status
    // 200); a missing file, anything with an extension, stays a real 404.
    "RewriteCond %{REQUEST_FILENAME} !-f",
    "RewriteCond %{REQUEST_FILENAME} !-d",
    "RewriteCond %{REQUEST_URI} !\\.[A-Za-z0-9]+$",
    "RewriteRule ^ /404.html [L]",
    "",
    // The 404 page answers 200, so it must never be indexed.
    '<Files "404.html">',
    'Header set X-Robots-Tag "noindex"',
    "</Files>",
  ];
  if (target.hsts) lines.push("", 'Header set Strict-Transport-Security "max-age=31536000"');
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

const IPX_TYPES = { webp: "image/webp", avif: "image/avif", jpeg: "image/jpeg", jpg: "image/jpeg", png: "image/png" };

/**
 * .htaccess for one folder under /_ipx/, or null when it needs none.
 *
 * Nuxt Image prerenders a converted image under its source file name, so
 * /_ipx/f_webp/logo.svg holds WebP bytes. Apache picks the type from the
 * extension and the browser then refuses to draw it. The folder name carries
 * the real format (f_webp, f_avif&q_80), so the type is forced from that.
 * @param {string} modifiers - the folder name directly under _ipx/
 * @returns {string | null}
 */
export function ipxHtaccess(modifiers) {
  const format = modifiers.match(/(?:^|[&,])f_([a-z]+)/)?.[1];
  const type = IPX_TYPES[format];
  return type ? `ForceType ${type}\n` : null;
}
