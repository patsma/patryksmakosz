<script setup>
// Projects index with reactive filtering and GSAP animations
// - Lists all projects with smooth transitions
// - Supports live category filtering with animations
// - Uses GSAP following project component patterns

// GSAP from Nuxt app (following ProjectZaksa/ProjectArtTech pattern)
const { $gsap } = useNuxtApp();

const route = useRoute();
const router = useRouter();
const category = computed(() => route.query.category || "");

// Reactive data that updates when category changes
const { data: allProjects } = await useAsyncData("all-projects", async () => {
  const result = await queryCollection("projects").all();
  return result?.sort((a, b) => a.title?.localeCompare(b.title)) || [];
});

// Manually controlled projects data for smooth animations
const currentCategory = ref(category.value);
const projects = computed(() => {
  if (!allProjects.value) return [];
  
  if (currentCategory.value) {
    return allProjects.value.filter((item) => item.category === String(currentCategory.value));
  }
  
  return allProjects.value;
});

// Refs for GSAP animations
const projectsContainerRef = ref(null);
const projectItemsRef = ref([]);
let gsapCtx = null;
let isAnimating = ref(false);

// Animation functions following ProjectZaksa pattern
const animateProjectsOut = () => {
  if (!projectItemsRef.value?.length) return Promise.resolve();
  
  return new Promise((resolve) => {
    $gsap.to(projectItemsRef.value, {
      duration: 0.3,
      y: -20,
      opacity: 0,
      stagger: {
        amount: 0.12,
        from: "start"
      },
      ease: "power2.in",
      onComplete: () => {
        // Clear any transforms after animation
        $gsap.set(projectItemsRef.value, { clearProps: "all" });
        resolve();
      },
    });
  });
};

const animateProjectsIn = () => {
  return new Promise((resolve) => {
    nextTick(() => {
      if (!projectItemsRef.value?.length) {
        resolve();
        return;
      }
      
      // Set initial state
      $gsap.set(projectItemsRef.value, {
        y: 20,
        opacity: 0,
        clearProps: "transform", // Clear any previous transforms
      });
      
      // Animate in with clean final state
      $gsap.to(projectItemsRef.value, {
        duration: 0.4,
        y: 0,
        opacity: 1,
        stagger: {
          amount: 0.16,
          from: "start"
        },
        ease: "power2.out",
        onComplete: () => {
          // Clear transforms when animation completes to prevent jumps
          $gsap.set(projectItemsRef.value, { clearProps: "transform" });
          resolve();
        },
      });
    });
  });
};

// Smooth transition function
const transitionToCategory = async (newCategory) => {
  if (isAnimating.value || newCategory === currentCategory.value) return;
  
  isAnimating.value = true;
  
  // Step 1: Animate out current projects
  await animateProjectsOut();
  
  // Step 2: Update the data (triggers DOM re-render)
  currentCategory.value = newCategory;
  projectItemsRef.value = []; // Clear refs for new elements
  
  // Step 3: Wait a frame for DOM update, then animate in new projects
  await nextTick();
  await animateProjectsIn();
  
  isAnimating.value = false;
};

// Watch URL changes and trigger smooth transition
watch(category, async (newCategory, oldCategory) => {
  if (newCategory !== oldCategory) {
    await transitionToCategory(newCategory);
  }
}, { immediate: false });

// Set project item refs
const setProjectItemRef = (el) => {
  if (el && !projectItemsRef.value.includes(el)) {
    projectItemsRef.value.push(el);
  }
};

// Initialize current category on mount
onMounted(() => {
  // Set initial category from URL
  currentCategory.value = category.value;
  
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      // Initial animation for projects on mount
      if (projectItemsRef.value?.length) {
        // Set initial state and animate in
        $gsap.set(projectItemsRef.value, {
          y: 25,
          opacity: 0,
          clearProps: "transform", // Start clean
        });
        
        $gsap.to(projectItemsRef.value, {
          duration: 0.5,
          y: 0,
          opacity: 1,
          stagger: {
            amount: 0.2,
            from: "start"
          },
          ease: "power2.out",
          delay: 0.1,
          onComplete: () => {
            // Clear transforms when done to prevent layout issues
            $gsap.set(projectItemsRef.value, { clearProps: "transform" });
          },
        });
      }
    }, projectsContainerRef.value);
  });
});

onUnmounted(() => {
  if (gsapCtx) gsapCtx.revert();
});

useHead({ title: "Projects" });
</script>

<template>
  <section class="min-h-screen w-full pt-12">
    <div class="container mx-auto px-6 py-10">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">Projects</h1>
        <div class="flex gap-2 flex-wrap">
          <NuxtLink 
            class="underline underline-offset-4 transition-opacity" 
            to="/projects"
            :class="{ 
              'font-semibold': !currentCategory, 
              'opacity-50 pointer-events-none': isAnimating 
            }"
            >All (15)</NuxtLink
          >
          <NuxtLink
            class="underline underline-offset-4 transition-opacity"
            :to="{ path: '/projects', query: { category: 'logo-animation' } }"
            :class="{ 
              'font-semibold': currentCategory === 'logo-animation',
              'opacity-50 pointer-events-none': isAnimating
            }"
            >Logo Animations (7)</NuxtLink
          >
          <NuxtLink
            class="underline underline-offset-4 transition-opacity"
            :to="{ path: '/projects', query: { category: 'website' } }"
            :class="{ 
              'font-semibold': currentCategory === 'website',
              'opacity-50 pointer-events-none': isAnimating
            }"
            >Websites (6)</NuxtLink
          >
          <NuxtLink
            class="underline underline-offset-4 transition-opacity"
            :to="{ path: '/projects', query: { category: 'custom-animation' } }"
            :class="{ 
              'font-semibold': currentCategory === 'custom-animation',
              'opacity-50 pointer-events-none': isAnimating
            }"
            >Custom Animations (2)</NuxtLink
          >
        </div>
      </div>

      <div v-if="!projects?.length" class="py-16 text-center">
        <p>No projects found.</p>
      </div>

      <ul ref="projectsContainerRef" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="p in projects"
          :key="p.path || p.slug"
          :ref="setProjectItemRef"
          class="border border-white/10 rounded-lg p-4 transition-transform hover:scale-[1.02]"
        >
          <NuxtLink :to="p.path || `/projects/${p.slug}`" class="block">
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
