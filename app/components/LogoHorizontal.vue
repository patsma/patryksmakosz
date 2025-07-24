<template>
  <LogoHorizontalSVG class="logo-horizontal opacity-0" />
</template>

<script setup>
const { $gsap } = useNuxtApp();
const { startAnimationWithDelay } = useAnimationManager();

// Start fade-in animation with a simple delay
const startFadeInAnimation = () => {
  // Start fade-in animation after 3 seconds (adjust this timing as needed)
  startAnimationWithDelay(
    "logoHorizontal",
    () => {
      return $gsap.timeline().fromTo(
        ".logo-horizontal",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        }
      );
    },
    3
  ); // 3 second delay
};

// Start the animation sequence when component mounts
onMounted(() => {
  startFadeInAnimation();
});
</script>

<style scoped></style>
