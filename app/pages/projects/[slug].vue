<script setup>
// Dynamic project page driven by @nuxt/content
// - Renders optional hero component or video from frontmatter
// - Renders markdown body via <ContentRenderer>
// - Provides basic error and loading states

import { ref, computed } from "vue";

const route = useRoute();
const slug = computed(() => String(route.params.slug || ""));

// Fetch project by path: /projects/:slug
const {
  data: project,
  status,
  error,
} = await useAsyncData(
  () => `project-${slug.value}`,
  () => queryContent(`/projects/${slug.value}`).findOne()
);

const pageTitle = computed(() => project.value?.title || slug.value);
const heroComponent = computed(() => project.value?.components?.[0] || null);
const heroVideo = computed(() => project.value?.video || "");

useHead({ title: `${pageTitle.value} • Projects` });
</script>

<template>
  <section class="min-h-screen w-full flex flex-col">
    <div v-if="status === 'pending'" class="p-8 text-center">Loading…</div>
    <div v-else-if="error || !project" class="p-8 text-center">
      <p class="text-lg">Project not found.</p>
      <NuxtLink to="/projects" class="underline">Back to projects</NuxtLink>
    </div>
    <div v-else>
      <!-- Hero: component wins over video if both provided -->
      <div class="w-full">
        <component v-if="heroComponent" :is="heroComponent" :autoPlay="true" />
        <video
          v-else-if="heroVideo"
          :src="heroVideo"
          class="w-full h-auto"
          autoplay
          muted
          loop
          playsinline
        />
      </div>

      <div class="container mx-auto px-6 py-10 prose prose-invert max-w-3xl">
        <h1 class="mb-4">{{ pageTitle }}</h1>
        <ContentRenderer :value="project" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Project page-specific styles can live here or in SCSS partials */
</style>
