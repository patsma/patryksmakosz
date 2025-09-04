<script setup>
import useOrbitalCarousel from "/composables/useOrbitalCarousel";
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import skills from "~/data/skills";

const props = defineProps({
  /** @type {number} */ orbitXFactor: { type: Number, default: 0.7 },
  /** @type {number} */ orbitYFactor: { type: Number, default: 0.38 },
  /** @type {number} */ minOrbitX: { type: Number, default: 600 },
  /** @type {number} */ minOrbitY: { type: Number, default: 220 },
  /** @type {Array} */ breakpointConfig: { type: Array, default: undefined },
  /** @type {number} */ frontMargin: { type: Number, default: 1.2 },
  /** @type {number} */ backMargin: { type: Number, default: 0.8 },
  /** @type {Array} */ items: { type: Array, default: undefined },
  /** @type {number} */ verticalOffset: { type: Number, default: 28 },
});

const sectionRef = ref(null);

// Use the composable
const {
  dragging,
  ready,
  items,
  dragOverlay,
  carouselRef,
  proxyRef,
  getItemProps,
  hologramSrc,
  hologramOpacity,
  activeAnchor,
} = useOrbitalCarousel({
  ...props,
  breakpointConfig: props.breakpointConfig,
  frontMargin: props.frontMargin,
  backMargin: props.backMargin,
  // Inject skills as items for the carousel; map to expected structure
  items: (skills || []).map((s, idx) => ({
    id: idx,
    name: s.name,
    title: s.description,
    showTitle: s.highlight,
    imageSrc: s.svg,
    hologramSrc: s.svg, // temporary: reuse icon as hologram visual with info overlay
  })),
  verticalOffset: props.verticalOffset,
});

// --- Refs for DOM elements to be animated from parent ---
const hologramImgRef = ref(null);
const titleRef = ref(null);
const subtitleRef = ref(null);
const currentIndex = ref(0);
const currentSkill = computed(() => {
  const idx = currentIndex.value;
  return Array.isArray(items) && items[idx] ? items[idx] : null;
});

// --- GSAP animation logic ---
const { $gsap } = useNuxtApp();

// Hologram state is provided by composable now

// Helper to always get the real DOM element for the hologram image
function getHologramEl() {
  const el = hologramImgRef.value;
  return el && el.$el ? el.$el : el;
}

// --- GSAP Timeline for animating title, hologram, and all carousel items ---
onMounted(async () => {
  await nextTick();
  await nextTick(); // Double nextTick to ensure DOM is fully updated
  if (!sectionRef.value || !titleRef.value || !getHologramEl()) return;
  $gsap.set([sectionRef.value, titleRef.value, carouselRef.value], {
    autoAlpha: 1,
    opacity: 1,
    scale: 1,
    y: 0,
  });
  $gsap.set(getHologramEl(), { autoAlpha: 1, opacity: 1, scale: 1 });
});

// --- Simple split-text animation (no blur) ---
/**
 * Split an element's textContent into spans.
 * @param {HTMLElement} el
 * @param {"chars"|"words"} mode
 * @returns {HTMLElement[]}
 */
function splitToSpans(el, mode) {
  if (!el) return [];
  const text = el.textContent || "";
  el.innerHTML = "";
  const parts = mode === "words" ? text.split(/(\s+)/) : Array.from(text);
  const spans = [];
  for (const part of parts) {
    const span = document.createElement("span");
    span.textContent = part;
    if (/\s+/.test(part)) span.style.whiteSpace = "pre";
    el.appendChild(span);
    spans.push(span);
  }
  return spans;
}

function animateHoloText() {
  const titleEl = titleRef.value;
  const descEl = subtitleRef.value;
  if (!titleEl || !descEl) return;
  const titleSpans = splitToSpans(titleEl, "chars");
  const descSpans = splitToSpans(descEl, "words");
  $gsap.set([...titleSpans, ...descSpans], {
    display: "inline-block",
    opacity: 0,
    y: 6,
  });
  $gsap.to(titleSpans, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.02,
  });
  $gsap.to(descSpans, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.02,
    delay: 0.05,
  });
}

onMounted(() => {
  // Initial split animation after first render
  nextTick().then(() => animateHoloText());
});

// Clean up
onBeforeUnmount(() => {});



// --- Watch for active item changes and update currentIndex ---
watch(
  () => items.map((item) => getItemProps(item.id).isActive),
  (isActiveArr) => {
    const newIndex = isActiveArr.findIndex((active) => active);
    if (newIndex !== -1 && newIndex !== currentIndex.value) {
      currentIndex.value = newIndex;
    }
  },
  { immediate: true, deep: true }
);

// Re-run split animation when the active item changes
watch(currentIndex, async () => {
  await nextTick();
  animateHoloText();
});
</script>

<template>
  <!-- Hologram image: only show on desktop, animate with GSAP state -->
  <div class="orbital-carousel">
    <div
      id="orbital-carousel-section"
      ref="sectionRef"
      class="orbital-carousel__canvas"
    >
      <div
        ref="hologramImgRef"
        class="orbital-carousel__holo-text"
        :style="{
          left: (activeAnchor?.left ?? 0) + 'rem',
          top: (activeAnchor?.top ?? 0) + 'rem',
          transform: 'translate(-50%, -100%)',
          opacity: hologramOpacity,
        }"
        aria-live="polite"
      >
        <div ref="titleRef" class="orbital-carousel__holo-title">
          {{ currentSkill?.name }}
        </div>
        <div ref="subtitleRef" class="orbital-carousel__holo-desc">
          {{ currentSkill?.title }}
        </div>
      </div>
      <div ref="proxyRef" style="display: none" aria-hidden="true" />
      <div
        ref="dragOverlay"
        class="orbital-carousel__drag-overlay"
        style="pointer-events: all"
        aria-label="Drag to rotate carousel"
      />
      <div
        ref="carouselRef"
        class="orbital-carousel__stage select-none"
        :style="{
          opacity: ready ? 1 : 0,
          visibility: ready ? 'visible' : 'hidden',
        }"
      >
        <template v-if="ready">
          <div
            v-for="item in items"
            :key="item.id"
            :class="[
              'orbital-item',
              { active: getItemProps(item.id).isActive },
            ]"
            :style="{
              transform:
                `translate(${getItemProps(item.id).x}rem, ` +
                `${getItemProps(item.id).y}rem)` +
                ` scale(${getItemProps(item.id).isActive ? 1.08 : 1})`,
              width: getItemProps(item.id).size.width + 'rem',
              height: getItemProps(item.id).size.height + 'rem',
              opacity: getItemProps(item.id).opacity,
              zIndex: getItemProps(item.id).z,
              cursor: 'grab',
              pointerEvents: 'none',
            }"
            :aria-label="item.name + ' skill'"
            tabindex="-1"
          >
            <OrbitalCarouselItem
              :active="getItemProps(item.id).isActive"
              :name="item.name"
              :icon-src="item.imageSrc"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
