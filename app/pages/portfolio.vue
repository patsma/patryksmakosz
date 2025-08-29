<template>
  <div>
    <h1 class="sr-only">Portfolio</h1>
    <ProjectArtTech :show-dev-tools="true" />
    <ProjectFortPrivacy :show-dev-tools="true" />
    <ProjectSpectrum :show-dev-tools="true" />
    <ProjectZaksa :show-dev-tools="true" />
    <ProjectWorkingJobsVyne :show-dev-tools="true" />
    <ProjectInfOrca :show-dev-tools="true" />
    <ProjectPage404 :show-dev-tools="true" />
    <ProjectSliwka :show-dev-tools="true" />
    <ProjectVibeuu :show-dev-tools="true" />
    <ProjectPlayerPrototype :showDevTools="true" />
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
