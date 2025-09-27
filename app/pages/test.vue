<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test</h1>
    <p>
      Test lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
      minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
      ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </p>
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
// Use plain layout for testing purposes
definePageMeta({
  layout: "plain",
});
</script>
