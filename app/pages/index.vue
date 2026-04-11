<template>
  <div>
    <h1 class="sr-only">Home</h1>
    <InfiniteDragGridSimple />
  </div>
</template>

<script setup>
useHead({
  title: "Home",
  meta: [
    {
      name: "description",
      content:
        "Explore TastySites’ interactive components, animations, and recent work on the home page.",
    },
  ],
  bodyAttrs: { class: "page-home" },
});
</script>
