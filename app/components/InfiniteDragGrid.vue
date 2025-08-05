<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { projects, getProjectRoute } from "~/data/projects.js";

// Smart grid system - automatically calculates proportions for any multiple of 5
const ITEM_COUNT = 40; // ← Change this to test: 15, 20, 25, 30, 40, 50, 100, etc.

// Validate and calculate grid dimensions
const validateItemCount = (count) => {
  if (count % 5 !== 0) {
    console.warn(
      `Item count ${count} is not a multiple of 5. Using ${
        Math.floor(count / 5) * 5
      } instead.`
    );
    return Math.floor(count / 5) * 5;
  }
  return Math.min(count, projects.length);
};

const itemCount = validateItemCount(ITEM_COUNT);
const rowCount = itemCount / 5;

// Create projects array and grid calculations
const staticProjects = ref(projects.slice(0, itemCount));

// Keep original proportions - they're critical for infinite scroll math
// Only scale media size to fit more content on screen
const gridConfig = {
  itemCount,
  rowCount,
  // Keep original gap/padding ratio - CRITICAL for seamless wrapping
  gap: 10, // Always 10vw - don't change this
  padding: 5, // Always 5vw (half of gap) - don't change this
  // Only scale media size conservatively to fit more rows
  mediaSize: Math.max(18, 25 - (rowCount - 3) * 1), // Gradual size reduction (min 18vw)
};

console.log(
  `🚀 STARTING GRID DEBUG - Items: ${itemCount}, Rows: ${rowCount}, Media size: ${gridConfig.mediaSize}vw`
);
console.log(
  `🔍 Check browser console for detailed debug info when grid initializes...`
);

// Create CSS custom properties for dynamic styling
const gridStyles = computed(() => ({
  "--grid-gap": `${gridConfig.gap}vw`,
  "--grid-padding": `${gridConfig.padding}vw`,
  "--media-size": `${gridConfig.mediaSize}vw`,
}));

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
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // 🔍 DEBUG: Log all dimensions and CSS values
  const computedStyles = window.getComputedStyle(content);
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const expectedGapPx = (gridConfig.gap / 100) * viewportWidth;
  const expectedPaddingPx = (gridConfig.padding / 100) * viewportWidth;
  const expectedMediaPx = (gridConfig.mediaSize / 100) * viewportWidth;

  console.log(`
🔍 INFINITE GRID DEBUG:
📊 Grid Config: ${gridConfig.itemCount} items (${
    gridConfig.rowCount
  } rows × 5 cols)
📏 CSS Variables: gap=${gridConfig.gap}vw, padding=${
    gridConfig.padding
  }vw, media=${gridConfig.mediaSize}vw
🖥️  Viewport: ${viewportWidth}px × ${viewportHeight}px
💱 Expected Values: gap=${expectedGapPx}px, padding=${expectedPaddingPx}px, media=${expectedMediaPx}px
📐 Content Dimensions: ${contentWidth}px × ${contentHeight}px
📦 Container Dimensions: ${containerWidth}px × ${containerHeight}px
🎨 Computed Gap: ${computedStyles.gap}
🎨 Computed Padding: ${computedStyles.padding}
🎨 Media Items: ${content.children.length} items
🧮 Expected Content Width: ~${
    expectedMediaPx * 5 + expectedGapPx * 4 + expectedPaddingPx * 2
  }px
  `);

  // Calculate wrapping boundaries for seamless infinite scrolling
  const wrapX = $gsap.utils.wrap(-contentWidth, 0);
  const wrapY = $gsap.utils.wrap(-contentHeight, 0);

  console.log(
    `🔄 GSAP Wrapping: X(-${contentWidth}px to 0px), Y(-${contentHeight}px to 0px)`
  );

  // 🔍 DEBUG: Check grid structure
  console.log(`
🏗️  GRID STRUCTURE DEBUG:
📂 Container children: ${container.children.length} (should be 4 content divs)
📂 First content div children: ${
    container.children[0]?.children.length || 0
  } (should be ${gridConfig.itemCount})
📂 All content divs have same items: ${Array.from(container.children)
    .map((div) => div.children.length)
    .join(", ")}
  `);

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
  let debugCounter = 0;

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
      // Debug every 10th movement to avoid spam
      if (debugCounter % 10 === 0) {
        console.log(
          `🎮 X Movement: ${self.event.type}, deltaX: ${self.deltaX}, incrX: ${incrX}`
        );
      }
      debugCounter++;
      xTo(incrX);
    },
    onChangeY: (self) => {
      // Different sensitivity and direction for wheel vs drag
      if (self.event.type === "wheel") {
        incrY -= self.deltaY; // Keep scroll direction natural
      } else {
        incrY += self.deltaY * 2; // Amplify drag movement
      }
      // Debug every 10th movement to avoid spam
      if (debugCounter % 10 === 0) {
        console.log(
          `🎮 Y Movement: ${self.event.type}, deltaY: ${self.deltaY}, incrY: ${incrY}`
        );
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
  <section class="infinite-drag-grid" :style="gridStyles">
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

  // Content: 5 columns per content division, dynamically scaled
  &__content {
    display: grid;
    width: max-content;
    grid-template-columns: repeat(
      5,
      1fr
    ); // 5 items per row - CRITICAL for infinite math
    gap: var(--grid-gap, 10vw); // Dynamic gap based on row count
    padding: var(--grid-padding, 5vw); // Dynamic padding for seamless wrapping
  }

  // Media items styling - dynamically scaled
  &__media {
    width: var(--media-size, 25vw); // Dynamic size based on row count
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

// Responsive design for mobile devices - also uses dynamic scaling
@media (max-width: 900px) {
  .infinite-drag-grid {
    &__content {
      gap: 20vw; // Keep 2:1 ratio - always 20vw for mobile
      padding: 10vw; // Keep 2:1 ratio - always 10vw for mobile
    }

    &__media {
      width: calc(
        var(--media-size, 25vw) * 2
      ); // Only scale media size dynamically
    }
  }
}
</style>
