this was working flawlessly

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";

// Build grid content directly from the mapping (single source of truth)
const gridProjects = computed(() =>
  Object.entries(projectMetaByImage).map(([filename, meta]) => ({
    slug: meta.slug,
    title: meta.title,
    src: `/assets/medias/${filename}`,
    alt: meta.title || meta.slug,
  }))
);

// Map thumbnails to project slugs and titles for routing and UX
// Keep this minimal; source of truth will be Content collection
const projectMetaByImage = {
  "ax-thumb.svg": { slug: "artistx", title: "Artist X" },
  "zaksa-thumb.svg": { slug: "zaksa", title: "Zaksa" },
  "arttech-thumb.svg": { slug: "arttech", title: "ArtTech" },
  "inforca-thumb.svg": { slug: "inforca", title: "Inforca" },
  "spectrum-thumb.svg": { slug: "spectrum", title: "Spectrum" },
  "working-jobs-vyne-thumb.svg": {
    slug: "working-jobs-vyne",
    title: "Working Jobs Vyne",
  },
  // Special case: this item uses an SVG name as identifier in data
  "lbc-thumb.svg": {
    slug: "life-balance-congress",
    title: "Life Balance Congress",
  },
  "molkidesign-thumb.svg": { slug: "molkidesign", title: "Molki Design" },
  "pushups-thumb.svg": { slug: "pushups-tracker", title: "Pushups Tracker" },
  "riverscape-thumb.svg": { slug: "riverscape", title: "Riverscape" },
  "sliwka-thumb.svg": { slug: "sliwka-w-kompot", title: "Sliwka w Kompot" },
  "vibeuu-thumb.svg": { slug: "vibeuu", title: "Vibeuu" },
  "page404-thumb.svg": { slug: "page-404", title: "Page 404" },
  "fort-privacy-thumb.svg": { slug: "fort-privacy", title: "Fort Privacy" },
  "prototype-thumb.svg": {
    slug: "player-prototype",
    title: "Player Prototype",
  },
};

// Vue refs for DOM elements
const containerRef = ref(null);
const contentRef = ref(null);

// Get GSAP and Observer from Nuxt app
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

/**
 * Initialize the infinite grid animation system
 */
const initInfiniteGrid = () => {
  // Validate GSAP and Observer availability
  if (!$gsap || !$Observer) {
    console.error("GSAP or Observer not available from Nuxt");
    return;
  }

  const container = containerRef.value;
  if (!container) {
    console.error("Container ref not found");
    return;
  }

  const content = contentRef.value;
  if (!content) {
    console.error("Content ref not found");
    return;
  }

  const contentWidth = content.clientWidth;
  const contentHeight = content.clientHeight;

  // Calculate wrapping boundaries for seamless infinite scrolling
  const wrapX = $gsap.utils.wrap(-contentWidth, 0);
  const wrapY = $gsap.utils.wrap(-contentHeight, 0);

  // Create smooth animation functions
  const xTo = $gsap.quickTo(container, "x", {
    duration: 1.5,
    ease: "power4",
    modifiers: {
      x: $gsap.utils.unitize(wrapX),
    },
  });

  const yTo = $gsap.quickTo(container, "y", {
    duration: 1.5,
    ease: "power4",
    modifiers: {
      y: $gsap.utils.unitize(wrapY),
    },
  });

  // Track movement increments
  let incrX = 0;
  let incrY = 0;

  // Create observer for wheel, touch, and pointer events
  $Observer.create({
    target: window,
    type: "wheel,touch,pointer",
    onChangeX: (self) => {
      // Different sensitivity for wheel vs drag
      if (self.event.type === "wheel") {
        incrX -= self.deltaX;
      } else {
        incrX += self.deltaX * 2;
      }
      xTo(incrX);
    },
    onChangeY: (self) => {
      // Different sensitivity for wheel vs drag
      if (self.event.type === "wheel") {
        incrY -= self.deltaY;
      } else {
        incrY += self.deltaY * 2;
      }
      yTo(incrY);
    },
  });
};

// Initialize on mount
onMounted(() => {
  nextTick(() => {
    initInfiniteGrid();
  });
});
</script>
<template>
  <section class="infinite-drag-grid">
    <div ref="containerRef" class="infinite-drag-grid__container">
      <div ref="contentRef" class="infinite-drag-grid__content">
        <NuxtLink
          v-for="(project, index) in gridProjects"
          :key="`original-${index}`"
          class="infinite-drag-grid__media"
          :to="`/projects/${project.slug}`"
          :aria-label="`Open project: ${project.title}`"
        >
          <img :src="project.src" :alt="project.alt" />
        </NuxtLink>
      </div>

      <!-- Duplicate content for seamless infinite scrolling -->
      <div
        v-for="duplicateIndex in 3"
        :key="`duplicate-${duplicateIndex}`"
        class="infinite-drag-grid__content"
        aria-hidden="true"
      >
        <NuxtLink
          v-for="(project, index) in gridProjects"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="infinite-drag-grid__media"
          :to="`/projects/${project.slug}`"
          :aria-label="`Open project: ${project.title}`"
          tabindex="-1"
        >
          <img :src="project.src" :alt="project.alt" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style lang="scss"></style>
