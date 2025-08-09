<template>
  <div class="min-h-screen">
    <OrbitalCarousel
      class="z-10"
      :items="items"
      :breakpoint-config="breakpointConfig"
      :front-margin="1.4"
      :back-margin="1"
    />

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
    <ImageSteppers
      title="Our process"
      copy="Short description that explains the steps."
      image-src="/Image-component-5.png"
      :steps="[
        {
          title: 'Discover',
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
        },
        {
          title: 'Design',
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
        },
        {
          title: 'Deliver',
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
        },
      ]"
      :alternative-colors="false"
      :gradient-title="true"
      :flipped="false"
      :big-title="false"
      :buttons="[{ type: 'filled', link: '#', text: 'Get started' }]"
    />

    <MorphingLogo
      class="fixed z-10 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto"
    />
    <LogoHorizontal
      class="fixed z-10 cursor-pointer left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 w-full h-10"
    />
    <InfiniteComponentDrag />
  </div>
</template>

<script setup>
const breakpointConfig = [
  {
    minWidth: 3800,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 640,
    minOrbitY: 200,
    frontMargin: 1.4,
    backMargin: 1,
    verticalOffset: 400,
    itemScale: 1.6,
  },
  {
    minWidth: 2400,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 640,
    minOrbitY: 200,
    frontMargin: 1.4,
    backMargin: 1,
    verticalOffset: 250,
    itemScale: 1.2,
  },
  {
    minWidth: 2040,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 640,
    minOrbitY: 200,
    frontMargin: 1.4,
    backMargin: 1,
    verticalOffset: 225,
    itemScale: 1.1,
  },
  {
    minWidth: 1890,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 640,
    minOrbitY: 200,
    frontMargin: 1.4,
    backMargin: 1,
    verticalOffset: 160,
    itemScale: 1.1,
  },
  {
    minWidth: 1400,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 640,
    minOrbitY: 200,
    frontMargin: 1.4,
    backMargin: 1,
    verticalOffset: 140,
    itemScale: 1.05,
  },
  {
    minWidth: 1200,
    orbitXFactor: 0.35,
    orbitYFactor: 0.16,
    minOrbitX: 640,
    minOrbitY: 200,
    frontMargin: 1.4,
    backMargin: 1,
    verticalOffset: 225,
    itemScale: 0.9,
  },
];
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
