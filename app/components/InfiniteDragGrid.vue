<script setup>
import { ref, onMounted, nextTick } from "vue";

// Portfolio video data - centralized and maintainable
const portfolioVideos = ref([
  {
    name: "wepushbuttons.mp4",
    src: "/movies/web-optimized/wepushbuttons.mp4",
    alt: "We Push Buttons Portfolio",
  },
  {
    name: "usa-map.mp4",
    src: "/movies/web-optimized/usa-map.mp4",
    alt: "USA Map Animation",
  },
  {
    name: "stairs.mp4",
    src: "/movies/web-optimized/stairs.mp4",
    alt: "Stairs Animation",
  },
  {
    name: "spectrometer.mp4",
    src: "/movies/web-optimized/spectrometer.mp4",
    alt: "Spectrometer Project",
  },
  {
    name: "page404.mp4",
    src: "/movies/web-optimized/page404.mp4",
    alt: "404 Page Design",
  },
  {
    name: "laptop-isometric.mp4",
    src: "/movies/web-optimized/laptop-isometric.mp4",
    alt: "Laptop Isometric Design",
  },
  {
    name: "icon-cloud.mp4",
    src: "/movies/web-optimized/icon-cloud.mp4",
    alt: "Cloud Icon Animation",
  },
  {
    name: "icon-box.mp4",
    src: "/movies/web-optimized/icon-box.mp4",
    alt: "Box Icon Animation",
  },
  {
    name: "graph.mp4",
    src: "/movies/web-optimized/graph.mp4",
    alt: "Graph Animation",
  },
  {
    name: "icon-phone.mp4",
    src: "/movies/web-optimized/icon-phone.mp4",
    alt: "Phone Icon Animation",
  },
  {
    name: "icon-monitor.mp4",
    src: "/movies/web-optimized/icon-monitor.mp4",
    alt: "Monitor Icon Animation",
  },
  {
    name: "icon-message.mp4",
    src: "/movies/web-optimized/icon-message.mp4",
    alt: "Message Icon Animation",
  },
  {
    name: "icon-laptop.mp4",
    src: "/movies/web-optimized/icon-laptop.mp4",
    alt: "Laptop Icon Animation",
  },
  {
    name: "icon-ladder.mp4",
    src: "/movies/web-optimized/icon-ladder.mp4",
    alt: "Ladder Icon Animation",
  },
  {
    name: "icon-bars.mp4",
    src: "/movies/web-optimized/icon-bars.mp4",
    alt: "Bars Icon Animation",
  },
]);

// Project names mapping for better UX
const projectNames = {
  "wepushbuttons.mp4": "We Push Buttons",
  "usa-map.mp4": "USA Map Interactive",
  "stairs.mp4": "Stairs Animation",
  "spectrometer.mp4": "Spectrometer App",
  "page404.mp4": "404 Page Design",
  "laptop-isometric.mp4": "Laptop Showcase",
  "icon-cloud.mp4": "Cloud Services",
  "icon-box.mp4": "Box Solutions",
  "graph.mp4": "Data Visualization",
  "icon-phone.mp4": "Mobile App",
  "icon-monitor.mp4": "Desktop Platform",
  "icon-message.mp4": "Messaging System",
  "icon-laptop.mp4": "Laptop Interface",
  "icon-ladder.mp4": "Progress Tracker",
  "icon-bars.mp4": "Analytics Dashboard",
};

// Vue refs for DOM elements
const containerRef = ref(null);
const contentRef = ref(null);

// Get GSAP and Observer from Nuxt app
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

/**
 * Handle video clicks for portfolio navigation
 * @param {string} videoName - The name of the clicked video
 */
const handleVideoClick = (videoName) => {
  console.log(`Portfolio item clicked: ${videoName}`);

  const projectName = projectNames[videoName] || `Project ${videoName}`;

  // TODO: Replace with actual portfolio navigation logic
  // Examples:
  // - navigateTo(`/portfolio/${videoName}`)
  // - openModal(projectName)
  // - window.open(`https://your-portfolio.com/${videoName}`)

  alert(
    `🎥 ${projectName}\n\nThis is where you'd navigate to your portfolio project!\n\nVideo: ${videoName}`
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

  // Use Vue ref instead of document.querySelector
  const container = containerRef.value;
  if (!container) {
    console.error("Container ref not found");
    return;
  }

  // Use Vue ref instead of document.querySelector
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
          v-for="(video, index) in portfolioVideos"
          :key="`original-${index}`"
          class="infinite-drag-grid__media"
          @click="handleVideoClick(video.name)"
        >
          <video
            :src="video.src"
            :alt="video.alt"
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
          v-for="(video, index) in portfolioVideos"
          :key="`duplicate-${duplicateIndex}-${index}`"
          class="infinite-drag-grid__media"
          @click="handleVideoClick(video.name)"
        >
          <video
            :src="video.src"
            :alt="video.alt"
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

<style lang="scss" scoped>
.infinite-drag-grid {
  height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1;
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
