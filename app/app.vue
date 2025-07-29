<template>
  <div class="min-h-screen">
    <!-- Infinite Drag Grid Component -->
    <InfiniteDragGrid />

    <!-- <MorphingLogo
      class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto"
    />
    <LogoHorizontal
      class="fixed left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 w-full h-10"
    /> -->
  </div>
</template>

<script setup>
// Simple setup - component auto-imports handle the rest
</script>

<style>
/* Global styles - critical for infinite grid to work */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  appearance: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: #121212;
  color: #f1f1f1;
  overscroll-behavior-x: none; /* Prevent go to previous page */
  overflow: hidden;
}

/* SVG styles */
svg {
  width: 100%;
  height: 100%;
}
</style>
