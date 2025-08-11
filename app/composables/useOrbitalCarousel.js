// Composable for orbital carousel logic (state, animation, GSAP Draggable)
// Only for use in OrbitalCarousel.vue
// JS + JSDoc, no TypeScript

import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

// Ensure Draggable is registered once in client
try {
  gsap.registerPlugin(Draggable);
} catch (e) {}

/**
 * @typedef {Object} BreakpointConfig
 * @property {number} minWidth
 * @property {number} orbitXFactor
 * @property {number} orbitYFactor
 * @property {number} minOrbitX
 * @property {number} minOrbitY
 * @property {number} [frontMargin]
 * @property {number} [backMargin]
 * @property {number} [verticalOffset] // px
 * @property {number} [itemScale] // multiplier
 */

/**
 * @typedef {Object} UseOrbitalCarouselOptions
 * @property {number} [orbitXFactor]
 * @property {number} [orbitYFactor]
 * @property {number} [minOrbitX]
 * @property {number} [minOrbitY]
 * @property {Array<BreakpointConfig>} [breakpointConfig]
 * @property {number} [frontMargin]
 * @property {number} [backMargin]
 * @property {number} [verticalOffset]
 * @property {number} [itemScale]
 * @property {Array<Record<string, any>>} [items]
 */

// Default items fallback (for dev/testing) — uses /public/orbital assets
export const defaultItems = [
  {
    id: 0,
    name: "Aneta Pisz",
    title: "Psychoterapeutka systemowa",
    showTitle:
      "O, moje życie… prawie cię nie zauważyłam. Jak odzyskać siebie spod warstw pokoleń",
    imageSrc: "/orbital/aneta-pisz-przestrzenserca.png",
    hologramSrc: "/orbital/hologram/ap-holo.png",
  },
  {
    id: 1,
    name: "Paulina Próchnicka",
    title: "Coach transformacyjny",
    showTitle: "",
    imageSrc: "/orbital/paulina-prochnicka.png",
    hologramSrc: "/orbital/hologram/pp-holo.png",
  },
  {
    id: 2,
    name: "Karolina i Maciej Szaciłło",
    title: "Dziennikarka /  Edukator zdrowego stylu życia",
    showTitle: "JAK DBAĆ O ZDROWIE WIELOPOZIOMOWO?",
    imageSrc: "/orbital/karolina-maciej-szacillo.png",
    hologramSrc: "/orbital/hologram/kms-holo.png",
  },
  {
    id: 3,
    name: "Kamila Grześkowiak",
    title: "Psycholożka",
    showTitle: "Sekrety rodzinne",
    imageSrc: "/orbital/kamila-grzeskowiak.png",
    hologramSrc: "/orbital/hologram/kg-holo.png",
  },
  {
    id: 4,
    name: "Aria Olejniczak i Tomasz Kaliszak",
    title: "Instruktorka jogi i AcroYogi,",
    showTitle: "",
    imageSrc: "/orbital/women-shadow.png",
    hologramSrc: "",
  },
  {
    id: 5,
    name: "Anita Tomasik",
    title: "Naturoterapeutka",
    showTitle: "Gimnastyka Słowiańska - warsztaty",
    imageSrc: "/orbital/anita-tomasik.png",
    hologramSrc: "/orbital/hologram/at-holo.png",
  },
  {
    id: 6,
    name: "Pawel Nazaruk",
    title: "Edukator zdrowia holistycznego",
    showTitle: "Czarna mgła — czyli gdy ciało przestaje być Twoje",
    imageSrc: "/orbital/pawel-nazaruk.png",
    hologramSrc: "/orbital/hologram/pn-holo.png",
  },
  {
    id: 7,
    name: "Magdalena Cubała-Kucharska",
    title: "",
    showTitle: "Zdrowie jest warte więcej niż miliony",
    imageSrc: "/orbital/dracubala.png",
    hologramSrc: "/orbital/hologram/dr-holo.png",
  },
  {
    id: 8,
    name: "Malgorzata Zasanska",
    title: "Mentorka zdrowia kobiet",
    showTitle: "Zatrzymaj się, żeby przyspieszyć.",
    imageSrc: "/orbital/malgorzata-zasanska.png",
    hologramSrc: "/orbital/hologram/mz-holo.png",
  },
  {
    id: 9,
    name: "Marta Kuśpit i Darek Chwiejczak",
    title: "Terapeuci holistyczni, specjaliści pracy z emocjami",
    showTitle:
      "Emocje mają głos – jak usłyszeć siebie i uzdrowić to, co niewidoczne",
    imageSrc: "/orbital/dariusz-chwiejczak.png",
    hologramSrc: "/orbital/hologram/dc-holo.png",
  },
  {
    id: 10,
    name: "Anna Gniłka",
    title: "Holistyczna terapeutka ciała i ducha",
    showTitle: "Zrozum Układ Nerwowy",
    imageSrc: "/orbital/anna-gnilka.png",
    hologramSrc: "/orbital/hologram/ag-holo.png",
  },
  {
    id: 11,
    name: "Adam Kin",
    title: "Psycholog transpersonalny",
    showTitle:
      "Między duchowością a codziennością – jak żyć świadomie i nie odlecieć",
    imageSrc: "/orbital/adam-kin.png",
    hologramSrc: "/orbital/hologram/ak-holo.png",
  },
  {
    id: 12,
    name: "Piotr Szczerkowski",
    title: "",
    showTitle: "",
    imageSrc: "/orbital/piotr-szczerkowski.png",
    hologramSrc: "/orbital/hologram/ps-holo.png",
  },
  {
    id: 13,
    name: "Susan Hufnagel",
    title: "Psycholog",
    showTitle: "Doświadcz Kodu Emocji",
    imageSrc: "/orbital/susan-hufnagel.png",
    hologramSrc: "/orbital/hologram/sh-holo.png",
  },
];

/**
 * useOrbitalCarousel composable
 * @param {UseOrbitalCarouselOptions} options
 */
export default function useOrbitalCarousel(options = {}) {
  // Use provided items or fallback
  const items =
    options.items && Array.isArray(options.items) && options.items.length > 0
      ? options.items
      : defaultItems;
  // --- Config ---
  const ITEM_COUNT = items.length;

  // Manual breakpoint-based root font size to match CSS
  function getRootFontSize() {
    if (typeof window !== "undefined") {
      const w = window.innerWidth;
      if (w >= 3800) return 26;
      if (w >= 2500) return 20;
      return 16;
    }
    return 16;
  }

  // All base sizes are in rem for accessibility and scalability
  const BASE_SIZES_PX = [
    { width: 356, height: 316 },
    { width: 274.16, height: 251.7 },
    { width: 245.47, height: 214.03 },
    { width: 185.11, height: 165.2 },
    { width: 140.87, height: 127.73 },
    { width: 124.74, height: 111.32 },
  ];
  const SMALLEST_PX = { width: 100.53, height: 89.72 };
  let rootFontSize = getRootFontSize();
  // Sizes in rem
  const SIZES = BASE_SIZES_PX.map((s) => ({
    width: s.width / rootFontSize,
    height: s.height / rootFontSize,
  }));
  const SMALLEST = {
    width: SMALLEST_PX.width / rootFontSize,
    height: SMALLEST_PX.height / rootFontSize,
  };

  // --- State ---
  const currentIndex = ref(0);
  const position = ref(0);
  const dragging = ref(false);
  const viewport = ref({ width: 0, height: 0 });
  const ready = ref(false);
  // Hologram state (coupled to drag lifecycle for performance)
  const hologramSrc = ref("");
  const hologramOpacity = ref(1);
  const hologramBlur = ref(0);

  // --- Breakpoint Config ---
  const selectedConfig = computed(() => {
    if (!options.breakpointConfig || !Array.isArray(options.breakpointConfig))
      return options;
    const sorted = [...options.breakpointConfig].sort(
      (a, b) => b.minWidth - a.minWidth
    );
    return (
      sorted.find((cfg) => viewport.value.width >= cfg.minWidth) || options
    );
  });

  // --- Orbit Sizes (rem) ---
  const ORBIT_X = computed(() => {
    rootFontSize = getRootFontSize();
    return Math.max(
      (viewport.value.width * (selectedConfig.value.orbitXFactor ?? 0.7)) /
        rootFontSize,
      (viewport.value.height * (selectedConfig.value.orbitXFactor ?? 0.7)) /
        rootFontSize,
      (selectedConfig.value.minOrbitX ?? 600) / rootFontSize
    );
  });
  const ORBIT_Y = computed(() => {
    rootFontSize = getRootFontSize();
    return Math.max(
      (viewport.value.height * (selectedConfig.value.orbitYFactor ?? 0.38)) /
        rootFontSize,
      (selectedConfig.value.minOrbitY ?? 220) / rootFontSize
    );
  });

  const frontMargin = computed(
    () => selectedConfig.value.frontMargin ?? options.frontMargin ?? 1.2
  );
  const backMargin = computed(
    () => selectedConfig.value.backMargin ?? options.backMargin ?? 0.8
  );

  // Responsive vertical offset and item scale
  const verticalOffsetPx = computed(
    () => selectedConfig.value.verticalOffset ?? options.verticalOffset ?? 28
  );
  const itemScale = computed(() => selectedConfig.value.itemScale ?? 1);

  // --- Carousel Math ---
  function getStepAngle() {
    return 360 / ITEM_COUNT;
  }
  function getRelativeIndex(i) {
    let rel = (i - position.value + ITEM_COUNT) % ITEM_COUNT;
    if (rel > ITEM_COUNT / 2) rel -= ITEM_COUNT;
    return rel;
  }
  /**
   * Compute properties for item with id i (rem units)
   * @param {number} i
   */
  function getItemProps(i) {
    rootFontSize = getRootFontSize();
    const rel = getRelativeIndex(i);
    const stepAngle = getStepAngle();
    const maxRel = ITEM_COUNT / 2;
    const t = Math.abs(rel) / maxRel;
    const marginFactor = (1 - t) * frontMargin.value + t * backMargin.value;
    const angle = 90 + rel * stepAngle * marginFactor;
    const rad = (angle * Math.PI) / 180;
    // Center in rem
    const centerX = viewport.value.width / 2 / rootFontSize;
    const centerY =
      viewport.value.height / rootFontSize -
      ORBIT_Y.value -
      (SIZES[0].height / 2) * itemScale.value -
      verticalOffsetPx.value / rootFontSize;
    // Orbit in rem
    const x = +(Math.cos(rad) * ORBIT_X.value + centerX).toFixed(4);
    const y = +(Math.sin(rad) * ORBIT_Y.value + centerY).toFixed(4);
    const dist = Math.abs(rel);
    const sizeIdx = Math.min(Math.round(dist), SIZES.length - 1);
    let size = SIZES[sizeIdx];
    let opacity = sizeIdx < SIZES.length ? 1 : 0.25;
    let z = sizeIdx < SIZES.length ? 100 - sizeIdx : 0;
    if (dist >= SIZES.length) {
      size = SMALLEST;
      opacity = 0.03;
      z = 0;
    }
    const isActive = rel === 0;
    return {
      x: x - (size.width * itemScale.value) / 2,
      y: y - (size.height * itemScale.value) / 2,
      size: {
        width: +(size.width * itemScale.value).toFixed(4),
        height: +(size.height * itemScale.value).toFixed(4),
      },
      opacity,
      z,
      isActive,
    };
  }

  // --- GSAP Draggable ---
  const dragOverlay = ref(null);
  const carouselRef = ref(null);
  const proxyRef = ref(null);
  /** @type {import('gsap/Draggable').Draggable | null} */
  let draggableInstance = null;
  let dblClickListenerAttached = false;
  const DRAG_THRESHOLD = 8;
  const DRAG_RATIO = 150;
  let dragStarted = false;
  let startX = 0;
  let dragDistance = 0;

  function handlePickActive() {
    gsap.killTweensOf(position);
    if (draggableInstance) {
      draggableInstance.kill();
      draggableInstance = null;
    }
    if (dragOverlay.value && dblClickListenerAttached) {
      dragOverlay.value.removeEventListener("dblclick", resetCarousel);
      dblClickListenerAttached = false;
    }
    const snapped = Math.round(position.value) % ITEM_COUNT;
    position.value = snapped;
    currentIndex.value = snapped;
    dragStarted = false;
    dragging.value = false;
    dragDistance = 0;
    createDraggable();
  }

  function createDraggable() {
    if (!dragOverlay.value || !proxyRef.value) return;
    if (draggableInstance) {
      draggableInstance.kill();
      draggableInstance = null;
    }
    if (dblClickListenerAttached) {
      dragOverlay.value.removeEventListener("dblclick", resetCarousel);
      dblClickListenerAttached = false;
    }
    let startPosition = 0;
    draggableInstance = Draggable.create(proxyRef.value, {
      type: "x",
      trigger: dragOverlay.value,
      inertia: true,
      onPress() {
        dragging.value = false;
        dragStarted = false;
        dragDistance = 0;
        resetCarousel();
        startPosition = position.value;
        startX = this.pointerX;
        // Fade hologram out immediately on drag start
        gsap.to(hologramOpacity, {
          value: 0,
          duration: 0.2,
          ease: "power2.in",
        });
        gsap.to(hologramBlur, { value: 12, duration: 0.2, ease: "power2.in" });
      },
      onDrag() {
        dragDistance = this.pointerX - startX;
        if (!dragStarted && Math.abs(dragDistance) > DRAG_THRESHOLD) {
          dragStarted = true;
          dragging.value = true;
        }
        if (!dragStarted) return;
        const itemsDragged = -dragDistance / DRAG_RATIO;
        const newPos =
          (startPosition + itemsDragged + ITEM_COUNT * 100) % ITEM_COUNT;
        position.value = newPos;
        currentIndex.value = Math.round(newPos) % ITEM_COUNT;
      },
      onThrowUpdate() {
        if (!dragStarted) return;
        dragDistance = this.pointerX - startX;
        const itemsDragged = -dragDistance / DRAG_RATIO;
        const newPos =
          (startPosition + itemsDragged + ITEM_COUNT * 100) % ITEM_COUNT;
        position.value = newPos;
        currentIndex.value = Math.round(newPos) % ITEM_COUNT;
      },
      onRelease() {
        if (!dragStarted) {
          // Restore hologram if no real drag happened
          gsap.to(hologramOpacity, {
            value: 1,
            duration: 0.25,
            ease: "power2.out",
          });
          gsap.to(hologramBlur, {
            value: 0,
            duration: 0.25,
            ease: "power2.out",
          });
          this.endDrag();
          return;
        }
        dragging.value = false;
        const itemsDragged = -dragDistance / DRAG_RATIO;
        let targetPos = Math.round(startPosition + itemsDragged);
        targetPos = ((targetPos % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT;
        gsap.to(position, {
          value: targetPos,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            currentIndex.value = Math.round(position.value) % ITEM_COUNT;
          },
          onComplete: () => {
            position.value = targetPos;
            currentIndex.value = targetPos;
            // Switch hologram to the newly active item and fade back in
            hologramSrc.value = getHologramImage(targetPos);
            gsap.to(hologramOpacity, {
              value: 1,
              duration: 0.35,
              ease: "power2.out",
            });
            gsap.to(hologramBlur, {
              value: 0,
              duration: 0.35,
              ease: "power2.out",
            });
          },
        });
        this.endDrag();
      },
    })[0];
    dragOverlay.value.addEventListener("dblclick", resetCarousel);
    dblClickListenerAttached = true;
  }

  function updateViewport() {
    viewport.value.width = window.innerWidth;
    viewport.value.height = window.innerHeight;
    rootFontSize = getRootFontSize();
  }

  function resetCarousel() {
    const nearestPosition = Math.round(position.value);
    position.value = nearestPosition;
    currentIndex.value = nearestPosition % ITEM_COUNT;
  }

  // Resolve hologram image for a given item index
  function getHologramImage(index) {
    const safeIndex = ((index % items.length) + items.length) % items.length;
    const item = items[safeIndex];
    if (item && typeof item.hologramSrc === "string" && item.hologramSrc) {
      return item.hologramSrc;
    }
    return "/orbital/hologram/ap-holo.png";
  }

  // Hologram animations removed from composable

  // Initialize hologram source immediately to avoid empty NuxtImg src during SSR/hydration
  // Use the currentIndex (defaults to 0) so the first item's hologram is shown by default
  hologramSrc.value = getHologramImage(0);

  onMounted(async () => {
    await nextTick();
    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    gsap.set(carouselRef.value, { opacity: 0, visibility: "hidden" });
    ready.value = true;
    await nextTick();
    gsap.to(carouselRef.value, {
      opacity: 1,
      visibility: "visible",
      duration: 0.7,
      ease: "power2.out",
    });
    resetCarousel();
    createDraggable();
    // Initialize hologram for active item
    hologramSrc.value = getHologramImage(currentIndex.value);
  });

  onBeforeUnmount(() => {
    if (draggableInstance) {
      draggableInstance.kill();
      draggableInstance = null;
    }
    if (dragOverlay.value && dblClickListenerAttached) {
      dragOverlay.value.removeEventListener("dblclick", resetCarousel);
      dblClickListenerAttached = false;
    }
    gsap.killTweensOf(position);
    window.removeEventListener("resize", updateViewport);
  });

  return {
    currentIndex,
    position,
    dragging,
    viewport,
    ready,
    items,
    dragOverlay,
    carouselRef,
    proxyRef,
    getItemProps,
    handlePickActive,
    hologramSrc,
    hologramOpacity,
    hologramBlur,
  };
}
