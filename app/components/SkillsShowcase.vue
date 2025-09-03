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

import sharedSkills from "~/data/skills";

/** @type {import('vue').Ref<Skill[]>} */
const skills = ref(sharedSkills);

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
