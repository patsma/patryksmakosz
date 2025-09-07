<script setup>
// Use GSAP through Nuxt injection to align with our animation standards
const { $gsap } = useNuxtApp();
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * @typedef {Object} StepItem
 * @property {string} title
 * @property {string} text
 */

/**
 * @typedef {Object} CtaButton
 * @property {('outline'|'filled')} type
 * @property {string} link
 * @property {string} text
 */

const props = defineProps({
  /** @type {string} */
  title: { type: String, default: "" },
  /** @type {string|null} */
  copy: { type: String, default: null },
  /** @type {string} */
  imageSrc: { type: String, default: "" },
  /** @type {Array<StepItem>} */
  steps: { type: Array, default: () => [] },
  /** @type {boolean} */
  alternativeColors: { type: Boolean, default: false },
  /** @type {boolean} */
  gradientTitle: { type: Boolean, default: false },
  /** @type {boolean} */
  flipped: { type: Boolean, default: false },
  /** @type {boolean} */
  bigTitle: { type: Boolean, default: false },
  /** @type {Array<CtaButton>} */
  buttons: { type: Array, default: () => [] },
});

const titleNormalized = computed(() => props.title || "Image steppers");
const copyNormalized = computed(() => props.copy || "");
const imageSrcNormalized = computed(
  () => props.imageSrc || "/Image-component-5.png"
);

const stepsNormalized = computed(() => {
  if (props.steps && props.steps.length) return props.steps;
  return [
    { title: "Discover", text: "We learn and understand." },
    { title: "Design", text: "We design the solution." },
    { title: "Deliver", text: "We build and iterate." },
  ];
});

const buttonsNormalized = computed(() => props.buttons || []);

// Refs
const stepsWrapperRef = ref(null);
const stepRefs = ref([]);
const stepNumberRefs = ref([]);
const stepLineRefs = ref([]);
const stepTitleRefs = ref([]);
const stepCopyRefs = ref([]);
const parallaxContainerRef = ref(null);

// Lifecycle: reset refs arrays before update to avoid duplicates
onBeforeUpdate(() => {
  stepRefs.value = [];
  stepNumberRefs.value = [];
  stepLineRefs.value = [];
  stepTitleRefs.value = [];
  stepCopyRefs.value = [];
});

// ScrollTrigger timelines storage to clean up on unmount
const stepTimelines = ref([]);

/**
 * Convert rem units to pixels using the root font-size
 * @param {number} rem
 * @returns {number}
 */
const convertRemToPixels = (rem) => {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

/**
 * Dynamically set the vertical line height for each step to connect dots visually
 */
const setStepLinesHeight = () => {
  const stepsWrapper = stepsWrapperRef.value;
  if (!stepsWrapper) return;

  const style = window.getComputedStyle(stepsWrapper);
  const gapPx = style.getPropertyValue("gap");
  const gap = parseInt(gapPx, 10) || 0;
  const offset = convertRemToPixels(6); // parity with WP implementation

  stepLineRefs.value.forEach((lineEl, index) => {
    const stepEl = stepRefs.value[index];
    if (!lineEl || !stepEl) return;
    const stepHeight = stepEl.clientHeight || 0;
    const targetHeight = Math.max(0, stepHeight + gap - offset);
    lineEl.style.height = `${targetHeight}px`;
  });

  try {
    ScrollTrigger.refresh();
  } catch (e) {}
};

/**
 * Initialize scroll-based animations for each step
 */
const initScrollAnimations = () => {
  // Clean any previous timelines
  stepTimelines.value.forEach((tl) => tl?.kill?.());
  stepTimelines.value = [];

  const numbers = stepNumberRefs.value;
  const titles = stepTitleRefs.value;
  const copies = stepCopyRefs.value;
  const lines = stepLineRefs.value;

  stepRefs.value.forEach((_, index) => {
    const tl = $gsap
      .timeline({
        scrollTrigger: {
          trigger: stepRefs.value[index],
          start: "top center+=25%",
          scrub: true,
        },
      })
      .from([numbers[index], titles[index], copies[index]], { autoAlpha: 0 })
      .from(lines[index], { height: 0 }, "-=0.4");

    stepTimelines.value.push(tl);
  });
};

// Resize handling
let resizeHandler = null;
let parallaxCleanup = null;

onMounted(() => {
  // Register plugin safely on client
  try {
    $gsap.registerPlugin(ScrollTrigger);
  } catch (e) {}

  nextTick(() => {
    setStepLinesHeight();
    initScrollAnimations();
  });

  resizeHandler = () => {
    setStepLinesHeight();
  };
  window.addEventListener("resize", resizeHandler, { passive: true });

  // ScrollSmoother handles data-speed="auto" automatically - no composable needed
});

onUnmounted(() => {
  try {
    stepTimelines.value.forEach((tl) => tl?.kill?.());
    ScrollTrigger.getAll().forEach((st) => st.kill());
  } catch (e) {}
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
  // ScrollSmoother cleans up automatically
});
</script>
<template>
  <section
    class="image-steppers"
    :class="{
      'image-steppers--reversed': flipped,
      'image-steppers--big-title': bigTitle,
    }"
    role="region"
    aria-label="Image steppers"
  >
    <div class="image-steppers__img">
      <div class="image image--parallax-01" ref="parallaxContainerRef">
        <NuxtImg
          :src="imageSrcNormalized"
          alt=""
          data-speed="auto"
          data-lag="0.2"
          format="webp"
        />
      </div>
    </div>

    <div class="image-steppers__wrapper">
      <div
        class="image-steppers__title"
        :class="{
          'gradient-text-2': alternativeColors && gradientTitle,
          'gradient-text-1': !alternativeColors && gradientTitle,
        }"
      >
        {{ titleNormalized }}
      </div>

      <div v-if="copyNormalized" class="image-steppers__copy">
        {{ copyNormalized }}
      </div>

      <div class="image-steppers__steps" ref="stepsWrapperRef">
        <div
          v-for="(item, index) in stepsNormalized"
          :key="`step-${index}`"
          class="image-steppers__step"
          ref="stepRefs"
        >
          <div class="image-steppers__step-number" ref="stepNumberRefs">
            {{ index + 1 }}
            <div class="image-steppers__step-line" ref="stepLineRefs"></div>
          </div>
          <div class="image-steppers__step-inner">
            <div class="image-steppers__step-title" ref="stepTitleRefs">
              {{ item.title }}
            </div>
            <div class="image-steppers__step-copy" ref="stepCopyRefs">
              {{ item.text }}
            </div>
          </div>
        </div>
      </div>

      <div class="button" v-if="buttonsNormalized.length">
        <template v-for="(btn, idx) in buttonsNormalized" :key="`cta-${idx}`">
          <a
            v-if="btn.type === 'outline'"
            :href="btn.link"
            class="btn-standard-outlined"
            :class="{ 'btn-standard--incident': alternativeColors }"
          >
            <span>{{ btn.text }}</span>
          </a>
          <a
            v-else
            :href="btn.link"
            class="btn-standard"
            :class="{ 'btn-standard--incident': alternativeColors }"
          >
            <span>{{ btn.text }}</span>
          </a>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss"></style>
