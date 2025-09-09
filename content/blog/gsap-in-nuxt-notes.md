---
title: "GSAP in Nuxt: Notes"
slug: "gsap-in-nuxt-notes"
date: "2025-01-25"
tags: [gsap, nuxt, animation]
excerpt: "Quick notes on using GSAP with Nuxt 4 and keeping it smooth."
author: "Patryk Smakosz"
---

GSAP integrates nicely with Nuxt via `@hypernym/nuxt-gsap`. Prefer composables for complex timelines.

### Tips

- Use `onMounted` for DOM-dependent animations
- Keep components small and destroy timelines on unmount
- Prefer CSS variables for theme colors consumed by GSAP

::ProjectZaksa
---
autoPlay: true
---
::
