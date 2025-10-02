<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test - AeroFlux Animation</h1>
    <ProjectAeroflux
      :autoPlay="true"
      :useScrollTrigger="false"
      :enableParticles="true"
      :timeScale="1"
      :showDevTools="false"
    />
  </section>
</template>

<script setup>
definePageMeta({
  layout: "plain",
});

useHead({
  title: "Test - AeroFlux Animation",
  meta: [
    {
      name: "description",
      content: "Testing AeroFlux animation component with particles background.",
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
