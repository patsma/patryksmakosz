<script setup>
// Simple projects index powered by @nuxt/content
// - Lists all projects
// - Supports optional category filtering via ?category=

const route = useRoute();
const category = computed(() => route.query.category || "");

const { data: projects } = await useAsyncData(
  () => `projects-${category.value || "all"}`,
  async () => {
    const q = queryCollection("projects");
    if (category.value) q.where({ category: String(category.value) });
    return q.sort({ title: 1 }).all();
  }
);

useHead({ title: "Projects" });
</script>

<template>
  <section class="min-h-screen w-full">
    <div class="container mx-auto px-6 py-10">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">Projects</h1>
        <div class="flex gap-2">
          <NuxtLink class="underline underline-offset-4" to="/projects"
            >All</NuxtLink
          >
          <!-- Example category shortcuts; extend as needed -->
          <NuxtLink
            class="underline underline-offset-4"
            :to="{ path: '/projects', query: { category: 'logo-animation' } }"
            >Logo Animations</NuxtLink
          >
        </div>
      </div>

      <div v-if="!projects?.length" class="py-16 text-center">
        <p>No projects found.</p>
      </div>

      <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="p in projects"
          :key="p._path"
          class="border border-white/10 rounded-lg p-4"
        >
          <NuxtLink :to="p._path" class="block">
            <div class="text-sm opacity-70">{{ p.category }}</div>
            <div class="text-lg font-medium">{{ p.title }}</div>
            <div v-if="p.summary" class="text-sm mt-2 opacity-80">
              {{ p.summary }}
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Keep styling minimal; rely on Tailwind */
</style>
