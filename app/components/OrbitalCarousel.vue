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

// Mouse position for custom drag icon
const mouse = ref({ x: 0, y: 0 }); // clientX/clientY (viewport)
const lastPage = ref({ x: 0, y: 0 }); // pageX/pageY (document)
const isPressed = ref(false);
const showCustomCursor = ref(false);
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
  hologramOpacity,
  hologramBlur,
} = useOrbitalCarousel({
  ...props,
  breakpointConfig: props.breakpointConfig,
  frontMargin: props.frontMargin,
  backMargin: props.backMargin,
  items: props.items,
  verticalOffset: props.verticalOffset,
});

// --- Refs for DOM elements to be animated from parent ---
const hologramImgRef = ref(null);
const titleRef = ref(null);
const subtitleRef = ref(null);
const currentIndex = ref(0);

// --- GSAP animation logic ---
const { $gsap } = useNuxtApp();

// --- Always provide a default hologram image if none is set ---
const hologramImage = computed(() => {
  if (!items || !Array.isArray(items) || !items.length)
    return "/Image-component-3.png";
  const active = items[currentIndex.value];
  return active && active.hologramSrc
    ? active.hologramSrc
    : "/Image-component-3.png";
});

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

// Always track mouse position in the section
function handleSectionMouseMove(e) {
  mouse.value = { x: e.clientX, y: e.clientY };
  lastPage.value = { x: e.pageX, y: e.pageY };
  if (!showCustomCursor.value) showCustomCursor.value = true;
}
function handleSectionMouseLeave() {
  showCustomCursor.value = false;
}

onMounted(() => {
  if (sectionRef.value) {
    sectionRef.value.addEventListener("mousemove", handleSectionMouseMove);
    sectionRef.value.addEventListener("mouseleave", handleSectionMouseLeave);
  }
});

// Clean up
onBeforeUnmount(() => {
  if (sectionRef.value) {
    sectionRef.value.removeEventListener("mousemove", handleSectionMouseMove);
    sectionRef.value.removeEventListener("mouseleave", handleSectionMouseLeave);
  }
});

// Scale icon down on mousedown/dragging, restore on mouseup
function handleMouseDown() {
  isPressed.value = true;
}
function handleMouseUp() {
  isPressed.value = false;
}

onMounted(() => {
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
});
onBeforeUnmount(() => {
  window.removeEventListener("mousedown", handleMouseDown);
  window.removeEventListener("mouseup", handleMouseUp);
});

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
</script>

<template>
  <!-- Hologram image: only show on desktop, animate with GSAP state -->
  <div class="bg-lbc-purple-300 py-16 md:py-24 relative z-10">
    <div
      ref="titleRef"
      class="title pointer-events-none absolute top-[3.5rem] hd:top-[4.5rem] left-1/2 -translate-x-1/2 translate-y-1/2 text-center text-lbc-2xl md:text-lbc-6xl text-lbc-gray-100 z-50 font-bold w-full"
    >
      SCENA INSPIRACJI
    </div>
    <p
      ref="subtitleRef"
      class="absolute hidden md:block top-[9rem] hd:top-[11rem] left-1/2 -translate-x-1/2 text-[15px] md:text-[30px] font-normal text-center uppercase bg-gradient-to-r from-lbc-electric-blue to-lbc-neon-fuchsia bg-clip-text text-transparent tracking-[0.1em] md:tracking-[0.17em] z-50 pointer-events-none w-full"
    >
      PRELEGENCI LIFE BALANCE CONGRESS
    </p>
    <div
      id="orbital-carousel-section"
      ref="sectionRef"
      class="w-screen h-screen min-h-screen -translate-x-[0.5vw] uhd:-translate-x-[0.2vw] flex items-center justify-center bg-lbc-purple-300 cursor-none relative z-40"
    >
      <NuxtImg
        ref="hologramImgRef"
        :src="hologramImage"
        alt="Hologram"
        class="object-cover pointer-events-none mix-blend-screen absolute top-1/2 left-1/2 z-[-1] -translate-x-1/2 -translate-y-[65%] w-[42.375rem] h-[42rem]"
        :style="{ opacity: hologramOpacity, filter: `blur(${hologramBlur}px)` }"
      />
      <div ref="proxyRef" style="display: none" aria-hidden="true" />
      <div
        ref="dragOverlay"
        class="absolute inset-0 z-50 drag-overlay"
        style="pointer-events: all"
        aria-label="Drag to rotate carousel"
      />
      <div
        ref="carouselRef"
        class="carousel relative select-none w-full h-full flex items-center justify-center"
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
              'carousel-item',
              { active: getItemProps(item.id).isActive },
            ]"
            :style="{
              transform:
                `translate(${getItemProps(item.id).x}rem, ` +
                `${getItemProps(item.id).y}rem)` +
                ` scale(${getItemProps(item.id).isActive ? 1.1 : 1})`,
              width: getItemProps(item.id).size.width + 'rem',
              height: getItemProps(item.id).size.height + 'rem',
              opacity: getItemProps(item.id).opacity,
              zIndex: getItemProps(item.id).z,
              cursor: 'grab',
              pointerEvents: 'none',
            }"
            aria-label="Mentor item"
            tabindex="-1"
          >
            <OrbitalCarouselItem
              :active="getItemProps(item.id).isActive"
              :name="item.name"
              :title="item.title"
              :show-title="item.showTitle"
              :image-src="item.imageSrc"
            />
          </div>
        </template>
        <!-- Custom drag icon at viewport (fixed) position -->
        <transition name="fade-cursor">
          <div
            v-if="showCustomCursor"
            :style="{
              left: mouse.x + 'px',
              top: mouse.y + 'px',
              transform:
                'translate(-50%, -50%) ' +
                (isPressed || dragging ? 'scale(0.85)' : 'scale(1)'),
            }"
            class="fixed z-[300] pointer-events-none transition-transform duration-200"
          >
            <IconDraggableSVG class="w-16 h-16" />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  perspective: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}
.carousel-item {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: center center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s, height 0.3s, opacity 0.3s, background 0.3s,
    border 0.3s, transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  user-select: none;
  background: transparent;
  pointer-events: none;
  will-change: transform, opacity, width, height, z-index;
}
.carousel-item.back {
  filter: blur(0.5px);
}
.drag-overlay {
  pointer-events: all !important;
  z-index: 1000 !important;
  cursor: none !important;
}
.item-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  transition: all 0.3s;
}
.item-content.active {
  color: white;
}
.controls {
  z-index: 10;
}
.cursor-none {
  cursor: none !important;
}
.fade-cursor-enter-active,
.fade-cursor-leave-active {
  transition: opacity 0.3s;
}
.fade-cursor-enter-from,
.fade-cursor-leave-to {
  opacity: 0;
}
.fade-cursor-enter-to,
.fade-cursor-leave-from {
  opacity: 1;
}
</style>
