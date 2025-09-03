<script setup>
// Icon-only item for skills: we keep props minimal and focused on an icon.
// Name can still be used for accessibility/labels.
const props = defineProps({
  /** @type {boolean} */ active: { type: Boolean, default: false },
  /** @type {string} */ name: { type: String, default: "" },
  /** @type {string} */ iconSrc: { type: String, default: "" },
});
</script>

<template>
  <!-- Aspect-ratio container ensures SVG and image always scale together -->
  <div class="orbital-item-container">
    <!-- SVG frame; keep gradient + shape minimal, center icon -->
    <div class="orbital-item__svg-frame">
      <OrbitalOutlineGradientSVG class="orbital-item__svg-gradient" />
      <OrbitalCarouselShapeSVG
        class="orbital-item__svg-shape-frame"
        :class="{ 'is-active': active }"
      />
    </div>

    <!-- Icon-only content (smooth, minimal text) -->
    <div class="orbital-item__icon-wrapper">
      <img
        :src="iconSrc"
        :alt="name + ' icon'"
        class="orbital-item__icon"
        :class="{ 'is-active': active }"
        draggable="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
