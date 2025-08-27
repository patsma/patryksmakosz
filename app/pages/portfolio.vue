<template>
  <div>
    <h1 class="sr-only">Portfolio</h1>
    <!-- <OppositeDirectionMarquees />
    <SimultaneousWords
      theme="light"
      paragraph="David Hockney (1937) is a British artist renowned for his vibrant use of color and innovative exploration of perspective. He is best known for his paintings of California swimming pools which capture light and atmosphere with striking simplicity."
      :pin-height-vh="500"
    /> -->
    <ProjectVibeuu :show-dev-tools="true" />
    <!-- <ProjectZaksa :show-dev-tools="true" />
    <ProjectInfOrca :show-dev-tools="true" />
    <ProjectWorkingJobsVyne :show-dev-tools="true" />
    <ProjectSpectrum :show-dev-tools="true" />
    <ProjectArtTech :show-dev-tools="true" />
    <ProjectBlueberry :show-dev-tools="true" /> -->
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
