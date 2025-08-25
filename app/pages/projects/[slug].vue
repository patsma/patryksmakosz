<script setup>
// Dynamic project page driven by @nuxt/content
// - Renders markdown body via <ContentRenderer>
// - Provides basic error and loading states

import { ref, computed } from "vue";

const route = useRoute();
const slug = computed(() => String(route.params.slug || ""));

// Fetch project by path inside `projects` collection
const {
  data: project,
  status,
  error,
} = await useAsyncData(
  () => `project-${slug.value}`,
  () => queryCollection("projects").path(`/projects/${slug.value}`).first()
);

const pageTitle = computed(() => project.value?.title || slug.value);

useHead({ title: `${pageTitle.value} • Projects` });
</script>

<template>
  <section class="project-page">
    <div v-if="status === 'pending'" class="project-page__content text-center">
      Loading…
    </div>
    <div
      v-else-if="error || !project"
      class="project-page__content text-center"
    >
      <p class="text-lg">Project not found.</p>
      <NuxtLink to="/projects" class="underline">Back to projects</NuxtLink>
    </div>
    <div v-else>
      <div class="project-page__body prose prose-invert">
        <ContentRenderer :value="project" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Project page-specific styles can live here or in SCSS partials */
</style>
