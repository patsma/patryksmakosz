<script setup>
import { useSwipe } from "maz-ui/composables";
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

// Keyboard navigation: ArrowLeft / ArrowRight to move between projects
const router = useRouter();

/**
 * Check if the event target is an editable element.
 * We skip keyboard navigation when user is typing or interacting with inputs.
 * @param {EventTarget|null} el
 * @returns {boolean}
 */
const isEditableTarget = (el) => {
  if (!el) return false;
  const tag = (el.tagName || "").toLowerCase();
  if (el.isContentEditable) return true;
  return tag === "input" || tag === "textarea" || tag === "select";
};

/**
 * Handle global keydown for Left/Right arrows. Navigates to prev/next project
 * when available. Ignores when modifiers are pressed or target is editable.
 * @param {KeyboardEvent} event
 */
const handleKeydown = (event) => {
  if (!event || event.defaultPrevented) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (isEditableTarget(event.target)) return;

  if (event.key === "ArrowLeft" && prevProject.value?.path) {
    router.push(prevProject.value.path);
  } else if (event.key === "ArrowRight" && nextProject.value?.path) {
    router.push(nextProject.value.path);
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});

// Swipe navigation using Maz-UI useSwipe composable
// Attach to the root section via a template ref
const pageRef = ref(null);
const { start: startSwipe, stop: stopSwipe } = useSwipe({
  element: pageRef,
  // Swipe Left: go to next project (content moves left)
  onLeft: () => {
    if (nextProject.value?.path) router.push(nextProject.value.path);
  },
  // Swipe Right: go to previous project
  onRight: () => {
    if (prevProject.value?.path) router.push(prevProject.value.path);
  },
  threshold: 56,
});

onMounted(() => {
  startSwipe();
});

onBeforeUnmount(() => {
  stopSwipe();
});

// Minimal swipe test box (per Maz-UI example) to verify swipe detection
const swipeTestRef = ref(null);
const lastSwipeDirection = ref("None");
const { start: startTestSwipe, stop: stopTestSwipe } = useSwipe({
  element: swipeTestRef,
  onLeft: () => (lastSwipeDirection.value = "Swiped left"),
  onRight: () => (lastSwipeDirection.value = "Swiped right"),
  onUp: () => (lastSwipeDirection.value = "Swiped up"),
  onDown: () => (lastSwipeDirection.value = "Swiped down"),
  threshold: 70,
});

onMounted(() => {
  startTestSwipe();
});

onBeforeUnmount(() => {
  stopTestSwipe();
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
  <section ref="pageRef" class="project-page">
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

        <!-- Swipe test box: helps verify Maz-UI useSwipe integration -->
        <div
          ref="swipeTestRef"
          class="mt-6 border border-[rgba(255,255,255,0.15)] rounded-lg h-40 flex items-center justify-center text-center text-base"
        >
          <div>
            <p>Swipe in any direction</p>
            <p class="opacity-70 text-sm">
              Last swipe direction: {{ lastSwipeDirection }}
            </p>
          </div>
        </div>

        <!-- Bottom navigation: Previous / Next projects -->
        <div v-if="prevProject || nextProject" class="project-container">
          <div
            class="flex items-center justify-between gap-4 py-8 border-t border-[rgba(255,255,255,0.08)] mt-8"
          >
            <NuxtLink
              v-if="prevProject"
              :to="prevProject.path"
              class="btn-standard-outlined"
              aria-label="Previous project"
            >
              <span class="inline-flex items-center justify-center gap-2">
                <Icon name="tabler:arrow-left" class="w-5 h-5" />
                <!-- {{ prevProject.title || "Previous" }}  -->
              </span>
            </NuxtLink>

            <div class="flex-1" />

            <NuxtLink
              v-if="nextProject"
              :to="nextProject.path"
              class="btn-standard-outlined"
              aria-label="Next project"
            >
              <span class="inline-flex items-center justify-center gap-2">
                <!-- {{ nextProject.title || "Next" }} -->
                <Icon name="tabler:arrow-right" class="w-5 h-5" />
              </span>
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
