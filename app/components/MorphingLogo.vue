<template>
  <div ref="containerRef" class="morphing-logo">
    <MorphingLogoSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();

// Standard container/timeline refs (align with Project* components)
const containerRef = ref(null);
const timeline = ref(null);

// Ref to the SVG component instance
const svgComponentRef = ref(null);

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
});

/**
 * Build the GSAP timeline using refs from the SVG component
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Convert simple shapes to paths for morph operations
  try {
    $MorphSVGPlugin && $MorphSVGPlugin.convertToPath("circle, rect, polygon");
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

// Lifecycle
onMounted(() => {
  nextTick(() => {
    const tl = createAnimation();
    if (props.autoPlay) tl && tl.play();
  });
});

onUnmounted(() => {
  if (timeline.value) timeline.value.kill();
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
});
</script>

<style>
#LogoHorizontal {
  opacity: 0;
}
</style>
