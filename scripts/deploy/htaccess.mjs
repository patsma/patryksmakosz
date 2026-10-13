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
  const lines = [
    "Options -Indexes",
    "",
    // Netlify answered /projects/x with no redirect. Apache would 301 to the
    // slash form, so serve the page's index.html in place instead.
    "DirectorySlash Off",
    "RewriteEngine On",
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
  ];
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
