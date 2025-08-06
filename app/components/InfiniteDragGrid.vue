<script setup>
import { ref, onMounted, nextTick } from "vue";
import { projects, getProjectRoute } from "~/data/projects.js";

// Use first 15 projects for clean, simple grid (5×3 layout)
const portfolioProjects = ref(projects.slice(0, 15));

// Simple loading state for each image - using reactive object instead of Map
const imageLoadingStates = ref({});

// Vue refs for DOM elements
const containerRef = ref(null);
const contentRef = ref(null);

// Get GSAP and Observer from Nuxt app
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

/**
 * Handle image load event - fade out spinner when loaded
 * @param {Event} event - Image load event
 * @param {Object} project - Project object
 * @param {string} uniqueKey - Unique key for this specific image instance
 */
const handleImageLoad = (event, project, uniqueKey) => {
  console.log(`🔄 Image load event fired for: ${project.name} (${uniqueKey})`);
  imageLoadingStates.value[uniqueKey] = true;
  console.log(`✅ Set loaded state for: ${uniqueKey}`);
};

/**
 * Handle image error event - also hide spinner on error
 */
const handleImageError = (event, project, uniqueKey) => {
  console.log(`❌ Image error for: ${project.name} (${uniqueKey})`);
  imageLoadingStates.value[uniqueKey] = true; // Hide spinner even on error
};

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
 * Clean and simple approach with smooth GSAP animations
 */
const initInfiniteGrid = () => {
  // Validate GSAP and Observer availability
  if (!$gsap || !$Observer) {
    console.error("GSAP or Observer not available from Nuxt");
    return;
  }

  // Use Vue refs instead of document.querySelector
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

    // Debug: Log all expected image keys
    setTimeout(() => {
      const expectedKeys = [];

      // Original grid keys
      for (let i = 0; i < portfolioProjects.value.length; i++) {
        expectedKeys.push(`original-${i}`);
      }

      // Duplicate grid keys
      for (let dupIndex = 1; dupIndex <= 3; dupIndex++) {
        for (let i = 0; i < portfolioProjects.value.length; i++) {
          expectedKeys.push(`duplicate-${dupIndex}-${i}`);
        }
      }

      console.log(
        `🔑 Expected image keys (${expectedKeys.length} total):`,
        expectedKeys
      );
      console.log(
        `📊 Current loading states:`,
        Object.keys(imageLoadingStates.value)
      );

      // Fallback: Hide any remaining spinners after 5 seconds
      setTimeout(() => {
        expectedKeys.forEach((key) => {
          if (!imageLoadingStates.value[key]) {
            console.log(`⏰ Timeout fallback: hiding spinner for ${key}`);
            imageLoadingStates.value[key] = true;
          }
        });
      }, 1000);
    }, 500);
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
            <img
              :src="project.src"
              :alt="project.alt"
              class="project-image"
              @load="handleImageLoad($event, project, `original-${index}`)"
              @error="handleImageError($event, project, `original-${index}`)"
            />
            <!-- Simple loading spinner with fade-out -->
            <div
              class="loading-spinner"
              :class="{
                'fade-out': imageLoadingStates[`original-${index}`],
              }"
              :data-debug="`original-${index}: ${
                imageLoadingStates[`original-${index}`]
              }`"
            >
              <div class="spinner"></div>
            </div>
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
            <img
              :src="project.src"
              :alt="project.alt"
              class="project-image"
              @load="
                handleImageLoad(
                  $event,
                  project,
                  `duplicate-${duplicateIndex}-${index}`
                )
              "
              @error="
                handleImageError(
                  $event,
                  project,
                  `duplicate-${duplicateIndex}-${index}`
                )
              "
            />
            <!-- Simple loading spinner with fade-out -->
            <div
              class="loading-spinner"
              :class="{
                'fade-out':
                  imageLoadingStates[`duplicate-${duplicateIndex}-${index}`],
              }"
            >
              <div class="spinner"></div>
            </div>
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
  overflow: hidden;
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
    }

    .project-image {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      pointer-events: none; // Prevent image interference with click
    }

    // Simple black loading spinner with fade-out
    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      opacity: 1;
      transition: opacity 0.3s ease; // Smooth fade-out transition

      .spinner {
        width: 24px;
        height: 24px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-top: 2px solid #000;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      // Hide spinner when image is loaded
      &.fade-out {
        opacity: 0;
        pointer-events: none;
      }
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
