<template>
  <section class="infinite-component-drag">
    <div ref="containerRef" class="infinite-component-drag__container">
      <div ref="contentRef" class="infinite-component-drag__content">
        <!-- Original set of ProjectBlueberry components -->
        <div
          v-for="index in 15"
          :key="`original-${index}`"
          class="infinite-component-drag__item"
          @click="handleComponentClick(index)"
        >
          <ProjectBlueberry
            v-if="index % 2 === 1"
            :show-dev-tools="false"
            :dev-tools-id="`blueberry-original-${index}`"
          />
          <ProjectArtTech
            v-else
            :show-dev-tools="false"
            :dev-tools-id="`arttech-original-${index}`"
          />
        </div>
      </div>

      <!-- Duplicate content for seamless infinite scrolling -->
      <div
        v-for="duplicateIndex in 3"
        :key="`duplicate-${duplicateIndex}`"
        class="infinite-component-drag__content"
        aria-hidden="true"
      >
        <div
          v-for="index in 15"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="infinite-component-drag__item"
          @click="handleComponentClick(index)"
        >
          <ProjectBlueberry
            v-if="(duplicateIndex + index) % 2 === 1"
            :show-dev-tools="false"
            :dev-tools-id="`blueberry-duplicate-${duplicateIndex}-${index}`"
          />
          <ProjectArtTech
            v-else
            :show-dev-tools="false"
            :dev-tools-id="`arttech-duplicate-${duplicateIndex}-${index}`"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

// Vue refs for DOM elements
const containerRef = ref(null);
const contentRef = ref(null);

// Get GSAP and Observer from Nuxt app
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

/**
 * Handle component clicks for interaction
 * @param {number} index - The index of the clicked component
 */
const handleComponentClick = (index) => {
  console.log(`Grid component clicked: ${index}`);
  alert(`Component #${index} — animating independently`);
};

/**
 * Initialize the infinite component drag system
 * Similar to InfiniteDragGridSimple but optimized for animated components
 */
const initInfiniteComponentDrag = () => {
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

  // console.log(`Content dimensions: ${contentWidth}x${contentHeight}`);

  // Calculate wrapping boundaries for seamless infinite scrolling
  const wrapX = $gsap.utils.wrap(-contentWidth, 0);
  const wrapY = $gsap.utils.wrap(-contentHeight, 0);

  // Create smooth animation functions with slightly faster response for components
  const xTo = $gsap.quickTo(container, "x", {
    duration: 1.2, // Slightly faster than image grid
    ease: "power3", // Smoother ease for animated content
    modifiers: {
      x: $gsap.utils.unitize(wrapX),
    },
  });

  const yTo = $gsap.quickTo(container, "y", {
    duration: 1.2, // Slightly faster than image grid
    ease: "power3", // Smoother ease for animated content
    modifiers: {
      y: $gsap.utils.unitize(wrapY),
    },
  });

  // Track movement increments
  let incrX = 0;
  let incrY = 0;

  // Create observer for wheel, touch, and pointer events
  // Slightly reduced sensitivity for better control with animated components
  $Observer.create({
    target: window,
    type: "wheel,touch,pointer",
    onChangeX: (self) => {
      // Reduced sensitivity for smoother interaction with animated components
      if (self.event.type === "wheel") {
        incrX -= self.deltaX * 0.8; // Reduced from 1.0
      } else {
        incrX += self.deltaX * 1.5; // Reduced from 2.0
      }
      xTo(incrX);
    },
    onChangeY: (self) => {
      // Reduced sensitivity for smoother interaction with animated components
      if (self.event.type === "wheel") {
        incrY -= self.deltaY * 0.8; // Reduced from 1.0
      } else {
        incrY += self.deltaY * 1.5; // Reduced from 2.0
      }
      yTo(incrY);
    },
  });

  // console.log("Infinite component drag system initialized successfully");
};

// Initialize on mount
onMounted(() => {
  nextTick(() => {
    // Small delay to ensure all ProjectBlueberry components are mounted
    setTimeout(() => {
      initInfiniteComponentDrag();
    }, 100);
  });
});
</script>

<style lang="scss" scoped>
.infinite-component-drag {
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
    gap: 8vw; // Slightly smaller gap for component grid
    padding: 4vw; // Half gap around the division for seamless wrapping
  }

  &__item {
    width: 20vw; // Slightly smaller than image grid for better fit
    aspect-ratio: 1;
    user-select: none;
    cursor: pointer;
    transition: transform 0.3s ease;
    border-radius: 12px; // Rounded corners for modern look
    overflow: hidden;

    // Subtle border for visual separation
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      transform: scale(1.08); // Slightly more pronounced hover effect
      border-color: rgba(255, 255, 255, 0.3);
    }

    // Ensure the ProjectBlueberry component fills the container
    :deep(.animation-container) {
      width: 100%;
      height: 100%;
      border-radius: inherit;
    }
  }
}

// Responsive design for mobile devices
@media (max-width: 900px) {
  .infinite-component-drag {
    &__content {
      gap: 15vw;
      padding: 7.5vw;
      grid-template-columns: repeat(3, 1fr); // Fewer columns on mobile
    }

    &__item {
      width: 25vw;
    }
  }
}

// Performance optimization for animated components
@media (prefers-reduced-motion: reduce) {
  .infinite-component-drag {
    &__item {
      transition: none;

      &:hover {
        transform: none;
      }
    }
  }
}
</style>
