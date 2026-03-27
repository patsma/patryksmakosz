<template>
  <div class="min-h-screen pt-header bg-white">
    <!-- Plain layout without ScrollSmoother for testing and comparison -->
    <header class="site-header" role="banner" aria-label="Site header">
      <div class="site-header__inner">
        <div class="site-header__logo">
          <LogoHorizontalSmall />
        </div>
        <HamburgerMenu />
      </div>
    </header>
    <slot />
  </div>
</template>

<script setup>
// No script required
</script>
