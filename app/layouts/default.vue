<template>
  <div id="smooth-wrapper" class="min-h-screen">
    <!--
    Default layout with GSAP ScrollSmoother structure.
    - Keeps fixed UI outside transformed content to avoid position:fixed issues
    - Provides #smooth-wrapper and #smooth-content for the plugin to hook into
  -->
    <!-- Accessible skip link: appears on focus to bypass repetitive content -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
    >
      Skip to main content
    </a>
    <MorphingLogo
      class="fixed z-10 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto"
    />
    <LogoHorizontal
      class="fixed z-10 cursor-pointer left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 w-full h-10"
    />
    <HamburgerMenu />

    <div id="smooth-content">
      <!-- Use landmark roles and a main heading region -->
      <header role="banner" aria-label="Site header" class="sr-only">
        <!-- Hidden structural header (visual header is animated logo/menu) -->
        <h1 class="sr-only">TastySites</h1>
      </header>

      <main id="main-content" role="main" tabindex="-1">
        <slot />
      </main>

      <footer role="contentinfo" class="sr-only">
        <p class="sr-only">© TastySites</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
// No script needed for simple structural layout
</script>
