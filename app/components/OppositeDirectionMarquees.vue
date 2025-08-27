<template>
  <section
    class="opposite-direction-marquees"
    :style="{
      '--odm-pin-height': `${pinHeightVh}vh`,
      '--odm-font-size': `${fontSizeVw}vw`,
      '--odm-icon-size': `${iconSizeVw}vw`,
      '--odm-word-gap': `${wordGapVw}vw`,
      '--odm-icon-gap': `${iconGapVw}vw`,
      '--odm-bg':
        theme === 'light' ? 'var(--color-white)' : 'var(--color-black)',
      '--odm-fg':
        theme === 'light' ? 'var(--color-black)' : 'var(--color-gray-1)',
      '--odm-border-color':
        theme === 'light' ? 'var(--color-gray-2)' : 'rgba(72, 72, 72, 1)',
    }"
  >
    <div ref="pinRef" class="opposite-direction-marquees__pin">
      <div ref="containerRef" class="opposite-direction-marquees__container">
        <div class="opposite-direction-marquees__sentences">
          <div
            class="opposite-direction-marquees__sentence opposite-direction-marquees__sentence--first"
          >
            <p ref="sentence1Ref" :class="{ uppercase }">
              <template v-for="n in repeatBlocks" :key="`row1-${n}`">
                <template v-for="(label, idx) in items" :key="`r1-${n}-${idx}`">
                  <span> {{ label }} </span>
                  <Icon
                    v-if="separatorIcon"
                    :name="separatorIcon"
                    class="opposite-direction-marquees__icon"
                    aria-hidden="true"
                  />
                </template>
              </template>
            </p>
          </div>
          <div
            class="opposite-direction-marquees__sentence opposite-direction-marquees__sentence--second"
          >
            <p ref="sentence2Ref" :class="{ uppercase }">
              <template v-for="n in repeatBlocks" :key="`row2-${n}`">
                <template v-for="(label, idx) in items" :key="`r2-${n}-${idx}`">
                  <span> {{ label }} </span>
                  <Icon
                    v-if="separatorIcon"
                    :name="separatorIcon"
                    class="opposite-direction-marquees__icon"
                    aria-hidden="true"
                  />
                </template>
              </template>
            </p>
          </div>
        </div>
        <div
          v-if="showMeta && displayedMeta.length"
          class="opposite-direction-marquees__texts"
        >
          <p
            v-for="(text, i) in displayedMeta"
            :key="`meta-${i}`"
            :class="{ 'opposite-direction-marquees__project': i === 0 }"
          >
            {{ text }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";

/**
 * Props for customization so the component can be used across projects.
 * @typedef {Object} OppositeDirectionMarqueesProps
 * @property {string[]} items - Labels to display in the marquee in order
 * @property {string} [separatorIcon] - Icon name for @nuxt/icon (e.g., 'uil:bolt')
 * @property {boolean} [uppercase] - Uppercase text rendering
 * @property {number} [repeatBlocks] - How many times to repeat items per row
 * @property {number} [pinHeightVh] - Pinned section height in vh
 * @property {number} [fontSizeVw] - Headline font size in vw
 * @property {number} [iconSizeVw] - Icon size in vw
 * @property {number} [wordGapVw] - Horizontal gap around each word in vw
 * @property {number} [iconGapVw] - Horizontal gap around the icon in vw
 * @property {string} [theme] - 'dark' or 'light'
 * @property {boolean} [showMeta] - Show meta footer row
 * @property {string[]} [meta] - Meta footer texts (e.g., stats)
 * @property {string} [projectName] - Project name to display before meta
 * @property {number} [durationSec] - Duration (seconds) to travel half-width
 */

/** @type {OppositeDirectionMarqueesProps} */
const props = defineProps({
  items: { type: Array, default: () => ["Get your ticket now"] },
  separatorIcon: { type: String, default: "uil:bolt" },
  uppercase: { type: Boolean, default: false },
  repeatBlocks: { type: Number, default: 4 },
  pinHeightVh: { type: Number, default: 200 },
  fontSizeVw: { type: Number, default: 10 },
  iconSizeVw: { type: Number, default: 5.5 },
  wordGapVw: { type: Number, default: 2 },
  iconGapVw: { type: Number, default: 2 },
  theme: { type: String, default: "dark" },
  showMeta: { type: Boolean, default: false },
  meta: { type: Array, default: () => [] },
  projectName: { type: String, default: "" },
  durationSec: { type: Number, default: 18 },
});

// Build meta with projectName first if provided
const displayedMeta = computed(() => {
  const arr = Array.isArray(props.meta) ? [...props.meta] : [];
  if (props.projectName && arr[0] !== props.projectName)
    arr.unshift(props.projectName);
  return arr;
});

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

  // Reset transforms before measuring
  try {
    $gsap.set([s1, s2], { x: 0 });
  } catch (e) {}

  const distance1 = -s1.clientWidth / 2;
  const distance2 = -s2.clientWidth / 2;

  // Forward movement
  tweens.push(
    $gsap.to(s1, {
      x: distance1,
      ease: "none",
      duration: props.durationSec,
      repeat: -1,
    })
  );

  // Backward movement
  tweens.push(
    $gsap.from(s2, {
      x: distance2,
      ease: "none",
      duration: props.durationSec,
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
