<template>
  <svg
    ref="svgRootRef"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 852.39 284.46"
  >
    <g id="logoGroup">
      <g id="logoBottom">
        <path d="M332.72,189.52q5.44,40.6,10.88,81.17H445.14V175.57l-17,2.12Z" transform="translate(1 1)" style="fill: #094" />
        <path d="M325.21,190.45h0L156.11,211.69l-6.94,59H335.83Z" transform="translate(1 1)" style="fill: #3fae2a" />
        <path d="M150.27,212.42,54,224.51v46.18h89.7q.25-2.2.5-4.4Z" transform="translate(1 1)" style="fill: #00953a" />
      </g>
      <g id="logoMiddle">
        <path d="M329,162l2.17,16.16,113.95-14.31V116.3l-124-12.9Q325.1,132.69,329,162Z" transform="translate(1 1)" style="fill: #18ad88" />
        <polygon points="324.7 180.08 314.58 103.61 171.69 88.75 158.49 200.95 324.7 180.08" style="fill: #bbd14a" />
        <path d="M151.6,200.69q4-35,7.91-69.91,2.47-21.84,4.95-43.68L54,75.6V212.95Z" transform="translate(1 1)" style="fill: #3fae2a" />
      </g>
      <g id="logoTop">
        <path d="M310.18,21.24l.68,5.07q4.68,35,9.37,69.92l124.92,13V20.3H309.58A1.57,1.57,0,0,1,310.18,21.24Z" transform="translate(1 1)" style="fill: #dddb00" />
        <polygon points="172.51 81.76 313.64 96.44 303.69 21.3 179.61 21.3 172.51 81.76" style="fill: #96c21f" />
        <path d="M165.24,80.11q3.33-29.4,6.65-58.8a1.88,1.88,0,0,1,.48-1H54V68.53Z" transform="translate(1 1)" style="fill: #009ee2" />
      </g>
    </g>
    <g id="farm">
      <path d="M482.35,71.11H509V87.44H482.35v47.21H461.69V20.3h54.64V36.64h-34Z" transform="translate(1 1)" style="fill: #009ee2" />
      <path d="M603.09,134.65H582.25l-3.57-20.75H553.33l-3.56,20.75h-19l21-114.35h30.23ZM556,98.39h19.91l-9.95-57.83Z" transform="translate(1 1)" style="fill: #009ee2" />
      <path d="M668.24,134.65c-1.13-2.94-1.88-4.74-1.88-14v-18c0-10.62-4.13-14.54-13.52-14.54h-7.14v46.56H625.06V20.3h31.17c21.41,0,30.61,8.66,30.61,26.3v9c0,11.77-4.32,19.44-13.52,23.2C683.64,82.54,687,91.2,687,103.12v17.64c0,5.55.19,9.64,2.25,13.89Zm-22.54-98V71.76h8.08c7.7,0,12.39-2.94,12.39-12.08V48.4c0-8.17-3.19-11.76-10.51-11.76Z" transform="translate(1 1)" style="fill: #009ee2" />
      <path d="M756.68,101.49,770.77,20.3H799.5V134.65H780v-82l-14.27,82H746.17l-15.4-80.86v80.86h-18V20.3h28.73Z" transform="translate(1 1)" style="fill: #009ee2" />
    </g>
    <g id="table">
      <path d="M461.75,156.79h63.84v16.33H504v98H483.34v-98h-21.6Z" transform="translate(1 1)" style="fill: #3fae2a" />
      <path d="M594.31,271.13H573.47l-3.56-20.75H544.55L541,271.13H522l21-114.35h30.23Zm-47.13-36.26h19.91l-10-57.83Z" transform="translate(1 1)" style="fill: #3fae2a" />
      <path d="M665.66,183.09v4.08c0,11.76-4.13,19.27-13.33,23,11.08,3.76,15.4,12.41,15.4,24.5V244c0,17.64-10.7,27.11-31.36,27.11H603.88V156.79h31.17C656.46,156.79,665.66,165.44,665.66,183.09Zm-41.12-10v30.22h8.07c7.7,0,12.39-2.94,12.39-12.09v-6.37c0-8.17-3.19-11.76-10.51-11.76Zm0,46.56V254.8h11.83c7,0,10.7-2.78,10.7-11.27v-10c0-10.62-3.94-13.89-13.33-13.89Z" transform="translate(1 1)" style="fill: #3fae2a" />
      <path d="M680.12,156.79h20.66v98h34v16.33H680.12Z" transform="translate(1 1)" style="fill: #3fae2a" />
      <path d="M764.42,205h28.36v16.34H764.42V254.8H800.1v16.33H743.77V156.79H800.1v16.33H764.42Z" transform="translate(1 1)" style="fill: #3fae2a" />
    </g>
  </svg>
</template>

<script setup>
const svgRootRef = ref(null);

defineExpose({ svgRootRef });
</script>
