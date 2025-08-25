<template>
  <div ref="containerRef" class="morphing-logo">
    <!-- Simple in-component full-viewport overlay; no teleport -->
    <div
      v-if="props.useIntroOverlay"
      ref="overlayRef"
      aria-hidden="true"
      class="fixed inset-0 z-[9998] bg-white flex items-center justify-center w-screen h-screen left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div
        ref="pulseCircleRef"
        aria-hidden="true"
        class="rounded-full bg-black morphing-logo__pulse"
      />
    </div>
    <MorphingLogoSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();

// Standard container/timeline refs (align with Project* components)
const containerRef = ref(null);
const timeline = ref(null);

// GSAP context for scoped animations & automatic cleanup
let gsapCtx = null;

// Ref to the SVG component instance
const svgComponentRef = ref(null);

// Intro overlay refs/state
const overlayRef = ref(null);
const pulseCircleRef = ref(null);

// Optional props for dev workflow consistency
const props = defineProps({
  /** @type {boolean} Show GSDevTools */
  showDevTools: { type: Boolean, default: false },
  /** @type {string} GSDevTools id */
  devToolsId: {
    type: String,
    default: () => `morphing-logo-${Math.random().toString(36).slice(2, 9)}`,
  },
  /** @type {boolean} Autoplay on mount */
  autoPlay: { type: Boolean, default: true },
  /** @type {boolean} Show intro overlay + pulsing circle before morph starts */
  useIntroOverlay: { type: Boolean, default: true },
});

/**
 * Build the GSAP timeline using refs from the SVG component
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Convert only shapes inside this SVG to paths for morph operations
  try {
    const svg = svgComponentRef.value;
    const circleDivided = svg?.circleDividedRef;
    const svgRootEl = circleDivided?.closest && circleDivided.closest("svg");
    if ($MorphSVGPlugin && svgRootEl) {
      const shapes = svgRootEl.querySelectorAll("circle, rect, polygon");
      if (shapes && shapes.length) {
        $MorphSVGPlugin.convertToPath(shapes);
      }
    }
  } catch (e) {}

  // Get refs from the SVG component
  const svg = svgComponentRef.value;
  const circleDivided = svg?.circleDividedRef;
  const logoHorizontal = svg?.logoHorizontalRef;
  if (!circleDivided || !logoHorizontal) {
    console.error("MorphingLogo: SVG refs not found");
    return null;
  }

  // Gather paths
  const circlePaths = Array.from(circleDivided.querySelectorAll("path"));
  const logoPaths = Array.from(logoHorizontal.querySelectorAll("path"));

  // Organized slices
  const text2Paths = circlePaths.slice(0, 5);
  const text1Paths = circlePaths.slice(12, 17);
  const shape1Paths = circlePaths.slice(17, 24);
  const shape2Paths = circlePaths.slice(5, 12);

  // Main timeline (paused by default for control parity)
  const tl = $gsap.timeline({ id: "morphing-logo-animation", paused: true });

  // Morph each circle path into corresponding logo path
  for (let i = 0; i < Math.min(circlePaths.length, logoPaths.length); i++) {
    tl.to(
      circlePaths[i],
      { morphSVG: logoPaths[i], duration: 2, ease: "power2.inOut" },
      0
    );
  }

  // Scatter movement while morphing
  tl.to(text1Paths, {
    y: 100,
    stagger: -0.025,
    duration: 2,
    ease: "power2.inOut",
  });
  tl.to(
    text2Paths,
    { y: -100, stagger: 0.025, duration: 2, ease: "power2.inOut" },
    "<"
  );
  tl.to(
    shape1Paths,
    { x: -100, stagger: 0.025, duration: 2, ease: "power2.inOut" },
    "<"
  );
  tl.to(
    shape2Paths,
    { x: 100, stagger: 0.025, duration: 2, ease: "power2.inOut" },
    "<"
  );

  timeline.value = tl;
  return tl;
};

/**
 * Fade out the intro overlay and circle, then hide them (display:none).
 * @returns {GSAPTimeline}
 */
const fadeOutOverlay = () => {
  const tl = $gsap.timeline({ id: "intro-overlay-fade" });
  tl.to(
    pulseCircleRef.value,
    { autoAlpha: 0, duration: 0.45, ease: "power2.out" },
    0
  );
  tl.to(
    overlayRef.value,
    { autoAlpha: 0, duration: 0.5, ease: "power2.out" },
    0
  );
  tl.add(() => {
    if (overlayRef.value) {
      $gsap.set(overlayRef.value, { display: "none" });
    }
  });
  return tl;
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    // Use gsap.context to scope all animations to this component
    // and ensure automatic revert on unmount
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation();

      // When ready: fade overlay, then begin morphing timeline
      if (props.autoPlay && tl) {
        if (props.useIntroOverlay) {
          fadeOutOverlay().eventCallback("onComplete", () => tl.play());
        } else {
          tl.play();
        }
      }
    }, containerRef.value);
  });
});

onUnmounted(() => {
  // Revert all animations and inline styles set within this context
  if (gsapCtx) gsapCtx.revert();
});

// Public API
defineExpose({
  containerRef,
  timeline,
  play: () => timeline.value?.play(),
  pause: () => timeline.value?.pause(),
  restart: () => timeline.value?.restart(),
  reverse: () => timeline.value?.reverse(),
  seek: (time) => timeline.value?.seek(time),
  /** Allow skipping the intro overlay programmatically if needed */
  skipIntro: () => {
    if (overlayRef.value) {
      overlayRef.value.style.display = "none";
    }
  },
});
</script>

<style>
/* Keep hidden until morph completes into the horizontal mark */
#LogoHorizontal {
  opacity: 0;
}

/*
  Size the pulsing circle responsively using viewport units.
  This keeps it slightly larger than the logo and centered.
*/
.morphing-logo__pulse {
  width: min(31vmin, 15rem);
  height: min(31vmin, 15rem);
  /* Pure CSS pulse so it runs before JS/GSAP are ready */
  animation: morphing-logo-pulse 1.4s ease-in-out infinite;
  transform-origin: 50% 50%;
}

@keyframes morphing-logo-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.95;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .morphing-logo__pulse {
    animation: none;
  }
}
</style>
