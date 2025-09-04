<template>
  <NuxtLink to="/" aria-label="Go to home page" title="Home">
    <div
      ref="containerRef"
      class="logo-horizontal w-full h-full"
      role="img"
      aria-label="TastySites wordmark"
    >
      <!-- The decorative SVG is hidden from accessibility tree; the label above is used instead -->
      <LogoHorizontalSmallSVG
        ref="svgComponentRef"
        aria-hidden="true"
        focusable="false"
      />
    </div>
  </NuxtLink>
</template>

<script setup>
const { $gsap } = useNuxtApp();

// Standard container/timeline refs
const containerRef = ref(null);
const timeline = ref(null);
// GSAP context for scoped animations & automatic cleanup
let gsapCtx = null;

// Ref to the SVG component
const svgComponentRef = ref(null);

// Props for consistency with Project* components
const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `logo-horizontal-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: { type: Boolean, default: true },
  delaySeconds: { type: Number, default: 3.4 }, // play after 3s
});

// Build the entry animation (reverse of MorphingLogo scatter)
const createAnimation = () => {
  const svg = svgComponentRef.value;
  const textGroup = svg?.textRef;

  if (!textGroup) {
    console.error("LogoHorizontal: SVG refs not found");
    return null;
  }

  // Collect path arrays
  const allTextPaths = Array.from(textGroup.querySelectorAll("path"));
  const text1Paths = allTextPaths.slice(0, 5);
  const text2Paths = allTextPaths.slice(5, 10);

  // Initial scattered state and hidden container
  $gsap.set(containerRef.value, { visibility: "hidden" });
  $gsap.set(text1Paths, { y: 100, opacity: 0 });
  $gsap.set(text2Paths, { y: -100, opacity: 0 });

  // Show after positions are set to avoid FOUC
  $gsap.set(containerRef.value, { visibility: "visible" });

  const tl = $gsap.timeline({
    id: "logo-horizontal-entry-animation",
    paused: true,
    delay: props.delaySeconds,
  });

  // Animate elements back to original positions
  tl.to(text1Paths, {
    y: 0,
    opacity: 1,
    stagger: 0.025,
    duration: 1.5,
    ease: "power2.out",
  });
  tl.to(
    text2Paths,
    { y: 0, opacity: 1, stagger: -0.025, duration: 1.5, ease: "power2.out" },
    "<"
  );

  timeline.value = tl;
  return tl;
};

onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation();
      if (props.autoPlay) tl && tl.play();
    }, containerRef.value);
  });
});

onUnmounted(() => {
  if (gsapCtx) gsapCtx.revert();
});

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

<style scoped>
.logo-horizontal {
  visibility: hidden; /* Hide initially until JS sets positions */
}
</style>
