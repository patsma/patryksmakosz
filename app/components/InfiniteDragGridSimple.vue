this was working flawlessly

<script setup>
import { ref, onMounted, nextTick } from "vue";

// Portfolio data - centralized and maintainable
const portfolioImages = ref([
  {
    name: "12.png",
    src: "/assets/medias/ax-thumb.svg",
    alt: "Portfolio Project 12",
  },
  {
    name: "02.png",
    src: "/assets/medias/zaksa-thumb.svg",
    alt: "Portfolio Project 02",
  },
  {
    name: "03.png",
    src: "/assets/medias/arttech-thumb.svg",
    alt: "Portfolio Project 03",
  },
  {
    name: "04.png",
    src: "/assets/medias/inforca-thumb.svg",
    alt: "Portfolio Project 04",
  },
  {
    name: "05.png",
    src: "/assets/medias/spectrum-thumb.svg",
    alt: "Portfolio Project 05",
  },
  {
    name: "06.png",
    src: "/assets/medias/working-jobs-vyne-thumb.svg",
    alt: "Portfolio Project 06",
  },
  {
    name: "lbc-thumb.svg",
    src: "/assets/medias/lbc-thumb.svg",
    alt: "LBC Animated Logo",
  },
  {
    name: "08.png",
    src: "/assets/medias/molkidesign-thumb.svg",
    alt: "Portfolio Project 08",
  },
  {
    name: "09.png",
    src: "/assets/medias/pushups-thumb.svg",
    alt: "Portfolio Project 09",
  },
  {
    name: "10.png",
    src: "/assets/medias/riverscape-thumb.svg",
    alt: "Portfolio Project 10",
  },
  {
    name: "11.png",
    src: "/assets/medias/sliwka-thumb.svg",
    alt: "Portfolio Project 11",
  },
  { name: "01.png", src: "/assets/medias/01.png", alt: "Portfolio Project 01" },
  { name: "13.png", src: "/assets/medias/13.png", alt: "Portfolio Project 13" },
  { name: "14.png", src: "/assets/medias/14.png", alt: "Portfolio Project 14" },
  { name: "15.png", src: "/assets/medias/15.png", alt: "Portfolio Project 15" },
]);

// Project names mapping for better UX
const projectNames = {
  "01.png": "Project Alpha",
  "02.png": "Project Beta",
  "03.png": "Project Gamma",
  "04.png": "Project Delta",
  "05.png": "Project Epsilon",
  "06.png": "Project Zeta",
  "07.png": "Project Eta",
  "08.png": "Project Theta",
  "09.png": "Project Iota",
  "10.png": "Project Kappa",
  "11.png": "Project Lambda",
  "12.png": "Project Mu",
  "13.png": "Project Nu",
  "14.png": "Project Xi",
  "15.png": "Project Omicron",
};

// Vue refs for DOM elements
const containerRef = ref(null);
const contentRef = ref(null);

// Get GSAP and Observer from Nuxt app
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

/**
 * Handle image clicks for portfolio navigation
 * @param {string} imageName - The name of the clicked image
 */
const handleImageClick = (imageName) => {
  console.log(`Portfolio item clicked: ${imageName}`);

  const projectName = projectNames[imageName] || `Project ${imageName}`;

  // TODO: Replace with actual portfolio navigation logic
  // Examples:
  // - navigateTo(`/portfolio/${imageName}`)
  // - openModal(projectName)
  // - window.open(`https://your-portfolio.com/${imageName}`)

  alert(
    `🎨 ${projectName}\n\nThis is where you'd navigate to your portfolio project!\n\nImage: ${imageName}`
  );
};

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
        <div
          v-for="(image, index) in portfolioImages"
          :key="`original-${index}`"
          class="infinite-drag-grid__media"
          @click="handleImageClick(image.name)"
        >
          <img :src="image.src" :alt="image.alt" />
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
          v-for="(image, index) in portfolioImages"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="infinite-drag-grid__media"
          @click="handleImageClick(image.name)"
        >
          <img :src="image.src" :alt="image.alt" />
        </div>
      </div>
    </div>
  </section>
</template>

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

    img,
    video {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      pointer-events: none; // Prevent image interference with click
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
