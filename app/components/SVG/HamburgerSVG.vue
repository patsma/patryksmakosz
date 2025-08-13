<template>
  <svg
    ref="rootRef"
    width="100%"
    height="100%"
    viewBox="0 0 57 57"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xml:space="preserve"
    xmlns:serif="http://www.serif.com/"
    style="fill-rule: evenodd; clip-rule: evenodd; stroke-miterlimit: 1"
  >
    <g transform="matrix(1,0,0,1,-95.4594,-1234.81)">
      <g transform="matrix(1,0,0,1,-127.777,-0.812396)">
        <g id="hamburger" transform="matrix(1,0,0,1,41.5058,4.39548)">
          <g
            id="hamburgerBottom"
            transform="matrix(0.0943663,0,0,1,190.381,8.25166)"
          >
            <path
              ref="bottomPathRef"
              d="M-1.966,1257.85L421.914,1257.85"
              style="
                fill: none;
                stroke: var(--color-black);
                stroke-width: 5.63px;
              "
            />
          </g>
          <g
            id="hamburgerBottomOpened"
            transform="matrix(0.0667271,-0.0667271,0.707107,0.707107,-693.249,384.271)"
            style="opacity: 0"
          >
            <path
              ref="bottomOpenedPathRef"
              d="M-1.966,1257.85L421.914,1257.85"
              style="
                fill: none;
                stroke: var(--color-black);
                stroke-width: 5.63px;
              "
            />
          </g>
          <g
            id="hamburgerTop"
            transform="matrix(0.0943663,0,0,1,190.381,-4.56178)"
          >
            <path
              ref="topPathRef"
              d="M-1.966,1257.85L421.914,1257.85"
              style="
                fill: none;
                stroke: var(--color-black);
                stroke-width: 5.63px;
              "
            />
          </g>
          <g
            id="hamburgerTopOpened"
            transform="matrix(0.0667271,0.0667271,-0.707107,0.707107,1085.62,356.249)"
            style="opacity: 0"
          >
            <path
              ref="topOpenedPathRef"
              d="M-1.966,1257.85L421.914,1257.85"
              style="
                fill: none;
                stroke: var(--color-black);
                stroke-width: 5.63px;
              "
            />
          </g>
          <g id="hamburgerCircle" transform="matrix(1,0,0,1,86.2708,-3.58309)">
            <circle
              ref="circleRef"
              cx="123.925"
              cy="1263.28"
              r="25.637"
              style="fill: none; stroke: var(--color-black); stroke-width: 4px"
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup>
// Expose plain template refs only; the parent handles conversions and morph data.
const rootRef = ref(null);
const circleRef = ref(null);
const topPathRef = ref(null);
const bottomPathRef = ref(null);
const topOpenedPathRef = ref(null);
const bottomOpenedPathRef = ref(null);

defineExpose({
  rootRef,
  circleRef,
  topPathRef,
  bottomPathRef,
  topOpenedPathRef,
  bottomOpenedPathRef,
});
</script>

<style scoped></style>
