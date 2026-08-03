#!/usr/bin/env node

/**
 * Guard against the silent category typo.
 *
 * The category filter tabs on /projects are hardcoded strings. A project whose
 * `category` frontmatter is not one of them matches no tab, so it vanishes from
 * every filtered view while still showing under "All" - no error, nothing in the
 * console, nothing in the build log.
 *
 * That is not hypothetical: wepushbuttons.md sat on category "animation" and was
 * invisible in all four tabs until 2026-08-03.
 *
 * The zod enum in content.config.ts does NOT catch this. Verified 2026-08-03 on
 * @nuxt/content 3.6.3: a build with an invalid category exits 0 and writes the bad
 * value straight into .data/content/contents.sqlite. The enum is there for types
 * and documentation only. This script is the actual guard.
 *
 * Checks both directions:
 *   1. every project's category is a known category
 *   2. every known category still has a filter button in the projects page
 *
 * Runs from `npm run build`, so a bad category fails the Netlify deploy instead of
 * quietly hiding a project.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECTS_DIR = "content/projects";
const PAGE_FILE = "app/pages/projects/index.vue";

/** The four categories the filter tabs are built from. */
const KNOWN_CATEGORIES = [
  "banner",
  "website",
  "custom-animation",
  "logo-animation",
];

/**
 * Pull the `category` value out of a markdown file's frontmatter.
 * @param {string} source Raw file contents
 * @returns {string | null} The category, or null if the file declares none
 */
function readCategory(source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) return null;

  const line = frontmatter[1].match(/^category:\s*(.+)$/m);
  if (!line) return null;

  return line[1].trim().replace(/^["']|["']$/g, "");
}

const problems = [];

// 1. Every project category must be one the tabs can show.
const files = readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".md"));
const counts = Object.fromEntries(KNOWN_CATEGORIES.map((c) => [c, 0]));

for (const file of files) {
  const category = readCategory(readFileSync(join(PROJECTS_DIR, file), "utf8"));

  if (category === null) {
    problems.push(`${file} has no category, so it appears under "All" only`);
    continue;
  }

  if (!KNOWN_CATEGORIES.includes(category)) {
    problems.push(
      `${file} has category "${category}", which matches no filter tab - ` +
        `the project will be invisible in all four category views. ` +
        `Expected one of: ${KNOWN_CATEGORIES.join(", ")}`
    );
    continue;
  }

  counts[category] += 1;
}

// 2. Every known category must still have a filter button on the page.
const page = readFileSync(PAGE_FILE, "utf8");
for (const category of KNOWN_CATEGORIES) {
  if (!page.includes(`'${category}'`) && !page.includes(`"${category}"`)) {
    problems.push(
      `category "${category}" is in this script's list but has no filter button ` +
        `in ${PAGE_FILE} - the two have drifted`
    );
  }
}

if (problems.length > 0) {
  console.error("\nProject category check failed:\n");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("");
  process.exit(1);
}

const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
const breakdown = KNOWN_CATEGORIES.map((c) => `${c} ${counts[c]}`).join(", ");
console.log(
  `Project categories OK: ${files.length} projects, tabs sum to ${total} (${breakdown})`
);
