<template>
  <section class="mwg_effect026">
    <div class="container" ref="containerRef">
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
import { ref, onMounted } from "vue";

// Get GSAP and Observer from Nuxt app - same as MorphingLogo.vue
const { $gsap } = useNuxtApp();
const { $Observer } = useNuxtApp();

// Template ref for container
const containerRef = ref(null);

// Initialize the grid - using your working implementation
onMounted(() => {
  const container = document.querySelector(".mwg_effect026 .container");

  const halfX = container.clientWidth / 2;
  const wrapX = $gsap.utils.wrap(-halfX, 0);
  const xTo = $gsap.quickTo(container, "x", {
    duration: 1.5, // Will change over 1.5s
    ease: "power4", // Non-linear
    modifiers: {
      x: $gsap.utils.unitize(wrapX),
    },
  });

  const halfY = container.clientHeight / 2;
  const wrapY = $gsap.utils.wrap(-halfY, 0);
  const yTo = $gsap.quickTo(container, "y", {
    duration: 1.5, // Will change over 1.5s
    ease: "power4", // Non-linear
    modifiers: {
      y: $gsap.utils.unitize(wrapY),
    },
  });

  let incrX = 0,
    incrY = 0;

  // Observer to handle wheel and drag events
  $Observer.create({
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

  // RANDOM ITEM POSITIONS
  // const lengthMedia = container.querySelector('.content').querySelectorAll('.media').length
  // const randomValues = []
  // for (let i = 0; i < lengthMedia; i++) {
  //     randomValues.push([
  //         (Math.random() - 0.5) * 30,
  //         (Math.random() - 0.5) * 30
  //     ])
  // }
  // container.querySelectorAll('.content').forEach(content => {
  //     content.querySelectorAll('.media').forEach((el, index) => {
  //         gsap.set(el, {
  //             xPercent: randomValues[index][0],
  //             yPercent: randomValues[index][1]
  //         })
  //     })
  // })
});
</script>

<style>
/* NORMALIZE */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  appearance: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
/* NORMALIZE */

body {
  background: #121212;
  color: #f1f1f1;
  overscroll-behavior-x: none; /* Prevent go to previous page */
  overflow: hidden;
}
.mwg_effect026 {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
}
.mwg_effect026 .container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 items par row */
  width: max-content;
  will-change: transform; /* This element will undergo many transformations */
}

.mwg_effect026 .content {
  pointer-events: none;
  display: grid;
  width: max-content;
  grid-template-columns: repeat(5, 1fr); /* 5 items par row */
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
