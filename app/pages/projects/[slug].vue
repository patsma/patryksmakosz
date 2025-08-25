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

// Load all projects to compute prev/next navigation (sorted by date desc, then title)
const { data: allProjects } = await useAsyncData(
  () => `projects-all`,
  () =>
    queryCollection("projects")
      .select(["_path", "title", "date", "slug"]) // keep payload light
      .sort({ date: -1 })
      .all()
);

const currentPath = computed(() => `/projects/${slug.value}`);
const navIndex = computed(() =>
  (allProjects.value || []).findIndex((p) => p._path === currentPath.value)
);
const prevProject = computed(() => {
  const list = allProjects.value || [];
  if (navIndex.value > 0) return list[navIndex.value - 1];
  return null;
});
const nextProject = computed(() => {
  const list = allProjects.value || [];
  if (navIndex.value >= 0 && navIndex.value < list.length - 1)
    return list[navIndex.value + 1];
  return null;
});
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

        <!-- Bottom navigation: Previous / Next projects -->
        <div v-if="prevProject || nextProject" class="project-container">
          <div
            class="flex items-center justify-between gap-4 py-8 border-t border-[rgba(255,255,255,0.08)] mt-8"
          >
            <NuxtLink
              v-if="prevProject"
              :to="prevProject._path"
              class="group inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              aria-label="Previous project"
            >
              <Icon name="tabler:arrow-left" class="w-5 h-5" />
              <span class="sr-only">Previous:</span>
              <span class="underline-offset-2 group-hover:underline">{{
                prevProject.title || "Previous"
              }}</span>
            </NuxtLink>

            <div class="flex-1" />

            <NuxtLink
              v-if="nextProject"
              :to="nextProject._path"
              class="group inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              aria-label="Next project"
            >
              <span class="sr-only">Next:</span>
              <span class="underline-offset-2 group-hover:underline">{{
                nextProject.title || "Next"
              }}</span>
              <Icon name="tabler:arrow-right" class="w-5 h-5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Project page-specific styles can live here or in SCSS partials */
</style>
