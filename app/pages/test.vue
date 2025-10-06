<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test - Catalyst Animation</h1>
    <ProjectCatalyst
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
  title: "Test - Catalyst Animation",
  meta: [
    {
      name: "description",
      content: "Testing Catalyst animation component with bouncing circles and text.",
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
