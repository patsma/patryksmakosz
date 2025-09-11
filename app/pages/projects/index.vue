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

useHead({ title: "Projects" });
</script>

<template>
  <section class="min-h-screen w-full pt-header">
    <div class="projects-container">
      <div class="mb-8">
        <h1 class="projects-title">Projects</h1>

        <!-- Filter Navigation -->
        <div class="flex flex-wrap gap-4 justify-center mb-8">
          <NuxtLink
            class="filter-button group"
            to="/projects"
            :class="{ 'filter-button--active': !category }"
          >
            <Icon name="mdi:view-grid" class="w-5 h-5" />
            <span>All</span>
            <span class="filter-count">(15)</span>
          </NuxtLink>

          <NuxtLink
            class="filter-button group"
            :to="{ path: '/projects', query: { category: 'logo-animation' } }"
            :class="{ 'filter-button--active': category === 'logo-animation' }"
          >
            <Icon name="mdi:animation" class="w-5 h-5" />
            <span>Logo Animations</span>
            <span class="filter-count">(7)</span>
          </NuxtLink>

          <NuxtLink
            class="filter-button group"
            :to="{ path: '/projects', query: { category: 'website' } }"
            :class="{ 'filter-button--active': category === 'website' }"
          >
            <Icon name="mdi:web" class="w-5 h-5" />
            <span>Websites</span>
            <span class="filter-count">(6)</span>
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
            <span class="filter-count">(2)</span>
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

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

/* Projects container */
.projects-container {
  @include padding;
}

/* Projects title */
.projects-title {
  @include mobile-h1;
  @include text-gradient-1;
  text-align: center;
  margin-bottom: space(8);

  @include tablet {
    @include h1;
  }
}

/* Projects grid */
.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: space(8);

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: space(10);
  }

  @include laptop {
    grid-template-columns: repeat(3, 1fr);
    gap: space(12);
  }

  @include desktop {
    gap: space(14);
  }
}

/* Simple fade transitions */
.list-enter-active,
.list-leave-active {
  transition: opacity 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-move {
  transition: transform 0.3s ease;
}

/* Filter buttons */
.filter-button {
  display: flex;
  align-items: center;
  gap: space(2);
  padding: space(3) space(4);
  background: rgba($gray-1, 0.5);
  border: $border-1 solid rgba($gray-3, 0.3);
  border-radius: $radius-lg;
  color: $gray-5;
  text-decoration: none;
  transition: $transition;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background: rgba($primary-3, 0.3);
    border-color: $primary-2;
    color: $primary-1;
    transform: translateY(-2px);
  }

  &--active {
    background: $gradient-1;
    border-color: $primary-2;
    color: $white;
    font-weight: 600;
  }
}

.filter-count {
  opacity: 0.6;
  font-size: 0.75rem;
}

/* Project cards */
.project-card {
  transition: $transition;

  &:hover {
    transform: translateY(-4px);
  }
}

.project-card__link {
  display: block;
  height: 100%;
  background: $white;
  border: $border-1 solid rgba($gray-3, 0.4);
  border-radius: $radius-lg;
  padding: space(6);
  text-decoration: none;
  transition: $transition;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba($black, 0.05);

  &:hover {
    background: $white;
    // border-color: $primary-2;
    box-shadow: 0 8px 25px rgba($primary-2, 0.15);

    .project-card__cta {
      transform: translateX(space(1));
      opacity: 1;
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: space(2.25);
    background: $gradient-1;
    opacity: 0;
    transition: $transition;
  }

  &:hover::before {
    opacity: 1;
  }
}

.project-card__header {
  margin-bottom: space(4);
}

.project-card__category {
  display: inline-flex;
  align-items: center;
  gap: space(1);
  padding: space(1) space(3);
  background: rgba($primary-2, 0.1);
  border-radius: $radius-sm;
  color: $primary-2;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.project-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $primary-1;
  margin-bottom: space(3);
  line-height: 1.3;
}

.project-card__summary {
  color: $gray-5;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: space(4);
}

.project-card__footer {
  margin-top: auto;
}

.project-card__cta {
  display: inline-flex;
  align-items: center;
  gap: space(1);
  color: $primary-2;
  font-size: 0.875rem;
  font-weight: 600;
  transition: $transition;
  opacity: 0.8;
}
</style>
