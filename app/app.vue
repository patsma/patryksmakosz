<template>
  <div class="min-h-screen">
    <!-- Infinite Drag Grid Component -->
    <!-- <InfiniteDragGrid /> -->

    <MorphingLogo
      class="fixed z-10 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto"
    />
    <LogoHorizontal
      class="fixed z-10 cursor-pointer left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 w-full h-10"
    />

    <!-- Test the Blueberry component with GSDevTools -->
    <ProjectBlueberry
      ref="blueberryRef"
      :show-dev-tools="true"
      dev-tools-id="blueberry-main"
      class="z-20 bottom-4 right-4 w-96 h-96 rounded-lg shadow-lg"
    />
  </div>
</template>

<script setup>
// Template ref for the ProjectBlueberry component
const blueberryRef = ref(null);
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  appearance: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  overscroll-behavior-x: none; /* Prevent go to previous page */
  overflow: hidden;
}

/* SVG styles */
svg {
  width: 100%;
  height: 100%;
}
</style>
