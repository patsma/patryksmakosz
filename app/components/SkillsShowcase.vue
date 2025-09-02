<script setup>
import { ref } from "vue";

/**
 * A single skill item for display
 * @typedef {Object} Skill
 * @property {string} id Unique identifier
 * @property {string} name Human-readable skill name
 * @property {string} icon Iconify icon name for @nuxt/icon
 * @property {string} description Short, high-signal description (≤ 8 words)
 * @property {string} highlight Visual highlight suggestion for future use
 */

/** @type {import('vue').Ref<Skill[]>} */
const skills = ref([
  {
    id: "nuxt",
    name: "Nuxt.js",
    icon: "logos:nuxt-icon",
    svg: "/assets/icons/nuxt-icon.svg",
    description: "SSR/SPA apps with routing and content",
    highlight: "Green glow ring with soft pulse",
  },
  {
    id: "vue",
    name: "Vue.js",
    icon: "logos:vue",
    svg: "/assets/icons/vue.svg",
    description: "Reactive UI components and state management",
    highlight: "Reactive pulse dots orbiting icon",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "logos:javascript",
    svg: "/assets/icons/javascript.svg",
    description: "Modern ES6+ patterns for web apps",
    highlight: "Yellow spark particles on hover",
  },
  {
    id: "gsap",
    name: "GSAP Animation",
    icon: "simple-icons:greensock",
    svg: "/assets/icons/greensock.svg",
    description: "Smooth, performant motion and timelines",
    highlight: "Subtle motion blur streak effect",
  },
  {
    id: "svg",
    name: "SVG Animation",
    icon: "mdi:svg",
    svg: "/assets/icons/svg.svg",
    description: "Vector morphs, draws, icon motion",
    highlight: "Line draw highlight around shape",
  },
  {
    id: "three",
    name: "Three.js",
    icon: "logos:threejs",
    svg: "/assets/icons/threejs.svg",
    description: "3D scenes, materials, camera controls",
    highlight: "3D tilt and parallax shadow",
  },
  {
    id: "wordpress",
    name: "WordPress",
    icon: "logos:wordpress-icon",
    svg: "/assets/icons/wordpress-icon.svg",
    description: "Custom themes, plugins, headless builds",
    highlight: "Blueprint grid overlay flicker",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    icon: "logos:tailwindcss-icon",
    svg: "/assets/icons/tailwindcss-icon.svg",
    description: "Utility-first, responsive design systems",
    highlight: "Utility tag badges animate in",
  },
  {
    id: "ecommerce",
    name: "Ecommerce Development",
    icon: "mdi:cart",
    svg: "/assets/icons/cart.svg",
    description: "WooCommerce, headless carts, checkout flows",
    highlight: "Cart bounce and shine sweep",
  },
  {
    id: "api",
    name: "API Integration",
    icon: "mdi:api",
    svg: "/assets/icons/api.svg",
    description: "REST/GraphQL data, auth, webhooks",
    highlight: "Linking nodes with flowing lines",
  },
  {
    id: "css3",
    name: "CSS3 (Grid/Flexbox)",
    icon: "logos:css-3",
    svg: "/assets/icons/css-3.svg",
    description: "Robust layouts and responsive alignments",
    highlight: "Grid overlay reveal on hover",
  },
  {
    id: "scroll",
    name: "Scroll Animations",
    icon: "mdi:gesture-swipe-vertical",
    svg: "/assets/icons/gesture-swipe-vertical.svg",
    description: "ScrollTrigger storytelling and parallax",
    highlight: "Vertical progress bar indicator",
  },
  {
    id: "canvas",
    name: "Canvas & WebGL",
    icon: "simple-icons:webgl",
    svg: "/assets/icons/webgl.svg",
    description: "High-performance graphics and effects",
    highlight: "Shader ripple or scanline pass",
  },
  {
    id: "figma",
    name: "Figma to Code",
    icon: "logos:figma",
    svg: "/assets/icons/figma.svg",
    description: "Precise handoff; pixel-perfect components",
    highlight: "Ruler and measure overlay snap",
  },
]);

// Expose data for potential parent usage/tests
defineExpose({ skills });
</script>

<template>
  <section class="py-16" aria-labelledby="skills-title" role="region">
    <div class="mx-auto max-w-6xl px-6">
      <h2 id="skills-title" class="text-3xl font-semibold tracking-tight">
        Skills
      </h2>

      <p class="mt-2 text-neutral-400 max-w-2xl">
        Curated list of core capabilities with icon, short description, and a
        future highlight suggestion for motion/visuals.
      </p>

      <div
        class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <article
          v-for="skill in skills"
          :key="skill.id"
          class="group relative rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4 backdrop-blur-sm transition-colors hover:border-neutral-700"
        >
          <div class="flex items-start gap-3">
            <div
              class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/60 ring-1 ring-inset ring-neutral-700 transition-all group-hover:ring-neutral-500"
              aria-hidden="true"
            >
              <img
                v-if="skill.svg"
                :src="skill.svg"
                :alt="skill.name + ' icon'"
                class="h-5 w-5"
                draggable="false"
              />
              <Icon v-else :name="skill.icon" class="h-5 w-5" />
              <span
                class="pointer-events-none absolute inset-0 rounded-lg opacity-0 ring-2 ring-emerald-500/50 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-medium leading-6">{{ skill.name }}</h3>
              <p class="mt-1 text-sm text-neutral-400">
                {{ skill.description }}
              </p>
            </div>
          </div>

          <div class="mt-3">
            <span
              class="inline-flex items-center gap-2 rounded-md bg-neutral-800/60 px-2 py-1 text-[11px] text-neutral-300 ring-1 ring-inset ring-neutral-700"
              :aria-label="`Highlight suggestion for ${skill.name}`"
            >
              <span
                class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
              />
              <span class="truncate">{{ skill.highlight }}</span>
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
