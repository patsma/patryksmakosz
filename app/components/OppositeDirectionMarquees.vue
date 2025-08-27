<template>
  <section class="opposite-direction-marquees">
    <div ref="pinRef" class="opposite-direction-marquees__pin">
      <div ref="containerRef" class="opposite-direction-marquees__container">
        <div class="opposite-direction-marquees__sentences">
          <div
            class="opposite-direction-marquees__sentence opposite-direction-marquees__sentence--first"
          >
            <p ref="sentence1Ref">
              <template v-for="n in 4" :key="`row1-${n}`">
                <span> Get your ticket now </span>
                <span
                  class="opposite-direction-marquees__glyph"
                  aria-hidden="true"
                  >✦</span
                >
              </template>
            </p>
          </div>
          <div
            class="opposite-direction-marquees__sentence opposite-direction-marquees__sentence--second"
          >
            <p ref="sentence2Ref">
              <template v-for="n in 4" :key="`row2-${n}`">
                <span> Get your ticket now </span>
                <span
                  class="opposite-direction-marquees__glyph"
                  aria-hidden="true"
                  >✦</span
                >
              </template>
            </p>
          </div>
        </div>
        <div class="opposite-direction-marquees__texts">
          <p>Edition 2025</p>
          <p>350 artists</p>
          <p>4 days of music</p>
          <p>Primavera Sound</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";

/**
 * OppositeDirectionMarquees
 * - Two horizontal marquees scrolling in opposite directions
 * - Section pins during scroll and sentences move vertically via ScrollTrigger
 * - Uses GSAP injected via @hypernym/nuxt-gsap (same pattern as other components)
 *
 * Notes:
 * - We avoid direct DOM queries; everything is refs-based
 * - We clean up tweens and triggers on unmount to prevent leaks
 * - Works with ScrollSmoother because ScrollTrigger defaults to #smooth-content
 */

// Element refs
const pinRef = ref(null);
const containerRef = ref(null);
const sentence1Ref = ref(null);
const sentence2Ref = ref(null);

// Access GSAP and plugins from Nuxt app (consistent with InfiniteDragGridSimple)
const { $gsap } = useNuxtApp();

// Hold created tweens/triggers for cleanup
/** @type {any[]} */
const tweens = [];
/** @type {any[]} */
const triggers = [];

/**
 * Create or recreate the horizontal marquee loops after fonts/layout are ready
 */
const createMarqueeTweens = () => {
  if (!$gsap) return;
  const s1 = sentence1Ref.value;
  const s2 = sentence2Ref.value;
  if (!s1 || !s2) return;

  // Kill previous if re-running (e.g., on resize)
  while (tweens.length) {
    try {
      tweens.pop().kill();
    } catch (e) {}
  }

  const distance1 = -s1.clientWidth / 2;
  const distance2 = -s2.clientWidth / 2;

  // Forward movement
  tweens.push(
    $gsap.to(s1, {
      x: distance1,
      ease: "none",
      duration: 10,
      repeat: -1,
    })
  );

  // Backward movement
  tweens.push(
    $gsap.from(s2, {
      x: distance2,
      ease: "none",
      duration: 10,
      repeat: -1,
    })
  );
};

/**
 * Initialize ScrollTrigger interactions (pin + vertical drift)
 */
const initScroll = () => {
  if (!$gsap) return;
  let ScrollTrigger;
  try {
    ScrollTrigger = $gsap.core.globals().ScrollTrigger;
  } catch (e) {
    return;
  }
  if (!ScrollTrigger) return;

  const pinEl = pinRef.value;
  const containerEl = containerRef.value;
  const s1 = sentence1Ref.value;
  const s2 = sentence2Ref.value;
  if (!pinEl || !containerEl || !s1 || !s2) return;

  // Pin the section for the duration of its height
  const pinTrigger = ScrollTrigger.create({
    trigger: pinEl,
    start: "top top",
    end: "bottom bottom",
    pin: containerEl,
  });
  triggers.push(pinTrigger);

  // Vertical movement linked to scroll
  const yTween = $gsap.to([s1, s2], {
    yPercent: "-=100",
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: pinEl,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
    },
  });
  // The tween creates an internal ScrollTrigger; keep a handle for cleanup
  try {
    triggers.push(yTween.scrollTrigger);
  } catch (e) {}
};

let resizeHandler;

onMounted(() => {
  nextTick(async () => {
    // Ensure fonts are loaded so clientWidth is accurate
    try {
      if (document && document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch (e) {}

    createMarqueeTweens();
    initScroll();

    // Recompute on resize (debounced)
    let t;
    resizeHandler = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        createMarqueeTweens();
      }, 120);
    };
    window.addEventListener("resize", resizeHandler);
  });
});

onBeforeUnmount(() => {
  // Kill tweens
  while (tweens.length) {
    try {
      tweens.pop().kill();
    } catch (e) {}
  }
  // Kill triggers
  while (triggers.length) {
    try {
      triggers.pop().kill();
    } catch (e) {}
  }
  try {
    window.removeEventListener("resize", resizeHandler);
  } catch (e) {}
});
</script>
