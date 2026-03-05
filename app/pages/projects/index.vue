<script setup>
// Projects index with Vue CSS transitions
const route = useRoute();
const category = computed(() => route.query.category || "");

// Get all projects
const { data: allProjects } = await useAsyncData("all-projects", async () => {
  const result = await queryCollection("projects").all();
  return result?.sort((a, b) => a.title?.localeCompare(b.title)) || [];
});

// Filtered projects - reactive
const projects = computed(() => {
  if (!allProjects.value) return [];

  if (category.value) {
    return allProjects.value.filter(
      (item) => item.category === String(category.value)
    );
  }

  return allProjects.value;
});

/**
 * Dynamic counts for filters
 * Creates simple counters for all items and each category.
 * Uses defensive defaults so template can render during initial load.
 * @type {import('vue').ComputedRef<{ all: number, 'logo-animation': number, website: number, 'custom-animation': number }>}
 */
const counts = computed(() => {
  const items = allProjects.value || [];
  return {
    all: items.length,
    "logo-animation": items.filter((i) => i.category === "logo-animation")
      .length,
    website: items.filter((i) => i.category === "website").length,
    "custom-animation": items.filter((i) => i.category === "custom-animation")
      .length,
  };
});

useHead({ title: "Projects" });
</script>

<template>
  <section class="projects-page pt-header">
    <div class="projects-container">
      <div class="mb-8">
        <h1 class="projects-title">Projects</h1>

        <!-- Filter Navigation -->
        <div class="filter-nav flex flex-wrap gap-4 justify-center">
          <NuxtLink
            class="filter-button group"
            to="/projects"
            :class="{ 'filter-button--active': !category }"
          >
            <Icon name="mdi:view-grid" class="w-5 h-5" />
            <span>All</span>
            <span class="filter-count">({{ counts.all }})</span>
          </NuxtLink>

          <NuxtLink
            class="filter-button group"
            :to="{ path: '/projects', query: { category: 'logo-animation' } }"
            :class="{ 'filter-button--active': category === 'logo-animation' }"
          >
            <Icon name="mdi:animation" class="w-5 h-5" />
            <span>Logo Animations</span>
            <span class="filter-count">({{ counts["logo-animation"] }})</span>
          </NuxtLink>

          <NuxtLink
            class="filter-button group"
            :to="{ path: '/projects', query: { category: 'website' } }"
            :class="{ 'filter-button--active': category === 'website' }"
          >
            <Icon name="mdi:web" class="w-5 h-5" />
            <span>Websites</span>
            <span class="filter-count">({{ counts.website }})</span>
          </NuxtLink>

          <NuxtLink
            class="filter-button group"
            :to="{ path: '/projects', query: { category: 'custom-animation' } }"
            :class="{
              'filter-button--active': category === 'custom-animation',
            }"
          >
            <Icon name="mdi:palette" class="w-5 h-5" />
            <span>Custom Animations</span>
            <span class="filter-count">({{ counts["custom-animation"] }})</span>
          </NuxtLink>
        </div>
      </div>

      <div v-if="!projects?.length" class="py-16 text-center">
        <p>No projects found.</p>
      </div>

      <TransitionGroup name="list" tag="ul" class="projects-grid">
        <li v-for="p in projects" :key="p.path || p.slug" class="project-card">
          <NuxtLink
            :to="p.path || `/projects/${p.slug}`"
            class="project-card__link"
          >
            <div class="project-card__header">
              <span class="project-card__category">
                <Icon
                  :name="
                    p.category === 'logo-animation'
                      ? 'mdi:animation'
                      : p.category === 'website'
                        ? 'mdi:web'
                        : 'mdi:palette'
                  "
                  class="w-4 h-4"
                />
                {{ p.category }}
              </span>
            </div>

            <h3 class="project-card__title">{{ p.title }}</h3>

            <p v-if="p.summary" class="project-card__summary">
              {{ p.summary }}
            </p>

            <div class="project-card__footer">
              <span class="project-card__cta">
                View Project
                <Icon name="mdi:arrow-right" class="w-4 h-4" />
              </span>
            </div>
          </NuxtLink>
        </li>
      </TransitionGroup>
    </div>
  </section>
</template>
