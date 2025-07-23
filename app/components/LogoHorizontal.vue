<template>
  <LogoHorizontalSVG class="opacity-0 logo-horizontal" />
</template>

<script setup>
const { $gsap } = useNuxtApp();
const { createAnimation, waitForAnimation } = useAnimationManager();

// Start fade-in animation when morphing logo completes
const startFadeInAnimation = async () => {
  // Wait for morphing logo to complete
  await waitForAnimation("morphingLogo");

  // Create fade-in animation
  createAnimation("logoHorizontal", () => {
    return $gsap.timeline().fromTo(
      ".logo-horizontal",
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }
    );
  });
};

// Start the animation sequence when component mounts
onMounted(() => {
  startFadeInAnimation();
});
</script>

<style scoped></style>
