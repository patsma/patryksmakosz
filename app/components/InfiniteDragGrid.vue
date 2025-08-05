<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { projects, getProjectRoute } from "~/data/projects.js";

// Performance optimization - lazy loading management
const loadedImages = ref(new Set()); // Track which images are loaded
const loadingImages = ref(new Set()); // Track which images are currently loading
const imageRefs = ref(new Map()); // Store image element references
let intersectionObserver = null;

// Initial load configuration for optimal web vitals
const INITIAL_LOAD_COUNT = 8; // Load first 8 GIFs immediately (above fold)
const BUFFER_COUNT = 4; // How many extra items to load ahead

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
  `🖼️  Using optimized GIFs with smart lazy loading for perfect Web Vitals`
);
console.log(
  `⚡ Performance Strategy: ${INITIAL_LOAD_COUNT} critical images, ${BUFFER_COUNT} buffer images`
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

/**
 * Initialize smart lazy loading with Intersection Observer
 * Optimized for web vitals - loads images progressively
 */
const initLazyLoading = () => {
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const img = entry.target;
        const imageId = img.dataset.imageId;
        const index = parseInt(img.dataset.index);

        if (entry.isIntersecting) {
          // Load this image if not already loaded/loading
          if (
            !loadedImages.value.has(imageId) &&
            !loadingImages.value.has(imageId)
          ) {
            loadImage(img, imageId, index);
          }

          // Preload next few images for smooth scrolling
          preloadNearbyImages(index);
        }
      });
    },
    {
      root: null, // Use viewport as root
      rootMargin: "100px", // Start loading 100px before entering viewport
      threshold: 0.1, // Trigger when 10% visible
    }
  );

  console.log("🚀 Smart lazy loading initialized for optimal web vitals");
};

/**
 * Load a single image with proper loading states
 * @param {HTMLImageElement} img - Image element
 * @param {string} imageId - Unique image identifier
 * @param {number} index - Image index for preloading logic
 */
const loadImage = (img, imageId, index) => {
  if (loadedImages.value.has(imageId) || loadingImages.value.has(imageId)) {
    return; // Already loaded or loading
  }

  loadingImages.value.add(imageId);

  // Create new image for preloading
  const preloadImg = new Image();

  preloadImg.onload = () => {
    // Image loaded successfully
    img.src = preloadImg.src;
    img.dataset.loaded = "true";
    loadedImages.value.add(imageId);
    loadingImages.value.delete(imageId);

    // Reduced logging for performance
    if (Math.random() < 0.1) {
      console.log(`✅ Loaded GIF: ${imageId}`);
    }
  };

  preloadImg.onerror = () => {
    // Handle loading error
    img.dataset.loaded = "error";
    loadingImages.value.delete(imageId);
    console.warn(`❌ Failed to load GIF: ${imageId}`);
  };

  // Start loading
  const project = staticProjects.value[index % staticProjects.value.length];
  preloadImg.src = project.src;
};

/**
 * Preload nearby images for smooth scrolling experience
 * @param {number} currentIndex - Current image index
 */
const preloadNearbyImages = (currentIndex) => {
  const totalImages = staticProjects.value.length;

  // Preload next few images
  for (let i = 1; i <= BUFFER_COUNT; i++) {
    const nextIndex = (currentIndex + i) % totalImages;
    const nextImageId = `${staticProjects.value[nextIndex].id}-${Math.floor(
      (currentIndex + i) / totalImages
    )}`;

    if (
      !loadedImages.value.has(nextImageId) &&
      !loadingImages.value.has(nextImageId)
    ) {
      // Find the image element
      const nextImg = document.querySelector(
        `img[data-image-id="${nextImageId}"]`
      );
      if (nextImg) {
        loadImage(nextImg, nextImageId, currentIndex + i);
      }
    }
  }
};

/**
 * Register an image element for lazy loading
 * @param {HTMLImageElement} img - Image element
 * @param {string} imageId - Unique image identifier
 * @param {number} index - Image index
 */
const registerImage = (img, imageId, index) => {
  if (!img || !intersectionObserver) return;

  img.dataset.imageId = imageId;
  img.dataset.index = index.toString();
  img.dataset.loaded = "false";

  imageRefs.value.set(imageId, img);

  // Load immediately if within initial count
  if (index < INITIAL_LOAD_COUNT) {
    loadImage(img, imageId, index);
  } else {
    // Observe for lazy loading
    intersectionObserver.observe(img);
  }
};

/**
 * Get placeholder data URL for loading state (prevents CLS)
 * @returns {string} Base64 placeholder image
 */
const getPlaceholder = () => {
  // 1x1 transparent placeholder to prevent layout shift
  return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
};

/**
 * Preload critical images for LCP optimization
 * Preloads the first few images that are likely above the fold
 */
const preloadCriticalImages = () => {
  console.log("🚀 Preloading critical images for optimal LCP...");

  // Preload first few images for best LCP score
  staticProjects.value
    .slice(0, INITIAL_LOAD_COUNT)
    .forEach((project, index) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = project.src;
      link.setAttribute("fetchpriority", index < 4 ? "high" : "auto");
      document.head.appendChild(link);

      if (index < 2) {
        console.log(`📸 High-priority preload: ${project.name}`);
      }
    });
};

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
      // Minimal debug logging for performance
      if (debugCounter % 50 === 0) {
        console.log(`🎮 Movement: ${self.event.type}, X: ${incrX}`);
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
      // Minimal debug logging included in X handler
      yTo(incrY);
    },
  });
};

// Initialize on mount
onMounted(() => {
  // Preload critical images immediately for best LCP
  preloadCriticalImages();

  nextTick(() => {
    // Initialize lazy loading first for optimal performance
    initLazyLoading();

    // Initialize infinite grid
    initInfiniteGrid();

    // Register all image elements for lazy loading
    setTimeout(() => {
      const allImages = document.querySelectorAll(".infinite-drag-grid img");
      allImages.forEach((img, globalIndex) => {
        const projectIndex = globalIndex % staticProjects.value.length;
        const duplicateIndex = Math.floor(
          globalIndex / staticProjects.value.length
        );
        const project = staticProjects.value[projectIndex];

        if (project) {
          const imageId = `${project.id}-${duplicateIndex}`;
          registerImage(img, imageId, globalIndex);
        }
      });

      console.log(
        `🚀 Registered ${allImages.length} images for smart lazy loading`
      );
      console.log(`⚡ Performance Strategy:`);
      console.log(`  - Critical images preloaded: ${INITIAL_LOAD_COUNT}`);
      console.log(`  - Buffer images: ${BUFFER_COUNT}`);
      console.log(`  - Lazy loading threshold: 100px`);
      console.log(
        `📊 Web Vitals: Optimized for perfect LCP, CLS, and FID scores`
      );
    }, 50); // Small delay to ensure DOM is ready
  });
});

// Cleanup on unmount
onUnmounted(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }

  imageRefs.value.clear();
  loadedImages.value.clear();
  loadingImages.value.clear();

  console.log("🧹 Lazy loading manager cleaned up");
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
          <div class="image-container">
            <img
              :src="getPlaceholder()"
              :alt="project.alt"
              :data-project-id="project.id"
              :fetchpriority="index < 4 ? 'high' : 'auto'"
              class="project-image"
              decoding="async"
            />
            <div class="loading-placeholder">
              <div class="placeholder-shimmer"></div>
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
          v-for="(project, index) in staticProjects"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="infinite-drag-grid__media"
          @click="handleProjectClick(project)"
        >
          <div class="image-container">
            <img
              :src="getPlaceholder()"
              :alt="project.alt"
              :data-project-id="project.id"
              :fetchpriority="index < 4 ? 'high' : 'auto'"
              class="project-image"
              decoding="async"
            />
            <div class="loading-placeholder">
              <div class="placeholder-shimmer"></div>
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

    // Image container for lazy loading with loading states
    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 8px;
      // background: #f8f9fa; // Light background while loading
    }

    // Project image styling
    .project-image {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain; // Handle various aspect ratios properly
      pointer-events: none; // Prevent media interference with click
      opacity: 0;
      transition: opacity 0.3s ease;

      // Show image when loaded
      &[data-loaded="true"] {
        opacity: 1;
      }

      // Error state styling
      &[data-loaded="error"] {
        opacity: 0.5;
        filter: grayscale(100%);
      }
    }

    // Loading placeholder with shimmer effect
    .loading-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease;

      .placeholder-shimmer {
        width: 40px;
        height: 40px;
        border: 2px solid #ddd;
        border-top: 2px solid #999;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    // Hide placeholder when image is loaded
    .project-image[data-loaded="true"] + .loading-placeholder,
    .project-image[data-loaded="error"] + .loading-placeholder {
      opacity: 0;
      pointer-events: none;
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

// Loading animations for optimal UX and Web Vitals
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
