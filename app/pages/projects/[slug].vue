<script setup>
import { useSwipe } from "maz-ui/composables";
import { useHintsStore } from "~/stores/hints";
import useIsMobile from "~/composables/useIsMobile";
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

// Extract optional live link from frontmatter if present
const liveLink = computed(() => project.value?.liveLink || "");

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

// Navigation hints management
const hintsStore = useHintsStore();
const showDesktopHint = ref(false);
const showMobileHint = ref(false);

// Use proper mobile detection composable
const { isMobile } = useIsMobile();

// Check if we should show navigation hints
const shouldShowNavigationHints = computed(() => {
  // Only show hints if there are multiple projects to navigate between
  return !!(prevProject.value || nextProject.value) && !!project.value;
});

onMounted(() => {
  // Initialize keyboard navigation
  window.addEventListener("keydown", handleKeydown, { passive: true });

  // Initialize swipe navigation
  startSwipe();

  // Initialize hints system
  hintsStore.loadPersistedHints();

  // Show hints after a delay if they haven't been shown before
  setTimeout(() => {
    if (shouldShowNavigationHints.value) {
      if (
        !hintsStore.hasShown("project-navigation-desktop") &&
        !isMobile.value
      ) {
        showDesktopHint.value = true;
        // Auto-hide after 4 seconds
        setTimeout(() => {
          showDesktopHint.value = false;
          hintsStore.markAsShown("project-navigation-desktop");
        }, 4000);
      }

      if (!hintsStore.hasShown("project-navigation-mobile") && isMobile.value) {
        showMobileHint.value = true;
        // Auto-hide after 4 seconds
        setTimeout(() => {
          showMobileHint.value = false;
          hintsStore.markAsShown("project-navigation-mobile");
        }, 4000);
      }
    }
  }, 2000);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  stopSwipe();
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
  <section ref="pageRef" class="project-page pt-header">
    <div v-if="status === 'pending'" class="project-page__content text-center">
      Loading…
    </div>
    <div v-else-if="error || !project" class="project-page__content">
      <div class="empty-state" role="status" aria-live="polite">
        <div class="empty-state__icon" aria-hidden="true">
          <Icon name="mdi:file-search-outline" />
        </div>
        <h2 class="empty-state__title">Project not found</h2>
        <p class="empty-state__copy">
          It may have been moved or renamed. Explore other projects or learn
          more about me.
        </p>
        <div class="empty-state__actions">
          <NuxtLink to="/projects" class="btn-standard">
            <span>Browse Projects</span>
          </NuxtLink>
          <NuxtLink to="/about" class="btn-standard-outlined">
            <span>About</span>
          </NuxtLink>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="project-page__body prose prose-invert">
        <ContentRenderer :value="project" />

        <div v-if="liveLink" class="project-container">
          <div class="flex items-center justify-center py-8">
            <NuxtLink
              :to="liveLink"
              external
              target="_blank"
              rel="noopener noreferrer"
              class="btn-standard-outlined"
              aria-label="Open live project in new tab"
            >
              <span class="inline-flex items-center justify-center gap-2">
                Live Link
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Bottom navigation: Previous / Next projects -->
        <div v-if="prevProject || nextProject" class="project-container">
          <div class="flex items-center justify-between gap-4 py-8">
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

    <!-- Desktop Navigation Hint (Arrow Keys) -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="showDesktopHint"
        class="fixed top-[70vh] left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white/80 text-xs max-w-xs pointer-events-none z-50"
      >
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <kbd class="px-2 py-1 bg-white/20 rounded text-xs">←</kbd>
            <kbd class="px-2 py-1 bg-white/20 rounded text-xs">→</kbd>
          </div>
          <span>Use arrow keys to navigate projects</span>
        </div>
      </div>
    </Transition>

    <!-- Mobile Navigation Hint (Swipe Gestures) -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="showMobileHint"
        class="fixed top-[70vh] left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white/80 text-xs max-w-xs pointer-events-none z-50"
      >
        <div class="flex items-center gap-2">
          <svg
            class="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4"
            />
          </svg>
          <span>Swipe to navigate</span>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped lang="scss">
@use "~/assets/scss/variables" as *;

/* Empty state (aligned with design tokens) */
.empty-state {
  display: grid;
  justify-items: center;
  gap: space(4);
  padding: space(24) 0;
  text-align: center;

  &__icon {
    width: 4.5rem;
    height: 4.5rem;
    color: $primary-2;
    background: rgba($primary-2, 0.08);
    border: $border-1 solid rgba($primary-2, 0.2);
    border-radius: $radius-full;
    display: grid;
    place-items: center;
    animation: pulseGlow 2s ease-in-out infinite;

    svg,
    .iconify {
      width: 2rem;
      height: 2rem;
    }
  }

  &__title {
    font-weight: 800;
    font-size: 1.5rem;
    color: $primary-1;
  }

  &__copy {
    max-width: 36rem;
    color: $gray-5;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: space(2);
    padding: 0 space(6);
  }

  &__actions {
    display: grid;
    grid-auto-flow: column;
    gap: space(4);
    align-items: center;
    justify-content: center;
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba($primary-2, 0.25);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 12px rgba($primary-2, 0);
    transform: scale(1.04);
  }
}
</style>
