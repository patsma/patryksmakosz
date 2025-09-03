import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure Draggable is registered once in client
try {
  gsap.registerPlugin(Draggable, ScrollTrigger);
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
 * @property {number} [verticalOffset]
 * @property {number} [verticalOffsetFactor]
 * @property {number} [itemScale]
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
 * @property {number} [verticalOffsetFactor]
 * @property {number} [itemScale]
 * @property {Array<Record<string, any>>} [items]
 */

export const defaultBreakpointConfig = [
  {
    minWidth: 0,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 320,
    minOrbitY: 180,
    frontMargin: 1.2,
    backMargin: 0.9,
    verticalOffsetFactor: 0.12,
    itemScale: 0.55,
  },
  {
    minWidth: 768,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 420,
    minOrbitY: 180,
    frontMargin: 1.4,
    backMargin: 0.9,
    verticalOffsetFactor: 0.12,
    itemScale: 0.75,
  },
  {
    minWidth: 1200,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 640,
    minOrbitY: 200,
    frontMargin: 1.4,
    backMargin: 0.9,
    verticalOffsetFactor: 0.12,
    itemScale: 1,
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
  // Slightly more compact sizes to suit icon-only items
  const BASE_SIZES_PX = [
    { width: 320, height: 284 },
    { width: 256, height: 228 },
    { width: 220, height: 192 },
    { width: 172, height: 152 },
    { width: 132, height: 120 },
    { width: 116, height: 106 },
  ];
  const SMALLEST_PX = { width: 96, height: 86 };
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

  // --- Auto-rotate ---
  let autoRotateTimer = null; // gsap.DelayedCall instance
  let autoRotateTween = null; // gsap.Tween instance driving smooth step
  const AUTO_ROTATE_DELAY_SEC = 2.8; // delay between steps
  const AUTO_ROTATE_TWEEN_SEC = 0.8; // tween duration per step
  // Visibility + viewport state
  const isInView = ref(true);
  const isPageVisible = ref(true);
  let scrollTriggerInstance = null;
  let handleVisibility = null;
  let handleBlur = null;
  let handleFocus = null;

  function pauseAutoRotate() {
    if (autoRotateTimer && typeof autoRotateTimer.kill === "function") {
      autoRotateTimer.kill();
    }
    autoRotateTimer = null;
    // Stop any ongoing tween on position (e.g., in-flight auto step)
    gsap.killTweensOf(position);
    if (autoRotateTween && typeof autoRotateTween.kill === "function") {
      autoRotateTween.kill();
    }
    autoRotateTween = null;
  }

  function animateStepBy(steps, duration = AUTO_ROTATE_TWEEN_SEC, onDone) {
    // Simulate a user drag by smoothly increasing a proxy value and mapping
    // it to the same math the onDrag handler uses (position in items space).
    const startPosition = position.value;
    const proxy = { p: 0 };
    // Pre-fade holo text during motion (no blur for performance)
    gsap.to(hologramOpacity, { value: 0, duration: 0.2, ease: "power2.in" });
    autoRotateTween = gsap.to(proxy, {
      p: steps,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const newPos =
          (startPosition + proxy.p + ITEM_COUNT * 100) % ITEM_COUNT;
        position.value = newPos;
        currentIndex.value = Math.round(newPos) % ITEM_COUNT;
      },
      onComplete: () => {
        // Snap to nearest integer index at the end of step
        const targetPos =
          ((Math.round(position.value) % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT;
        position.value = targetPos;
        currentIndex.value = targetPos;
        hologramSrc.value = getHologramImage(targetPos);
        gsap.to(hologramOpacity, {
          value: 1,
          duration: 0.35,
          ease: "power2.out",
        });
        // No blur restores
        autoRotateTween = null;
        if (typeof onDone === "function") onDone();
      },
    });
  }

  function scheduleNextAutoRotate() {
    pauseAutoRotate();
    autoRotateTimer = gsap.delayedCall(AUTO_ROTATE_DELAY_SEC, () => {
      if (dragging.value) {
        scheduleNextAutoRotate();
        return;
      }
      animateStepBy(1, AUTO_ROTATE_TWEEN_SEC, () => {
        scheduleNextAutoRotate();
      });
    });
  }

  function startAutoRotate() {
    // Only start if visible and not already running
    if (dragging.value) return;
    if (!isInView.value) return;
    if (!isPageVisible.value) return;
    if (autoRotateTimer || autoRotateTween) return;
    scheduleNextAutoRotate();
  }

  // --- Breakpoint Config ---
  // Use provided breakpoints if any, otherwise our defaults.
  // Always ensure we have a mobile (minWidth: 0) entry.
  function ensureMobileBreakpoint(config) {
    const source =
      Array.isArray(config) && config.length > 0
        ? config
        : defaultBreakpointConfig;
    const hasMobile = source.some((c) => (c.minWidth || 0) === 0);
    if (hasMobile) return source;
    return [
      // prepend our default mobile to guarantee a match on phones
      { ...defaultBreakpointConfig[0] },
      ...source,
    ];
  }
  const breakpointConfig = ensureMobileBreakpoint(options.breakpointConfig);

  // Pick the most specific config where viewport.width >= minWidth.
  // If none match (e.g. smaller than the smallest minWidth), fall back to the
  // smallest config instead of falling back to raw options.
  const selectedConfig = computed(() => {
    if (!Array.isArray(breakpointConfig) || breakpointConfig.length === 0)
      return {};
    const sortedAsc = [...breakpointConfig].sort(
      (a, b) => a.minWidth - b.minWidth
    );
    const match = sortedAsc
      .filter((cfg) => viewport.value.width >= (cfg.minWidth || 0))
      .pop();
    return match || sortedAsc[0] || {};
  });

  // --- Orbit Sizes (rem) ---
  const ORBIT_X = computed(() => {
    // Use the smaller viewport dimension for proportional scaling, like Canvas/SVG
    // This keeps the ellipse proportion more consistent across aspect ratios
    rootFontSize = getRootFontSize();
    const minDim = Math.min(viewport.value.width, viewport.value.height);
    return Math.max(
      (minDim * (selectedConfig.value.orbitXFactor ?? 0.7)) / rootFontSize,
      (selectedConfig.value.minOrbitX ?? 600) / rootFontSize
    );
  });
  const ORBIT_Y = computed(() => {
    // Also derive Y radius from the smaller dimension for consistency
    rootFontSize = getRootFontSize();
    const minDim = Math.min(viewport.value.width, viewport.value.height);
    return Math.max(
      (minDim * (selectedConfig.value.orbitYFactor ?? 0.38)) / rootFontSize,
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
  const verticalOffsetPx = computed(() => {
    // If explicit px offset is provided via props or config, prefer it
    if (typeof selectedConfig.value.verticalOffset === "number") {
      return selectedConfig.value.verticalOffset;
    }
    if (typeof options.verticalOffset === "number") {
      return options.verticalOffset;
    }
    // Otherwise use a responsive factor of the smaller dimension
    const minDim = Math.min(viewport.value.width, viewport.value.height);
    const factor = selectedConfig.value.verticalOffsetFactor ?? 0.12;
    return Math.round(minDim * factor);
  });
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

  // Convenience computed for the currently active item's layout props
  const activeProps = computed(() => getItemProps(currentIndex.value));
  const activeAnchor = computed(() => {
    // Anchor near the active item's top center, with an adaptive offset
    const a = activeProps.value;
    // Offset scales with item height but has an upper limit for very large screens
    const offsetRem = Math.min(8, a.size.height * 0.6);
    // Pin X to viewport center to avoid any horizontal jitter across item changes
    rootFontSize = getRootFontSize();
    const centerXRem = viewport.value.width / 2 / rootFontSize;
    return {
      left: +centerXRem.toFixed(4),
      top: +(a.y - offsetRem).toFixed(4),
    };
  });

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
        // Pause autorotation and stop any in-flight tweens immediately
        pauseAutoRotate();
        resetCarousel();
        startPosition = position.value;
        startX = this.pointerX;
        // Fade hologram out immediately on drag start (no blur)
        gsap.to(hologramOpacity, {
          value: 0,
          duration: 0.2,
          ease: "power2.in",
        });
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
          // Restore hologram if no real drag happened (no blur)
          gsap.to(hologramOpacity, {
            value: 1,
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
            // Resume autorotation after a small delay buffer
            startAutoRotate();
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

  // Initialize hologram source immediately to avoid empty NuxtImg src during SSR/hydration
  // Use the currentIndex (defaults to 0) so the first item's hologram is shown by default
  hologramSrc.value = getHologramImage(0);

  onMounted(async () => {
    await nextTick();
    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    // Track page visibility
    handleVisibility = () => {
      isPageVisible.value = document.visibilityState === "visible";
      if (!isPageVisible.value) pauseAutoRotate();
      else startAutoRotate();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    // Track focus/blur for extra safety
    handleBlur = () => pauseAutoRotate();
    handleFocus = () => startAutoRotate();
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    // ScrollTrigger to pause when off-screen
    try {
      if (carouselRef.value) {
        scrollTriggerInstance = ScrollTrigger.create({
          trigger: carouselRef.value,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => {
            isInView.value = true;
            startAutoRotate();
          },
          onEnterBack: () => {
            isInView.value = true;
            startAutoRotate();
          },
          onLeave: () => {
            isInView.value = false;
            pauseAutoRotate();
          },
          onLeaveBack: () => {
            isInView.value = false;
            pauseAutoRotate();
          },
        });
        ScrollTrigger.refresh();
      }
    } catch (e) {}
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
    hologramSrc.value = getHologramImage(currentIndex.value);
    // Kick off gentle autorotation
    startAutoRotate();
    // Initialize visibility state
    isPageVisible.value =
      typeof document !== "undefined"
        ? document.visibilityState === "visible"
        : true;
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
    pauseAutoRotate();
    window.removeEventListener("resize", updateViewport);
    try {
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
    } catch (e) {}
    if (handleVisibility)
      document.removeEventListener("visibilitychange", handleVisibility);
    if (handleBlur) window.removeEventListener("blur", handleBlur);
    if (handleFocus) window.removeEventListener("focus", handleFocus);
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
    activeProps,
    activeAnchor,
  };
}
