<template>
  <div class="min-h-screen">
    <!-- Infinite Component Drag - Testing ProjectBlueberry components in grid -->
    <!-- <InfiniteComponentDrag /> -->
    <CarouselTimeline
      headline="Customer experiences"
      text-under-headline="Short intro text"
      :steps="[
        {
          title: 'Discover',
          content: 'We learn and understand.',
          read_more_link: '#',
        },
        {
          title: 'Design',
          content: 'We design the solution.',
          read_more_link: '#',
        },
        {
          title: 'Deliver',
          content: 'We build and iterate.',
          read_more_link: '#',
        },
      ]"
      :buttons="[{ type: 'outline', link: '#', text: 'View all' }]"
    />
    <CarouselFeaturedCaseStudies
      headline="Featured case studies"
      :alternative-colors="false"
      :gradient-title="true"
      view-all-href="/case-studies"
      :cases="[]"
      id-attr="featured-cases-1"
    />
    <!-- Original components commented out for testing -->
    <!-- <InfiniteDragGrid /> -->

    <MorphingLogo
      class="fixed z-10 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto"
    />
    <LogoHorizontal
      class="fixed z-10 cursor-pointer left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 w-full h-10"
    />

    <!-- Test the Blueberry component with GSDevTools -->
    <!-- <ProjectBlueberry
      class="w-96 h-full"
      :show-dev-tools="true"
      dev-tools-id="blueberry-1"
    /> -->
  </div>
</template>

<script setup>
// Template ref for the ProjectBlueberry component
const blueberryRef = ref(null);
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  appearance: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  overscroll-behavior-x: none; /* Prevent go to previous page */
  /* overflow: hidden; */
}

/* SVG styles */
svg {
  width: 100%;
  height: 100%;
}
</style>
