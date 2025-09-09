<template>
  <NuxtLink to="/" aria-label="Go to home page" title="Home">
    <div
      ref="containerRef"
      class="logo-horizontal w-full h-full"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
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

// Hover timeline reference to prevent stacking animations
const hoverTimelineRef = ref(null);

/**
 * Gentle randomized hover animations for the small logo using GSAP.
 * We keep effects subtle and short; they yoyo back to neutral.
 */

// Palette for stroke color pulses on hover (soft, accessible colors)
const strokePalette = [
  "#111827", // Gray-900
  "#0ea5e9", // Sky-500
  "#a78bfa", // Violet-400
  "#f59e0b", // Amber-500
  "#ef4444", // Red-500
  "#10b981", // Emerald-500
];
const pickRandomColor = () =>
  strokePalette[Math.floor(Math.random() * strokePalette.length)];

/**
 * @returns {SVGElement|null}
 */
const getTextGroup = () => svgComponentRef.value?.textRef || null;

/**
 * @returns {SVGPathElement[]}
 */
const getAllTextPaths = () => {
  const textGroup = getTextGroup();
  return textGroup ? Array.from(textGroup.querySelectorAll("path")) : [];
};

/**
 * Clear transforms so elements don't remain offset after hover leaves.
 */
const resetTransforms = () => {
  const allTextPaths = getAllTextPaths();
  $gsap.set([containerRef.value, ...allTextPaths].filter(Boolean), {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    skewX: 0,
    skewY: 0,
    transformOrigin: "50% 50%",
    // Also clear stroke styling and dash props used by draw animation
    clearProps: "transform,stroke,strokeDasharray,strokeDashoffset",
  });
};

// Variant 1: Gentle bounce on letters
const hoverVariantBounceText = () => {
  const allTextPaths = getAllTextPaths();
  if (!allTextPaths.length) return null;
  return $gsap.timeline({ defaults: { ease: "power1.out" } }).fromTo(
    allTextPaths,
    { y: 0 },
    {
      y: -3,
      duration: 0.18,
      yoyo: true,
      repeat: 1,
      stagger: { each: 0.01, from: "random" },
    }
  );
};

// Variant 2: Tiny jitter on random subset
const hoverVariantJitterSubset = () => {
  const allTextPaths = getAllTextPaths();
  if (!allTextPaths.length) return null;
  let subset = allTextPaths.filter(() => Math.random() < 0.5);
  if (!subset.length)
    subset = allTextPaths.slice(0, Math.min(3, allTextPaths.length));
  const rnd = $gsap.utils.random;
  return $gsap.timeline({ defaults: { ease: "power1.inOut" } }).to(subset, {
    x: () => rnd(-2, 2, 1),
    y: () => rnd(-1, 1, 1),
    duration: 0.12,
    yoyo: true,
    repeat: 1,
    stagger: { each: 0.01, from: "random" },
  });
};

// Variant 3: Wave-like skew across letters
const hoverVariantWaveSkew = () => {
  const allTextPaths = getAllTextPaths();
  if (!allTextPaths.length) return null;
  return $gsap.timeline({ defaults: { ease: "sine.inOut" } }).to(allTextPaths, {
    skewX: 6,
    duration: 0.14,
    yoyo: true,
    repeat: 1,
    transformOrigin: "50% 50%",
    stagger: 0.01,
  });
};

// Variant 4: Subtle container squish
const hoverVariantSquishContainer = () => {
  if (!containerRef.value) return null;
  return $gsap
    .timeline({ defaults: { ease: "sine.inOut" } })
    .to(containerRef.value, {
      scaleX: 1.02,
      scaleY: 0.97,
      duration: 0.14,
      transformOrigin: "50% 50%",
      yoyo: true,
      repeat: 1,
    });
};

// Variant 5: Stroke color pulse across letters
const hoverVariantStrokeColorPulse = () => {
  const allTextPaths = getAllTextPaths();
  if (!allTextPaths.length) return null;
  return $gsap.timeline({ defaults: { ease: "sine.inOut" } }).to(allTextPaths, {
    stroke: () => pickRandomColor(),
    duration: 0.4,
    yoyo: true,
    repeat: 1,
    stagger: { each: 0.1, from: "random" },
  });
};

// Internal cache for path lengths to avoid layout thrash
const pathLengthCache = new WeakMap();
const getPathLength = (pathEl) => {
  if (pathLengthCache.has(pathEl)) return pathLengthCache.get(pathEl);
  let len = 0;
  try {
    len = pathEl.getTotalLength?.() || 0;
  } catch (e) {
    len = 0;
  }
  pathLengthCache.set(pathEl, len);
  return len;
};

// Variant 6: Draw SVG effect using strokeDasharray/offset (no external plugin)
const hoverVariantDrawSVG = () => {
  const allTextPaths = getAllTextPaths();
  if (!allTextPaths.length) return null;
  // Pre-configure dash for each path
  allTextPaths.forEach((p) => {
    const len = getPathLength(p);
    if (len > 0) {
      $gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    }
  });
  return $gsap.timeline({ defaults: { ease: "power1.out" } }).to(allTextPaths, {
    strokeDashoffset: 0,
    duration: 0.22,
    yoyo: true,
    repeat: 2,
    stagger: 0.012,
  });
};

// Pick a random variant and play
const playRandomHover = () => {
  const variants = [
    hoverVariantBounceText,
    hoverVariantJitterSubset,
    hoverVariantWaveSkew,
    hoverVariantSquishContainer,
    hoverVariantStrokeColorPulse,
    hoverVariantDrawSVG,
  ];
  const pick = variants[Math.floor(Math.random() * variants.length)];
  const tl = pick();
  if (!tl) return null;
  hoverTimelineRef.value = tl;
  return tl;
};

// Mouse events
const handleMouseEnter = () => {
  if (hoverTimelineRef.value) {
    hoverTimelineRef.value.kill();
    hoverTimelineRef.value = null;
  }
  playRandomHover();
};

const handleMouseLeave = () => {
  if (hoverTimelineRef.value) {
    hoverTimelineRef.value.kill();
    hoverTimelineRef.value = null;
  }
  resetTransforms();
};

// Props for consistency with Project* components
const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `logo-horizontal-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: { type: Boolean, default: true },
  delaySeconds: { type: Number, default: 3 }, // play after 3s
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
  if (hoverTimelineRef.value) {
    hoverTimelineRef.value.kill();
    hoverTimelineRef.value = null;
  }
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
