---
title: "Nuxt 4 + Content: Basics"
slug: "nuxt4-content-basics"
date: "2025-01-20"
tags: [nuxt, content, basics]
excerpt: "A tiny primer on using collections and rendering markdown in Nuxt 4."
author: "Patryk Smakosz"
---

`@nuxt/content` gives us a file-based CMS with MD/MDX, search, and powerful query APIs.

### Collections

Define collections in `content.config.ts` with a small schema. It keeps our front‑matter consistent.

### Rendering

Use `<ContentRenderer :value="doc" />` to render markdown. Keep pages minimal; push logic to composables.


