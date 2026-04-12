#!/usr/bin/env node

/**
 * Pre-commit R2 sync: verify all local video assets exist on Cloudflare R2.
 * If any are missing, automatically upload them via wrangler before the commit proceeds.
 */

import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import https from "node:https";
import { execSync } from "node:child_process";

const R2_BASE_URL = "https://pub-c9bfd14ac21c42f2b7f26ea1ddaf0e7e.r2.dev";
const BUCKET_NAME = "tastysites-videos";
const PUBLIC_DIR = "public";
const SCAN_DIRS = [
  "public/movies/web-optimized",
  "public/movies/banners-optimized",
];

/**
 * Recursively collect all .mp4 files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectMp4Files(dir) {
  const files = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectMp4Files(fullPath));
      } else if (entry.name.endsWith(".mp4")) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist - skip
  }
  return files;
}

/**
 * Check if a file exists on R2 via HTTP HEAD request.
 * @param {string} key - The R2 object key (e.g., "movies/web-optimized/file.mp4")
 * @returns {Promise<boolean>}
 */
function checkR2Exists(key) {
  const url = `${R2_BASE_URL}/${key}`;
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", timeout: 10000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/**
 * Upload a file to R2 via wrangler.
 * @param {string} filePath - Local file path
 * @param {string} key - R2 object key
 * @returns {boolean} true if upload succeeded
 */
function uploadToR2(filePath, key) {
  const cmd = `npx wrangler r2 object put "${BUCKET_NAME}/${key}" --file "${filePath}" --content-type "video/mp4" --remote`;
  try {
    execSync(cmd, { stdio: "pipe" });
    return true;
  } catch (err) {
    console.error(`  Failed to upload ${key}: ${err.message}`);
    return false;
  }
}

async function main() {
  const localFiles = SCAN_DIRS.flatMap(collectMp4Files);

  if (localFiles.length === 0) {
    console.log("No video files found to check.");
    process.exit(0);
  }

  console.log(`Checking ${localFiles.length} video files against R2...`);

  // Check all files in parallel
  const checks = localFiles.map(async (filePath) => {
    const key = relative(PUBLIC_DIR, filePath);
    const exists = await checkR2Exists(key);
    return { filePath, key, exists };
  });

  const results = await Promise.all(checks);
  const missing = results.filter((r) => !r.exists);

  if (missing.length === 0) {
    console.log("All video files are synced with R2.");
    process.exit(0);
  }

  console.log(`\n${missing.length} file(s) missing from R2. Uploading...\n`);

  // Upload missing files sequentially (wrangler doesn't handle parallel well)
  let failed = 0;
  for (const { filePath, key } of missing) {
    console.log(`  Uploading ${key}...`);
    const ok = uploadToR2(filePath, key);
    if (!ok) failed++;
    else console.log(`  Done.`);
  }

  if (failed > 0) {
    console.error(`\n${failed} upload(s) failed. Run 'npx wrangler login' and try again.\n`);
    process.exit(1);
  }

  console.log(`\nAll ${missing.length} file(s) synced to R2. Commit proceeding.\n`);
  process.exit(0);
}

main();
