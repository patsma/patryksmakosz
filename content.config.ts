import { defineContentConfig, defineCollection, z } from "@nuxt/content";

// The four categories the filter tabs on /projects are built from.
// A category outside this list matches no tab, so the project disappears from
// every filtered view while still showing under "All" - which is exactly what
// happened to wepushbuttons ("animation") until 2026-08-03.
//
// NOTE: this enum does NOT enforce anything at build time. Verified 2026-08-03 on
// @nuxt/content 3.6.3 - a build with an invalid category exits 0 and writes the bad
// value straight into the content database. It is here for types and documentation.
// The real guard is scripts/check-project-categories.js, wired into `npm run build`.
export const PROJECT_CATEGORIES = [
  "banner",
  "website",
  "custom-animation",
  "logo-animation",
] as const;

// Define content collections to organize and validate content.
// Docs: https://content.nuxt.com/docs/collections/define
export default defineContentConfig({
  collections: {
    // Projects collection: all markdown files in content/projects
    projects: defineCollection({
      type: "page",
      source: {
        include: "projects/*.md",
        prefix: "/projects",
      },
      // Minimal schema for consistent metadata across projects
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        category: z.enum(PROJECT_CATEGORIES).optional(),
        cover: z.string().optional(),
        preview: z.string().optional(),
        video: z.string().optional(),
        liveLink: z.string().optional(),
        liveLinkLabel: z.string().optional(),
        ctaLabel: z.string().optional(),
        components: z.array(z.string()).optional(),
        summary: z.string().optional(),
      }),
    }),
    // Blog collection: simple blog posts in content/blog
    blog: defineCollection({
      type: "page",
      source: {
        include: "blog/*.md",
        prefix: "/blog",
      },
      // Lightweight schema for a basic blog
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        date: z.string().optional(), // ISO date string
        tags: z.array(z.string()).optional(),
        excerpt: z.string().optional(),
        cover: z.string().optional(),
        author: z.string().optional(),
      }),
    }),
  },
});
