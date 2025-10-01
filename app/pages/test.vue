<template>
  <section key="test-page" class="pt-header" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test</h1>
    <ProjectAnimationWave
      :autoPlay="true"
      :useScrollTrigger="false"
      :slide-seconds="10"
    />
  </section>
</template>
<script setup>
useHead({
  title: "Test",
  meta: [
    {
      name: "description",
      content:
        "Explore TastySites’ interactive components, animations, and recent work on the test page.",
    },
  ],
});
</script>
