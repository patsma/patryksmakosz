<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <!-- GSAP animated element -->
    <div
      ref="animatedBox"
      class="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg cursor-pointer"
      @click="triggerAnimation"
    >
      <div class="flex items-center justify-center h-full text-white font-bold">
        Click me!
      </div>
    </div>

    <!-- Original element -->
    <div class="mt-8">
      <div class="grid h-24 w-24 bg-red-500 rounded">Why</div>
    </div>
  </div>
</template>

<script setup>
// GSAP is available through useNuxtApp() with @hypernym/nuxt-gsap
const { $gsap } = useNuxtApp();
const animatedBox = ref(null);

// Simple GSAP animation
const triggerAnimation = () => {
  $gsap.to(animatedBox.value, {
    rotation: 360,
    scale: 1.2,
    duration: 1,
    ease: "bounce.out",
    yoyo: true,
    repeat: 1,
  });
};
</script>
