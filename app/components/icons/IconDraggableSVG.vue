<template>
  <svg viewBox="0 0 75 75" fill="none" xmlns="http://www.w3.org/2000/svg">
    <foreignObject v-if="!isSafari" x="-20" y="-20" width="115" height="115">
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style="height: 100%; width: 100%"
      />
    </foreignObject>
    <circle cx="37.5" cy="37.5" r="37.5" fill="#F9F9F9" fill-opacity="0.12" />
    <path
      d="M34 29L25 37.5L34 46M41 29L50 37.5L41 46"
      stroke="#F9F9F9"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup>
import { ref, onMounted } from "vue";
const isSafari = ref(false);
onMounted(() => {
  const ua = window.navigator.userAgent;
  isSafari.value = /Safari/.test(ua) && !/Chrome|Chromium|Android/.test(ua);
});
</script>

<style scoped></style>
