<template>
  <svg
    ref="svgRootRef"
    width="100%"
    height="100%"
    viewBox="0 0 683 579"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xml:space="preserve"
    xmlns:serif="http://www.serif.com/"
    style="
      fill-rule: evenodd;
      clip-rule: evenodd;
      stroke-linejoin: round;
      stroke-miterlimit: 2;
    "
  >
    <g transform="matrix(1,0,0,1,-6255.04,-164.002)">
      <g id="Artboard2" transform="matrix(1,0,0,1,-0.445235,0)">
        <rect
          x="6081.44"
          y="0"
          width="1103.64"
          height="2006.88"
          style="fill: none"
        />
        <g id="sentenceHi">
          <g
            id="letterH"
            transform="matrix(66.0274,0,0,66.0274,-426908,-29810.1)"
          >
            <path
              d="M6567.34,462.718L6566.16,462.718L6566.16,458.806L6561.53,458.806L6561.53,462.718L6560.36,462.718L6560.36,454.12L6561.53,454.12L6561.53,457.954L6566.16,457.954L6566.16,454.12L6567.34,454.12L6567.34,462.718Z"
              style="fill: white; fill-rule: nonzero"
            />
          </g>
          <g
            id="letterL"
            transform="matrix(66.0274,0,0,66.0274,-426908,-29810.1)"
          >
            <rect
              x="6569.39"
              y="456.64"
              width="1.068"
              height="6.078"
              style="fill: white; fill-rule: nonzero"
            />
          </g>
          <g
            id="circle"
            class="opacity-0"
            transform="matrix(66.0274,0,0,66.0274,-426908,-29810.1)"
          >
            <path
              d="M6570.69,454.732C6570.69,454.836 6570.67,454.933 6570.63,455.023C6570.59,455.113 6570.53,455.193 6570.46,455.263C6570.39,455.333 6570.31,455.388 6570.22,455.428C6570.13,455.468 6570.03,455.488 6569.93,455.488C6569.82,455.488 6569.73,455.468 6569.64,455.428C6569.55,455.388 6569.47,455.333 6569.4,455.263C6569.33,455.193 6569.27,455.113 6569.23,455.023C6569.19,454.933 6569.17,454.836 6569.17,454.732C6569.17,454.628 6569.19,454.529 6569.23,454.435C6569.27,454.341 6569.33,454.259 6569.4,454.189C6569.47,454.119 6569.55,454.064 6569.64,454.024C6569.73,453.984 6569.82,453.964 6569.93,453.964C6570.03,453.964 6570.13,453.984 6570.22,454.024C6570.31,454.064 6570.39,454.119 6570.46,454.189C6570.53,454.259 6570.59,454.341 6570.63,454.435C6570.67,454.529 6570.69,454.628 6570.69,454.732Z"
              style="fill: rgb(0, 32, 91); fill-rule: nonzero"
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup>
// Expose the root <svg> element so parent components can scope IDs and query nodes
const svgRootRef = ref(null);
defineExpose({ svgRootRef });
</script>

<style></style>
