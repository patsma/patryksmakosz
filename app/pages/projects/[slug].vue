<script setup>
// Dynamic project page driven by @nuxt/content
// - Renders markdown body via <ContentRenderer>
// - Provides basic error and loading states

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

// Use Nuxt Content navigation helper (stable fields: title, path)
const { data: navItems } = await useAsyncData(
  () => `projects-nav`,
  () => queryCollectionNavigation("projects").order("title", "ASC")
);

const normalizePath = (p) => String(p || "").replace(/\/+$/, "");
const currentPath = computed(() => normalizePath(`/projects/${slug.value}`));
const { data: allProjects } = await useAsyncData(
  () => `projects-all`,
  () => queryCollection("projects").all()
);
const navList = computed(() => {
  const nav = (navItems.value || []).filter(Boolean);
  if (nav.length > 1) return nav.map((i) => ({ title: i.title, path: i.path }));
  const raw = allProjects.value || [];
  return raw
    .map((p) => ({
      title: p.title || p.slug || "(untitled)",
      path: p.path || p._path,
    }))
    .filter((i) => !!i.path)
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
});
const navIndex = computed(() =>
  (navList.value || []).findIndex(
    (item) => normalizePath(item.path) === currentPath.value
  )
);
const prevProject = computed(() => {
  const list = navList.value || [];
  return navIndex.value > 0 ? list[navIndex.value - 1] : null;
});
const nextProject = computed(() => {
  const list = navList.value || [];
  return navIndex.value >= 0 && navIndex.value < list.length - 1
    ? list[navIndex.value + 1]
    : null;
});

// Inline debug object visible in UI
const debugInfo = computed(() => ({
  currentPath: currentPath.value,
  navIndex: navIndex.value,
  prev: prevProject.value
    ? { title: prevProject.value.title, path: prevProject.value.path }
    : null,
  next: nextProject.value
    ? { title: nextProject.value.title, path: nextProject.value.path }
    : null,
  navItemsCount: (navItems.value || []).length,
  navListCount: (navList.value || []).length,
  navListPaths: (navList.value || []).map((i) => i.path),
}));
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
              :to="prevProject.path"
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
              :to="nextProject.path"
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

        <!-- DEBUG PANEL (remove when fixed) -->
        <div class="project-container mt-4 text-xs text-white/70">
          <details open>
            <summary>Debug: navigation state</summary>
            <pre>{{ debugInfo }}</pre>
          </details>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Project page-specific styles can live here or in SCSS partials */
</style>
