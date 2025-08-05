<script setup>
import { ref, onMounted, nextTick } from "vue";
import { projects, getProjectRoute } from "~/data/projects.js";

// Static 15 projects for stable infinite grid (like the original working version)
// Take first 15 projects from our data for a seamless experience
// This creates 3 rows × 5 columns = 15 items, perfect for the 2×2 container grid math
const staticProjects = ref(projects.slice(0, 15));

// Vue refs for DOM elements
const containerRef = ref(null);
const contentRef = ref(null);

// Get GSAP and Observer from Nuxt app
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

/**
 * Handle project clicks for portfolio navigation
 * @param {Object} project - The clicked project object
 */
const handleProjectClick = (project) => {
  console.log(`Portfolio project clicked:`, project);

  // Get the route path for the project
  const routePath = getProjectRoute(project.id);

  // TODO: Replace with actual navigation when routes are ready
  // navigateTo(routePath);

  // For now, show project info
  alert(
    `🎥 ${project.name}\n\n${project.description}\n\nCategory: ${project.category}\n\nFuture route: ${routePath}`
  );
};

/**
 * Initialize the infinite grid animation system
 * Based on the proper infinite grid pattern with seamless wrapping
 */
const initInfiniteGrid = () => {
  // Validate GSAP and Observer availability
  if (!$gsap || !$Observer) {
    console.error("GSAP or Observer not available from Nuxt");
    return;
  }

  // Use Vue ref instead of document.querySelector
  const container = containerRef.value;
  if (!container) {
    console.error("Container ref not found");
    return;
  }

  // Use the content dimensions for wrapping (this was already corrected for Nuxt)
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

  // Create smooth animation functions with proper modifiers
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
      // Different sensitivity and direction for wheel vs drag
      if (self.event.type === "wheel") {
        incrX -= self.deltaX; // Keep scroll direction natural
      } else {
        incrX += self.deltaX * 2; // Amplify drag movement
      }
      xTo(incrX);
    },
    onChangeY: (self) => {
      // Different sensitivity and direction for wheel vs drag
      if (self.event.type === "wheel") {
        incrY -= self.deltaY; // Keep scroll direction natural
      } else {
        incrY += self.deltaY * 2; // Amplify drag movement
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
        <div
          v-for="(project, index) in staticProjects"
          :key="`original-${index}`"
          class="infinite-drag-grid__media"
          @click="handleProjectClick(project)"
        >
          <video
            :src="project.src"
            :alt="project.alt"
            autoplay
            loop
            muted
            playsinline
          />
        </div>
      </div>

      <!-- Duplicate content for seamless infinite scrolling -->
      <div
        v-for="duplicateIndex in 3"
        :key="`duplicate-${duplicateIndex}`"
        class="infinite-drag-grid__content"
        aria-hidden="true"
      >
        <div
          v-for="(project, index) in staticProjects"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="infinite-drag-grid__media"
          @click="handleProjectClick(project)"
        >
          <video
            :src="project.src"
            :alt="project.alt"
            autoplay
            loop
            muted
            playsinline
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
// Global styles (not scoped) - prevent browser back navigation on horizontal scroll
body {
  overscroll-behavior-x: none;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.infinite-drag-grid {
  height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1;
  overflow: hidden;

  // Container: 2x2 grid exactly like the original working version
  &__container {
    display: grid;
    grid-template-columns: repeat(
      2,
      1fr
    ); // 2 items per row (4 total content divs)
    width: max-content;
    will-change: transform; // Optimize for frequent transformations
  }

  // Content: 5 columns per content division, exactly like original
  &__content {
    display: grid;
    width: max-content;
    grid-template-columns: repeat(
      5,
      1fr
    ); // 5 items per row - CRITICAL for infinite math
    gap: 10vw; // Same as original
    padding: 5vw; // Half gap around division for seamless wrapping - CRITICAL
  }

  // Media items styling
  &__media {
    width: 25vw;
    aspect-ratio: 1;
    user-select: none;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05); // Subtle zoom effect on hover
    }

    img,
    video {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain; // Handle various aspect ratios properly
      pointer-events: none; // Prevent media interference with click
    }
  }
}

// Responsive design for mobile devices
@media (max-width: 900px) {
  .infinite-drag-grid {
    &__content {
      gap: 20vw;
      padding: 10vw;
    }

    &__media {
      width: 50vw;
    }
  }
}
</style>
