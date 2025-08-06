<template>
  <div class="loader">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112.06 79.3">
      <defs>
        <mask id="theMask">
          <path
            id="mask1"
            d="M50.83,43.47c-.5,7.17-4.66,10.84-11.62,13.6s-15.53-1.66-18.89-8.31a16.79,16.79,0,0,1,4.49-20.15C30.68,24,39.38,23.89,45,28.76c4.46-9.63,15.87-15.43,26.4-14.2a26.07,26.07,0,0,1,21.9,20.17A26.08,26.08,0,0,1,81,61.82c-9.23,5.23-20.71,5-28.55-2.18"
            fill="none"
            stroke="#fff"
            stroke-linecap="round"
            stroke-miterlimit="10"
            stroke-width="10"
          />
        </mask>
      </defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="blueberry_loader_layer">
          <g id="maskReveal" mask="url(#theMask)">
            <path
              id="blueberry_logo"
              data-name="blueberry  logo"
              d="M67.91,10.45A29.36,29.36,0,0,0,43.67,23.39,20,20,0,1,0,54.75,44.63a4,4,0,0,0-2.46-4.51,3.87,3.87,0,0,0-5,2.34,3.38,3.38,0,0,0-.11.34,12,12,0,0,1-2,5.5h0a9,9,0,0,1-.59.79A12.36,12.36,0,1,1,34.9,29a11.63,11.63,0,0,1,1.67.13l.76.11.26.07c.31.06.62.14.93.23l.14.05A12.31,12.31,0,0,1,46,35.94l1.77-3.83A28.48,28.48,0,0,1,50,28.06c4.22-6.17,10.57-9.84,17.89-9.84A21.43,21.43,0,1,1,54,55.93a24.47,24.47,0,0,1-5.7,5.33A29.2,29.2,0,1,0,67.91,10.45Z"
              fill="#fff"
            />
          </g>
          <circle id="circle1" cx="50.9" cy="43.72" r="3.85" fill="#fff" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
// Get GSAP from Nuxt app
const { $gsap } = useNuxtApp();

/**
 * Simple blueberry loader animation - direct copy from original
 */
function blueberryLoader() {
  // Set loader visible

  // Create timeline with infinite repeat
  const tl = $gsap.timeline({ repeat: -1 });

  // Animation sequence - exact copy from original
  tl.fromTo(
    "#circle1",
    0.9,
    { scale: 0, transformOrigin: "center center" },
    { scale: 1, yPercent: -6, ease: "elastic.out(1, 0.3)" }
  );
  tl.from(
    "#mask1",
    2.5,
    {
      drawSVG: 0,
      ease: "power2.inOut", // Simplified from CustomEase
    },
    "-=0.4"
  );

  // Set time scale
  tl.timeScale(0.9);

  return tl;
}

// Start animation when mounted
onMounted(() => {
  blueberryLoader();
});
</script>

<style scoped>
.loader {
  background-color: #1e2843;
}
</style>
