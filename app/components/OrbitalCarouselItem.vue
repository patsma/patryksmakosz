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
    <div class="svg-frame">
      <LogoGradientSVG class="svg-gradient" />
      <OrbitalCarouselShapeSVG class="svg-shape-frame" />
    </div>
    <!-- Image, fades out when active -->
    <transition name="fade">
      <img
        v-if="!active"
        :src="imageSrc"
        alt="mentor"
        class="mentor-image"
        draggable="false"
      />
    </transition>
    <!-- Overlay content, fades in when active -->
    <transition name="fade">
      <div v-if="active" class="overlay-content">
        <OrbitalCarouselShapeSVG class="svg-shape-filled" />
        <div class="overlay-inner">
          <IconBulbSVG class="icon-bulb" />
          <div class="name">{{ name }}</div>
          <!-- <div class="title">{{ title }}</div> -->
          <div class="show-title">{{ showTitle }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
// Maintain a fixed aspect ratio for the item (triangle shape)
.orbital-item-container {
  position: relative;
  width: 100%;
  aspect-ratio: 356 / 316; // Match the main SVG shape size
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.svg-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

.svg-gradient {
  width: 100%;
  height: 100%;
  display: block;
}

.svg-shape-frame {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  opacity: 0;
}

.mentor-image {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 88%;
  height: 88%;
  object-fit: contain;
  transform: translate(-50%, -48.2%);
  z-index: 2;
  transition: opacity 0.4s;
  pointer-events: none;
}

.overlay-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  pointer-events: none;
}

.svg-shape-filled {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 1;
}

.overlay-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 100%;
  height: 100%;
}

.icon-bulb {
  width: 4.5em;
  height: 4.5em;
  margin-top: 2.5em;
}

.name {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  margin: 0 3.8em;
  margin-top: 3em;
}

.title {
  color: #fff;
  font-size: 0.875em;
  font-weight: 500;
  text-align: center;
  opacity: 0.8;
  margin: 0 3.8em;
  margin-top: 0.5em;
}

.show-title {
  color: #fff;
  font-size: 0.875rem;
  font-weight: 400;
  text-align: center;
  letter-spacing: 0.04em;
  margin: 0 2.65em;
  margin-top: 1.5em;
}

// Fade transition for image/content
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
