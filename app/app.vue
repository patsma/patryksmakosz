<template>
  <div class="min-h-screen">
    <!-- Infinite Drag Grid Component -->
    <InfiniteDragGrid />

    <MorphingLogo
      class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto"
    />
    <LogoHorizontal
      class="fixed left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 w-full h-10"
    />
  </div>
</template>

<script setup>
// Simple setup - component auto-imports handle the rest
</script>

<style>
/* Global styles */
svg {
  width: 100%;
  height: 100%;
}
</style>
