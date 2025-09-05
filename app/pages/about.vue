<template>
  <div>
    <h1 class="sr-only">About</h1>
    <CarouselTimeline
      headline="Your Project Journey With Me"
      text-under-headline="My collaborative process ensures your vision transforms into an engaging and high-performing digital experience, from initial concept to successful launch."
      :steps="[
        {
          title: 'Discover & Define',
          content:
            'My initial approach emphasizes understanding your needs and project goals through detailed consultation. This foundation-setting step defines requirements and ensures we\'re aligned on your vision from the start.',
          read_more_link: '#',
        },
        {
          title: 'Design & Prototype',
          content:
            'Building on discovery, I translate your ideas into modern interfaces and interactive prototypes. This phase focuses on user experience (UX) and visual design, creating engaging concepts that align with your brand.',
          read_more_link: '#',
        },
        {
          title: 'Develop & Animate',
          content:
            'This is where core technical and creative skills come to the forefront. Your vision comes to life with clean code and captivating web animations using GSAP, SVG, Canvas, WordPress, and Nuxt.js.',
          read_more_link: '#',
        },
        {
          title: 'Optimize & Refine',
          content:
            'Demonstrating commitment to quality through rigorous testing for functionality, responsiveness, and page speed. This ensures a secure, flawless user experience while staying responsive to your feedback.',
          read_more_link: '#',
        },
        {
          title: 'Launch & Support',
          content:
            'The final step covers deployment and ongoing support, reinforcing dedication to long-term success. Your project launches ready to engage audiences with continued support for client relationships.',
          read_more_link: '#',
        },
      ]"
      :buttons="[
        {
          type: 'outline',
          link: 'mailto:patryksmakosz1@gmail.com',
          text: 'Contact',
        },
      ]"
    />
    <OrbitalCarousel class="-mt-[30vh]" />

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
