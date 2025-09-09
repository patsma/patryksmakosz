<template>
  <div>
    <h1 class="sr-only">Test</h1>
    <ProjectHeroSplitText
      title="PORTFOLIO"
      :show-dev-tools="true"
      :stagger="0.05"
      
    />
  </div>
</template>
<style></style>
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
