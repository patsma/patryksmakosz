<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test - Booking Engine Animation</h1>
    <ProjectBookingEngine
      :autoPlay="true"
      :useScrollTrigger="false"
      :timeScale="1"
      :showDevTools="true"
    />
  </section>
</template>

<script setup>
definePageMeta({
  layout: "plain",
});

useHead({
  title: "Test - Booking Engine Animation",
  meta: [
    {
      name: "description",
      content: "Testing Booking Engine animation component with sequential path drawing.",
    },
  ],
});
</script>

<style scoped>
section {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
