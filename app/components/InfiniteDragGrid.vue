<script setup>
import { ref, onMounted, nextTick } from "vue";
import { projects, getProjectRoute } from "~/data/projects.js";

// Use first 15 projects for clean, simple grid (5×3 layout)
const portfolioProjects = ref(projects.slice(0, 15));

console.log(`🎯 Grid Setup: ${portfolioProjects.value.length} projects loaded`);
console.log(
  `📋 Projects:`,
  portfolioProjects.value.map((p) => p.name)
);

// Smart loading configuration for optimal web vitals
const CRITICAL_LOAD_COUNT = 4; // Load first 4 images immediately (above fold)
const PRELOAD_COUNT = 8; // Total images to preload for smooth experience

// Loading state management
const loadedImages = ref(new Set());
const imageRefs = ref(new Map());

// Vue refs for DOM elements
const containerRef = ref(null);
const contentRef = ref(null);

// Get GSAP and Observer from Nuxt app
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

/**
 * Preload critical images for optimal LCP and smooth loading
 * This ensures the first few images load immediately for best web vitals
 */
const preloadCriticalImages = () => {
  console.log("🚀 Preloading critical images for optimal LCP...");

  // Preload first few images with high priority
  portfolioProjects.value.slice(0, PRELOAD_COUNT).forEach((project, index) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = project.src;
    link.setAttribute(
      "fetchpriority",
      index < CRITICAL_LOAD_COUNT ? "high" : "auto"
    );
    document.head.appendChild(link);

    if (index < CRITICAL_LOAD_COUNT) {
      console.log(`📸 High-priority preload: ${project.name} - ${project.src}`);
    }
  });
};

/**
 * Get image source - always return the real source for simplicity
 * Let the preloading and intersection observer handle the loading
 * @param {Object} project - Project object
 * @returns {string} Image source
 */
const getImageSrc = (project) => {
  return project.src;
};

/**
 * Handle image load event - just for tracking
 * @param {Event} event - Image load event
 * @param {Object} project - Project object
 */
const handleImageLoad = (event, project) => {
  loadedImages.value.add(project.id);
  console.log(`✅ Loaded: ${project.name}`);
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

  // 🔍 DEBUG: Log dimensions and grid structure
  console.log(`🔍 GRID DEBUG:`);
  console.log(`📐 Content dimensions: ${contentWidth}px × ${contentHeight}px`);
  console.log(
    `📦 Container children: ${container.children.length} (should be 4)`
  );
  console.log(`📂 Content children: ${content.children.length} (should be 15)`);
  console.log(`🖼️  Projects in array: ${portfolioProjects.value.length}`);

  // Calculate wrapping boundaries for seamless infinite scrolling
  const wrapX = $gsap.utils.wrap(-contentWidth, 0);
  const wrapY = $gsap.utils.wrap(-contentHeight, 0);

  console.log(
    `🔄 GSAP Wrapping: X(-${contentWidth}px to 0px), Y(-${contentHeight}px to 0px)`
  );

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

  console.log("🚀 Infinite grid initialized with 15 projects");
};

// Removed complex intersection observer - let browser handle loading naturally

// Initialize on mount
onMounted(() => {
  // Preload critical images immediately for best LCP
  preloadCriticalImages();

  nextTick(() => {
    initInfiniteGrid();

    // Debug: Check if all images are in the DOM
    setTimeout(() => {
      const allImages = document.querySelectorAll(".project-image");
      console.log(
        `🖼️  Total images in DOM: ${allImages.length} (should be 60 = 15×4)`
      );
      console.log(`📊 Images per grid: Original(15) + 3 duplicates = 60 total`);
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
          <img
            :src="getImageSrc(project)"
            :alt="project.alt"
            :fetchpriority="index < CRITICAL_LOAD_COUNT ? 'high' : 'auto'"
            decoding="async"
            class="project-image"
            @load="handleImageLoad($event, project)"
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
          v-for="(project, index) in portfolioProjects"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="infinite-drag-grid__media"
          @click="handleProjectClick(project)"
        >
          <img
            :src="getImageSrc(project)"
            :alt="project.alt"
            fetchpriority="auto"
            decoding="async"
            class="project-image"
            @load="handleImageLoad($event, project)"
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

    .project-image {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      pointer-events: none; // Prevent image interference with click
      opacity: 1; // Show all images immediately - let browser handle loading
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
