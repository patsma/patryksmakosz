<template>
  <div>
    <h1 class="sr-only">About</h1>
    <OrbitalCarousel />
    <!-- <SkillsShowcase /> -->
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
    <ProjectPathAnimation />
  </div>
</template>

<script setup>
useHead({
  title: "About",
  meta: [
    {
      name: "description",
      content:
        "Learn about TastySites’ process and approach to crafting interactive experiences.",
    },
  ],
});
</script>
