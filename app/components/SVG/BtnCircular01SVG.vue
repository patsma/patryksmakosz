<template>
  <svg
    viewBox="0 0 66 66"
    shape-rendering="geometricPrecision"
    class="btn-svg-circular-01"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="paint0_linear_1767_4113"
        x1="0"
        y1="64"
        x2="76.583"
        y2="39.7686"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(1, 0, 0, 1, 0.999588, 1.000305)"
      >
        <stop style="stop-color: var(--gradient-primary-start)"></stop>
        <stop offset="1" style="stop-color: var(--gradient-primary-end)"></stop>
      </linearGradient>
      <linearGradient
        id="paint0_linear_1767_4110"
        x1="0"
        y1="64"
        x2="76.583"
        y2="39.7686"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(1, 0, 0, 1, 1, 1)"
      >
        <stop style="stop-color: var(--gradient-primary-start)"></stop>
        <stop offset="1" style="stop-color: var(--gradient-primary-end)"></stop>
      </linearGradient>
    </defs>
    <circle
      cx="33"
      cy="33"
      r="31"
      style="fill: var(--color-white)"
      stroke="url(#paint0_linear_1767_4113)"
      stroke-width="2"
      class="gradient-border"
    ></circle>
    <circle
      cx="33"
      cy="33"
      r="31"
      style="fill: var(--color-white); stroke: var(--color-gray-3)"
      stroke-width="2"
      class="solid-border"
    ></circle>
    <circle
      cx="33"
      cy="33"
      r="32"
      fill="url(#paint0_linear_1767_4110)"
      class="gradient-fill"
      ref="paginationGradientFillRefs"
    ></circle>
    <circle
      cx="33"
      cy="33"
      r="32"
      style="fill: var(--color-gray-1)"
      class="solid-fill"
      ref="paginationSolidFillRefs"
    ></circle>
  </svg>
</template>

<script setup></script>

<style scoped></style>
