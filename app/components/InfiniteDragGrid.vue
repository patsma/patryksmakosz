<template>
  <section class="mwg_effect026">
    <div class="container">
      <div class="content">
        <div class="media"><img src="/assets/medias/12.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/02.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/03.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/04.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/05.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/06.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/07.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/08.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/09.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/10.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/11.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/01.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/13.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/14.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/15.png" alt="" /></div>
      </div>

      <!-- duplicates -->
      <div class="content" aria-hidden="true">
        <div class="media"><img src="/assets/medias/12.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/02.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/03.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/04.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/05.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/06.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/07.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/08.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/09.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/10.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/11.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/01.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/13.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/14.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/15.png" alt="" /></div>
      </div>
      <div class="content" aria-hidden="true">
        <div class="media"><img src="/assets/medias/12.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/02.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/03.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/04.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/05.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/06.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/07.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/08.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/09.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/10.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/11.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/01.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/13.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/14.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/15.png" alt="" /></div>
      </div>
      <div class="content" aria-hidden="true">
        <div class="media"><img src="/assets/medias/12.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/02.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/03.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/04.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/05.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/06.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/07.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/08.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/09.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/10.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/11.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/01.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/13.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/14.png" alt="" /></div>
        <div class="media"><img src="/assets/medias/15.png" alt="" /></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";

// Use the exact same logic as the working mwg_026 version
onMounted(() => {
  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    // Use the exact same initialization as working version
    initInfiniteGrid();
  });
});

// The exact same function as in mwg_026/assets/script.js
const initInfiniteGrid = () => {
  // Check if GSAP is available globally (from CDN)
  if (typeof gsap === "undefined") {
    console.error("GSAP not loaded");
    return;
  }

  // Register Observer plugin
  gsap.registerPlugin(Observer);

  const container = document.querySelector(".mwg_effect026 .container");

  if (!container) {
    console.error("Container not found");
    return;
  }

  // Get the viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Get the content dimensions (single content div)
  const content = container.querySelector(".content");
  const contentWidth = content.clientWidth;
  const contentHeight = content.clientHeight;

  console.log("Viewport:", viewportWidth, "x", viewportHeight);
  console.log("Content:", contentWidth, "x", contentHeight);
  console.log("Container:", container.clientWidth, "x", container.clientHeight);

  // Calculate wrapping boundaries based on content size
  // The grid should wrap when it moves one content width/height
  const wrapX = gsap.utils.wrap(-contentWidth, 0);
  const wrapY = gsap.utils.wrap(-contentHeight, 0);

  const xTo = gsap.quickTo(container, "x", {
    duration: 1.5, // Will change over 1.5s
    ease: "power4", // Non-linear
    modifiers: {
      x: gsap.utils.unitize(wrapX),
    },
  });

  const yTo = gsap.quickTo(container, "y", {
    duration: 1.5, // Will change over 1.5s
    ease: "power4", // Non-linear
    modifiers: {
      y: gsap.utils.unitize(wrapY),
    },
  });

  let incrX = 0,
    incrY = 0;

  // Observer to handle wheel and drag events
  Observer.create({
    target: window,
    type: "wheel,touch,pointer", // Handles wheel, touch, and drag
    onChangeX: (self) => {
      if (self.event.type === "wheel") incrX -= self.deltaX;
      else incrX += self.deltaX * 2;

      xTo(incrX); // smoothly animate to the new x position
    },
    onChangeY: (self) => {
      if (self.event.type === "wheel")
        incrY -= self.deltaY; // Update incrY based on the vertical movement
      else incrY += self.deltaY * 2;

      yTo(incrY); // Smoothly animate to the new y position
    },
  });
};
</script>

<style>
/* Component-specific styles for infinite grid */
.mwg_effect026 {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
}
.mwg_effect026 .container {
  display: grid;
  grid-template-columns: repeat(
    2,
    1fr
  ); /* 2 items per row - CRITICAL for infinite wrapping */
  width: max-content;
  will-change: transform; /* This element will undergo many transformations */
}

.mwg_effect026 .content {
  pointer-events: none;
  display: grid;
  width: max-content;
  grid-template-columns: repeat(5, 1fr); /* 5 items per row */
  gap: 10vw;
  padding: 5vw; /* We reproduce half of the gap around the division */
}
.mwg_effect026 .media {
  width: 25vw;
  aspect-ratio: 1;
  user-select: none;
}
.mwg_effect026 .media img,
.mwg_effect026 .media video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

@media (max-width: 900px) {
  .mwg_effect026 .content {
    gap: 20vw;
    padding: 10vw;
  }
  .mwg_effect026 .media {
    width: 50vw;
  }
}
</style>
