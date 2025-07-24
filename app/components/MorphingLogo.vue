<template>
  <div class="morphing-logo">
    <MorphingLogoSVG ref="svgRef" />
  </div>
</template>

<script setup>
const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();

// Use the simple animation manager
const { createAnimation } = useAnimationManager();

// Ref to the SVG component
const svgRef = ref(null);

// Arrays to store path elements
const circlePaths = ref([]);
const logoPaths = ref([]);

// New organized arrays for different parts
const shape1Paths = ref([]); // First 7 paths
const text1Paths = ref([]); // Next 5 paths
const text2Paths = ref([]); // Next 5 paths
const shape2Paths = ref([]); // Final 7 paths

// Morph animation function
const startMorphAnimation = () => {
  // Convert all shapes to path
  $MorphSVGPlugin.convertToPath("circle, rect, polygon");

  // Get refs from the SVG component
  const circleDivided = svgRef.value?.circleDividedRef;
  const logoHorizontal = svgRef.value?.logoHorizontalRef;

  if (!circleDivided || !logoHorizontal) {
    console.error("SVG refs not found");
    return;
  }

  // Get all paths from both groups
  circlePaths.value = Array.from(circleDivided.querySelectorAll("path"));
  logoPaths.value = Array.from(logoHorizontal.querySelectorAll("path"));

  text2Paths.value = circlePaths.value.slice(0, 5);
  text1Paths.value = circlePaths.value.slice(12, 17);
  shape1Paths.value = circlePaths.value.slice(17, 24);
  shape2Paths.value = circlePaths.value.slice(5, 12);
  // Create animation using the simple manager
  createAnimation("morphingLogo", () => {
    const tl = $gsap.timeline({
      id: "morphing-logo-animation",
    });

    // Morph each circle path into corresponding logo path
    for (
      let i = 0;
      i < Math.min(circlePaths.value.length, logoPaths.value.length);
      i++
    ) {
      tl.to(
        circlePaths.value[i],
        {
          morphSVG: logoPaths.value[i],
          duration: 2,
          ease: "power2.inOut",
        },
        0
      );
    }

    // Add text animations
    tl.to(text1Paths.value, {
      y: 100,
      stagger: -0.025,
      duration: 2,
      ease: "power2.inOut",
    });
    tl.to(
      text2Paths.value,
      {
        y: -100,
        stagger: 0.025,
        duration: 2,
        ease: "power2.inOut",
      },
      "<"
    );
    tl.to(
      shape1Paths.value,
      {
        x: -100,
        stagger: 0.025,
        duration: 2,
        ease: "power2.inOut",
      },
      "<"
    );
    tl.to(
      shape2Paths.value,
      {
        x: 100,
        stagger: 0.025,
        duration: 2,
        ease: "power2.inOut",
      },
      "<"
    );

    // $GSDevTools.create({
    //   animation: tl,
    //   minimal: true,
    // });

    return tl;
  });
};

// Start animation when component is mounted
onMounted(() => {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    startMorphAnimation();
  }, 500);
});
</script>

<style>
#LogoHorizontal {
  opacity: 0;
}
</style>
