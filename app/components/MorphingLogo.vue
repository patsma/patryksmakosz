<template>
  <div class="morphing-logo">
    <MorphingLogoSVG />
  </div>
</template>

<script setup>
const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
// Arrays to store path elements
const circlePaths = ref([]);
const logoPaths = ref([]);

// Morph animation function
const startMorphAnimation = () => {
  // MorphSVGPlugin.convert convert all shapes to path
  $MorphSVGPlugin.convertToPath("circle, rect, polygon");

  // Get all path elements from both groups within the single SVG
  const circleDivided = document.querySelector("#loaderCircleDivided");
  const logoHorizontal = document.querySelector("#LogoHorizontal");

  if (!circleDivided || !logoHorizontal) {
    console.error("SVG groups not found");
    return;
  }

  // Get all paths from both groups
  circlePaths.value = Array.from(circleDivided.querySelectorAll("path"));
  logoPaths.value = Array.from(logoHorizontal.querySelectorAll("path"));

  // Hide logo group initially
  // $gsap.set(logoHorizontal, { opacity: 0 });

  // Simple timeline that morphs circle paths into logo paths
  const tl = $gsap.timeline({
    // repeat: -1,
    // yoyo: true,
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

  // $GSDevTools.create({
  //   animation: tl,
  //   minimal: true,
  // });
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
