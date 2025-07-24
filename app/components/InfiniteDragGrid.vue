<template>
  <section class="infinite-drag-grid">
    <div ref="containerRef" class="container">
      <!-- Main content grid -->
      <div class="content">
        <div
          v-for="(item, index) in gridItems"
          :key="`main-${index}`"
          class="media"
        >
          <img :src="item.src" :alt="item.alt" />
        </div>
      </div>

      <!-- Duplicate content grids for seamless infinite scroll -->
      <div
        v-for="duplicateIndex in 3"
        :key="`duplicate-${duplicateIndex}`"
        class="content"
        aria-hidden="true"
      >
        <div
          v-for="(item, index) in gridItems"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="media"
        >
          <img :src="item.src" :alt="item.alt" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * InfiniteDragGrid Component
 *
 * Creates an infinite drag grid with smooth animations using GSAP Observer.
 * The grid allows users to drag and scroll infinitely in all directions.
 *
 * Features:
 * - Infinite horizontal and vertical scrolling
 * - Smooth GSAP animations with power4 easing
 * - Touch, mouse, and wheel support
 * - Responsive grid layout
 * - Accessibility considerations
 */

import { ref, onMounted, onUnmounted, nextTick } from "vue";

// Get GSAP and Observer from Nuxt app - same as MorphingLogo.vue
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

// Props for customization
const props = defineProps({
  /**
   * Array of grid items with image data
   * @type {Array<{src: string, alt: string}>}
   */
  items: {
    type: Array,
    default: () => [],
  },
  /**
   * Animation duration in seconds
   * @type {number}
   */
  duration: {
    type: Number,
    default: 1.5,
  },
  /**
   * Grid gap in viewport width units
   * @type {number}
   */
  gap: {
    type: Number,
    default: 10,
  },
});

// Template refs
const containerRef = ref(null);

// Reactive state
let xTo = null;
let yTo = null;
let incrX = 0;
let incrY = 0;
let observer = null;

// Default grid items with placeholder images using placehold.co
const gridItems = ref(
  props.items.length > 0
    ? props.items
    : [
        {
          src: "https://placehold.co/400x400/6366f1/ffffff?text=1",
          alt: "Grid item 1",
        },
        {
          src: "https://placehold.co/350x500/8b5cf6/ffffff?text=2",
          alt: "Grid item 2",
        },
        {
          src: "https://placehold.co/450x300/ec4899/ffffff?text=3",
          alt: "Grid item 3",
        },
        {
          src: "https://placehold.co/300x400/f59e0b/ffffff?text=4",
          alt: "Grid item 4",
        },
        {
          src: "https://placehold.co/500x350/10b981/ffffff?text=5",
          alt: "Grid item 5",
        },
        {
          src: "https://placehold.co/400x600/06b6d4/ffffff?text=6",
          alt: "Grid item 6",
        },
        {
          src: "https://placehold.co/350x350/3b82f6/ffffff?text=7",
          alt: "Grid item 7",
        },
        {
          src: "https://placehold.co/600x400/ef4444/ffffff?text=8",
          alt: "Grid item 8",
        },
        {
          src: "https://placehold.co/300x500/84cc16/ffffff?text=9",
          alt: "Grid item 9",
        },
        {
          src: "https://placehold.co/450x450/f97316/ffffff?text=10",
          alt: "Grid item 10",
        },
        {
          src: "https://placehold.co/400x300/a855f7/ffffff?text=11",
          alt: "Grid item 11",
        },
        {
          src: "https://placehold.co/350x400/14b8a6/ffffff?text=12",
          alt: "Grid item 12",
        },
        {
          src: "https://placehold.co/500x500/f43f5e/ffffff?text=13",
          alt: "Grid item 13",
        },
        {
          src: "https://placehold.co/400x350/22c55e/ffffff?text=14",
          alt: "Grid item 14",
        },
        {
          src: "https://placehold.co/300x600/0ea5e9/ffffff?text=15",
          alt: "Grid item 15",
        },
      ]
);

/**
 * Initialize GSAP animations and Observer
 * Sets up the infinite scroll functionality with smooth animations
 */
const initializeAnimations = () => {
  if (!containerRef.value) return;

  const container = containerRef.value;

  // Calculate half dimensions for wrapping
  const halfX = container.clientWidth / 2;
  const halfY = container.clientHeight / 2;

  // Create wrapping functions for infinite scroll
  const wrapX = $gsap.utils.wrap(-halfX, 0);
  const wrapY = $gsap.utils.wrap(-halfY, 0);

  // Create quickTo animations for smooth movement
  xTo = $gsap.quickTo(container, "x", {
    duration: props.duration,
    ease: "power4",
    modifiers: {
      x: $gsap.utils.unitize(wrapX),
    },
  });

  yTo = $gsap.quickTo(container, "y", {
    duration: props.duration,
    ease: "power4",
    modifiers: {
      y: $gsap.utils.unitize(wrapY),
    },
  });
};

/**
 * Initialize GSAP Observer for handling user interactions
 * Handles wheel, touch, and pointer events for infinite scrolling
 */
const initializeObserver = () => {
  if (!$Observer) {
    console.warn("GSAP Observer not available");
    return;
  }

  // Create observer for handling user interactions
  observer = $Observer.create({
    target: window,
    type: "wheel,touch,pointer", // Handle wheel, touch, and drag events
    onChangeX: (self) => {
      // Handle horizontal movement
      if (self.event.type === "wheel") {
        incrX -= self.deltaX;
      } else {
        incrX += self.deltaX * 2;
      }

      // Animate to new position
      if (xTo) xTo(incrX);
    },
    onChangeY: (self) => {
      // Handle vertical movement
      if (self.event.type === "wheel") {
        incrY -= self.deltaY;
      } else {
        incrY += self.deltaY * 2;
      }

      // Animate to new position
      if (yTo) yTo(incrY);
    },
  });
};

/**
 * Clean up animations and observer on component unmount
 * Prevents memory leaks and ensures proper cleanup
 */
const cleanup = () => {
  if (observer) {
    observer.kill();
    observer = null;
  }

  if (xTo) {
    xTo.kill();
    xTo = null;
  }

  if (yTo) {
    yTo.kill();
    yTo = null;
  }
};

// Lifecycle hooks
onMounted(() => {
  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    initializeAnimations();
    initializeObserver();
  });
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
/* Infinite Drag Grid Styles */
.infinite-drag-grid {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
  background: #121212;
  color: #f1f1f1;
}

/* Container with grid layout */
.infinite-drag-grid .container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 items per row */
  width: max-content;
  will-change: transform; /* Optimize for frequent transformations */
}

/* Content grid for items */
.infinite-drag-grid .content {
  pointer-events: none;
  display: grid;
  width: max-content;
  grid-template-columns: repeat(5, 1fr); /* 5 items per row */
  gap: v-bind('gap + "vw"');
  padding: calc(v-bind("gap") / 2 + "vw"); /* Half gap around division */
}

/* Individual media item */
.infinite-drag-grid .media {
  width: 25vw;
  aspect-ratio: 1;
  user-select: none;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

/* Media item hover effect */
.infinite-drag-grid .media:hover {
  transform: scale(1.05);
}

/* Image styling */
.infinite-drag-grid .media img,
.infinite-drag-grid .media video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .infinite-drag-grid .content {
    grid-template-columns: repeat(3, 1fr); /* 3 items per row on mobile */
    gap: 8vw;
    padding: 4vw;
  }

  .infinite-drag-grid .media {
    width: 30vw;
  }
}

@media (max-width: 480px) {
  .infinite-drag-grid .content {
    grid-template-columns: repeat(2, 1fr); /* 2 items per row on small mobile */
    gap: 6vw;
    padding: 3vw;
  }

  .infinite-drag-grid .media {
    width: 35vw;
  }
}
</style>
