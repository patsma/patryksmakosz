<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test - Blood Animation</h1>
    <ProjectBlood
      :autoPlay="true"
      :useScrollTrigger="false"
      :timeScale="1.5"
      :showDevTools="true"
    />
  </section>
</template>

<script setup>
definePageMeta({
  layout: "plain",
});

useHead({
  title: "Test - Blood Animation",
  meta: [
    {
      name: "description",
      content: "Testing Blood animation component with blood type drops.",
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
