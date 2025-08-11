<script setup>
// Props for the carousel item (JS + JSDoc)
const props = defineProps({
  /** @type {boolean} */ active: { type: Boolean, default: false },
  /** @type {string} */ name: { type: String, default: "" },
  /** @type {string} */ title: { type: String, default: "" },
  /** @type {string} */ showTitle: { type: String, default: "" },
  /** @type {string} */ imageSrc: {
    type: String,
    default: "/Image-component-3.png",
  },
});
</script>

<template>
  <!-- Aspect-ratio container ensures SVG and image always scale together -->
  <div class="orbital-item-container">
    <!-- SVG frame and gradient background -->
    <div class="orbital-item__svg-frame">
      <OrbitalOutlineGradientSVG class="orbital-item__svg-gradient" />
      <OrbitalCarouselShapeSVG class="orbital-item__svg-shape-frame" />
    </div>
    <!-- Image, fades out when active -->
    <transition name="fade">
      <NuxtImg
        v-if="!active"
        :src="imageSrc"
        alt="mentor"
        class="orbital-item__image"
        draggable="false"
        format="webp"
        densities="x1 x2"
        sizes="(min-width: 1024px) 320px, 200px"
        :preload="false"
      />
    </transition>
    <!-- Overlay content, fades in when active -->
    <transition name="fade">
      <div v-if="active" class="orbital-item__overlay">
        <OrbitalCarouselShapeSVG class="orbital-item__svg-shape-filled" />
        <div class="orbital-item__overlay-inner">
          <IconBulbSVG class="orbital-item__icon-bulb" />
          <div class="orbital-item__name">{{ name }}</div>
          <!-- <div class="title">{{ title }}</div> -->
          <div class="orbital-item__show-title">{{ showTitle }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped></style>
