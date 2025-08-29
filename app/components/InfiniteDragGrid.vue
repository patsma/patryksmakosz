<script setup>
import { ref, onMounted, nextTick } from "vue";
import { projects, getProjectRoute } from "~/data/projects.js";

// Use first 15 projects for clean, simple grid (5×3 layout)
const portfolioProjects = ref(projects.slice(0, 15));

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
  // console.log(`Portfolio project clicked:`, project);

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
 * Clean and simple approach with smooth GSAP animations
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
        <div
          v-for="(project, index) in portfolioProjects"
          :key="`original-${index}`"
          class="infinite-drag-grid__media"
          @click="handleProjectClick(project)"
        >
          <div class="image-container">
            <!-- Spinner behind image -->
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <!-- Image covers spinner when loaded -->
            <img :src="project.src" :alt="project.alt" class="project-image" />
          </div>
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
          v-for="(project, index) in portfolioProjects"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="infinite-drag-grid__media"
          @click="handleProjectClick(project)"
        >
          <div class="image-container">
            <!-- Spinner behind image -->
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <!-- Image covers spinner when loaded -->
            <img :src="project.src" :alt="project.alt" class="project-image" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
// Global styles (not scoped) - prevent browser back navigation on horizontal scroll
body {
  overscroll-behavior-x: none;
  // overflow: hidden;
}
</style>

<style lang="scss" scoped>
.infinite-drag-grid {
  height: 100vh;
  width: 100%;
  overflow: hidden;

  &__container {
    display: grid;
    grid-template-columns: repeat(
      2,
      1fr
    ); // 2 items per row for infinite wrapping
    width: max-content;
    will-change: transform; // Optimize for frequent transformations
  }

  &__content {
    display: grid;
    width: max-content;
    grid-template-columns: repeat(5, 1fr); // 5 items per row
    gap: 10vw;
    padding: 5vw; // Half gap around the division for seamless wrapping
  }

  &__media {
    width: 25vw;
    aspect-ratio: 1;
    user-select: none;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05); // Subtle zoom effect on hover
    }

    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      background: transparent; // Let spinner show through
    }

    // Simple black loading spinner - always behind image
    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1; // Behind image

      .spinner {
        width: 24px;
        height: 24px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-top: 2px solid #000;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    .project-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      pointer-events: none; // Prevent image interference with click
      z-index: 2; // Above spinner
      background: white; // Cover spinner when loaded
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

// Spinner animation
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
