---
title: "Blog Boilerplate: All Features in One Post"
slug: "blog-boilerplate"
date: "2025-09-09"
tags: [nuxt, content, vue, gsap, examples]
excerpt: "A living example showcasing core content features used in this blog: front‑matter, headings, lists, code blocks, images, tables, embeds, and Vue components."
cover: "/og.jpg"
author: "Patryk Smakosz"
---

This is a canonical example post for the blog. It demonstrates the common capabilities we use with `@nuxt/content` in this project.

- Use it as a reference when writing new posts
- Copy sections you need and remove the rest
- Keep front‑matter tidy and valid per `content.config.ts`

> Tip: Titles and slugs must be unique. Dates should be ISO format `YYYY-MM-DD`.

## Front‑Matter Reference

We keep a minimal, validated schema for blog posts:

```yaml
# content/blog/<your-file>.md
---
title: "Your Title"
slug: "your-slug"
date: "2025-01-01"     # optional
tags: [nuxt, content]   # optional
excerpt: "Short summary"# optional
cover: "/og.jpg"       # optional
author: "Your Name"     # optional
---
```

## Headings, Text, Links

Use standard Markdown:

- This sentence contains **bold** text, *italic* text, and `inline code`
- Internal link to the blog index: [/blog](/blog)
- External link to Nuxt Content docs: [Nuxt Content](https://content.nuxt.com)

### Blockquote

> Motion brings context to state changes and guides attention.

## Lists

### Unordered

- Keep paragraphs short
- Prefer simple language
- One idea per sentence

### Ordered

1. Outline your idea
2. Show code or visuals
3. Summarize with a takeaway

## Code Blocks

```js
// JavaScript example: simple easing function wrapper
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}
```

```css
/* CSS example: hardware-accelerated properties */
.card {
  will-change: transform, opacity;
  transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 300ms ease-out;
}
```

```vue
<!-- Vue example: tiny component snippet -->
<script setup>
const props = defineProps({ label: { type: String, default: 'Hello' } })
</script>

<template>
  <button class="px-4 py-2 rounded bg-black text-white">{{ props.label }}</button>
</template>
```

## Images

You can use regular Markdown images or `<NuxtImg />` for optimized delivery.

Markdown image with caption using HTML figure:

![OG cover](/og.jpg "Open Graph cover")

<figure>
  <NuxtImg src="/assets/web-optimized-jpgs/caseRiverscape.jpg" alt="Riverscape sample" width="1200" height="675" />
  <figcaption>Sample optimized image served with Nuxt Image</figcaption>
</figure>

## Tables

| Feature | Use case | Notes |
|---|---|---|
| Headings | Structure | Use `##` and `###` |
| Lists | Steps, bullets | Keep concise |
| Code | Snippets | Add language tag |

## Details / Summary

<details>
  <summary>Click to expand notes</summary>
  <p>Keep posts focused. Extract repeated logic into composables or components.</p>
</details>

## Icons

Inline icons work anywhere thanks to global components:

<Icon name="tabler:sparkles" class="inline-block align-[-2px] w-5 h-5" /> Shiny!

## ScrollSmoother Demo

Below are simple blocks with ScrollSmoother data attributes so you can verify the performance hints and motion. Try scrolling this page.

<div class="p-4 my-6 rounded-lg bg-gray-100 border border-gray-200" data-speed="0.6" data-lag="0.2">
  <strong>Speed 0.6 · Lag 0.2</strong> — Smooth, subtle parallax
  <div class="mt-2 text-sm text-gray-600">Uses transform-based motion; promoted layer</div>
  </div>

<div class="p-4 my-6 rounded-lg bg-blue-50 border border-blue-200" data-speed="1.2" data-lag="0.4">
  <strong>Speed 1.2 · Lag 0.4</strong> — Faster with noticeable lag
  <div class="mt-2 text-sm text-blue-700/80">Great for accent blocks; avoid overuse</div>
</div>

## Embedding Local Components (MDC)

You can mount local Vue components directly inside markdown using MDC containers.
Below we embed `ProjectZaksa` with simple props. Adjust to your needs or swap with other components from `app/components`.

:::ProjectZaksa
---
autoPlay: true
---
:::

You can also use standard component syntax inline if preferred:

<ProjectZaksa :autoPlay="false" />

## Accessibility Reminders

- Always include `alt` text for images
- Use semantic headings in order
- Ensure interactive elements are keyboard accessible

## Fin

That’s it. Duplicate this file, rename it, change front‑matter and content, and publish. Keep it clear, small, and useful.
