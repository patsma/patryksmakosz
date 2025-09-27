<template>
  <div class="pt-header">
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
    />
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
