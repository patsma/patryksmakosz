<template>
  <NuxtLink to="/">
    <LogoHorizontalSVG ref="svgRef" class="logo-horizontal" />
  </NuxtLink>
</template>

<script setup>
const { $gsap } = useNuxtApp();

// Ref to the SVG component
const svgRef = ref(null);

// Arrays to store path elements from different groups
const text1Paths = ref([]); // First 5 paths from text group
const text2Paths = ref([]); // Next 5 paths from text group
const rightPaths = ref([]);
const leftPaths = ref([]);

// Initialize path arrays when component mounts
const initializePaths = () => {
  // Get refs from the SVG component
  const textGroup = svgRef.value?.textRef;
  const rightGroup = svgRef.value?.rightRef;
  const leftGroup = svgRef.value?.leftRef;

  if (textGroup && rightGroup && leftGroup) {
    // Get all paths from each group
    const allTextPaths = Array.from(textGroup.querySelectorAll("path"));
    rightPaths.value = Array.from(rightGroup.querySelectorAll("path"));
    leftPaths.value = Array.from(leftGroup.querySelectorAll("path"));

    // Divide text paths into two groups of 5 paths each
    text1Paths.value = allTextPaths.slice(0, 5); // First 5 paths
    text2Paths.value = allTextPaths.slice(5, 10); // Next 5 paths

    // console.log("LogoHorizontal paths initialized:", {
    //   text1: text1Paths.value.length,
    //   text2: text2Paths.value.length,
    //   right: rightPaths.value.length,
    //   left: leftPaths.value.length,
    // });

    // Set initial scattered positions immediately (hidden state)
    $gsap.set(text1Paths.value, { y: 100, opacity: 0 });
    $gsap.set(text2Paths.value, { y: -100, opacity: 0 });
    $gsap.set(rightPaths.value, { x: 100, opacity: 0 });
    $gsap.set(leftPaths.value, { x: -100, opacity: 0 });

    // Show the logo container now that positions are set
    $gsap.set(".logo-horizontal", { visibility: "visible" });

    // Start animation with delay
    startReversedEntryAnimation();
  } else {
    console.error("SVG refs not found in LogoHorizontal");
  }
};

// Start reversed entry animation (opposite of MorphingLogo)
const startReversedEntryAnimation = () => {
  const tl = $gsap.timeline({
    id: "logo-horizontal-entry-animation",
    delay: 3, // 3 second delay to play after MorphingLogo
  });

  // Animate elements back to their original positions
  tl.to(text1Paths.value, {
    y: 0,
    opacity: 1,
    stagger: 0.025,
    duration: 1.5,
    ease: "power2.out",
  });
  tl.to(
    text2Paths.value,
    {
      y: 0,
      opacity: 1,
      stagger: -0.025,
      duration: 1.5,
      ease: "power2.out",
    },
    "<"
  );
  tl.to(
    rightPaths.value,
    {
      x: 0,
      opacity: 1,
      stagger: 0.025,
      duration: 1.5,
      ease: "power2.out",
    },
    "<"
  );
  tl.to(
    leftPaths.value,
    {
      x: 0,
      opacity: 1,
      stagger: 0.025,
      duration: 1.5,
      ease: "power2.out",
    },
    "<"
  );
};

// Start the animation sequence when component mounts
onMounted(() => {
  initializePaths();
});
</script>

<style scoped>
.logo-horizontal {
  visibility: hidden; /* Hide initially until JS sets positions */
}
</style>
