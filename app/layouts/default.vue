<template>
  <div
    id="smooth-wrapper"
    class="min-h-screen"
    style="
      /* position: fixed; */
      /* inset: 0; */
      /* height: 100svh; */
      /* width: 100vw; */
      /* overflow: hidden; */
    "
  >
    <!--
    Default layout with GSAP ScrollSmoother structure.
    - Keeps fixed UI outside transformed content to avoid position:fixed issues
    - Provides #smooth-wrapper and #smooth-content for the plugin to hook into
  -->
    <MorphingLogo
      class="fixed z-10 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto"
    />
    <LogoHorizontal
      class="fixed z-10 cursor-pointer left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 w-full h-10"
    />

    <div id="smooth-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
// No script needed for simple structural layout
</script>
