<template>
  <!-- Plain layout without ScrollSmoother for testing and comparison -->
  <div class="min-h-screen">
    <header class="site-header" role="banner" aria-label="Site header">
      <div class="site-header__inner">
        <div class="site-header__logo">
          <LogoHorizontalSmall />
        </div>
        <HamburgerMenu />
      </div>
    </header>
    <div class="pt-header-plus-lg">
      <slot />
    </div>
  </div>
</template>

<script setup>
// No script required
</script>
