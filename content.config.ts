import { defineContentConfig, defineCollection, z } from "@nuxt/content";

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
        category: z.string().optional(),
        cover: z.string().optional(),
        video: z.string().optional(),
        liveLink: z.string().optional(),
        components: z.array(z.string()).optional(),
        summary: z.string().optional(),
      }),
    }),
  },
});
