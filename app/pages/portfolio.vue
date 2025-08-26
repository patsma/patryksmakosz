<template>
  <div>
    <h1 class="sr-only">Portfolio</h1>
    <ProjectZaksa :show-dev-tools="true" />
    <ProjectInfOrca :show-dev-tools="true" />
    <ProjectWorkingJobsVyne :show-dev-tools="true" />
    <ProjectSpectrum :show-dev-tools="true" />
    <ProjectArtTech :show-dev-tools="true" />
    <ProjectBlueberry :show-dev-tools="true" />
  </div>
</template>

<script setup>
useHead({
  title: "Portfolio",
  meta: [
    {
      name: "description",
      content:
        "Browse a selection of TastySites’ case studies and interactive projects.",
    },
  ],
});
</script>
