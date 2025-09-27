<template>
  <div class="pt-header">
    <h1 class="sr-only">About</h1>

    <ImageSteppers
      title="My Approach to Digital Craftsmanship"
      copy="Beyond the standard process, my commitment is to deliver exceptional, animated web experiences built on robust foundations and clear communication."
      image-src="/assets/medias/steps.svg"
      :steps="[
        {
          title: 'Web Animation Mastery',
          text: 'As a Top Web Animation Expert with over a decade of experience, I specialize in GSAP, SVG, and Canvas animations, creating smooth, performant motion that captures attention and enhances user engagement.',
        },
        {
          title: 'Solid Technical Foundation',
          text: 'Expert in Nuxt.js, Vue.js, and WordPress development, I build robust, high-performance applications with clean, efficient code and responsive design systems optimized for speed and functionality.',
        },
        {
          title: 'Client-Focused Collaboration',
          text: 'A decade of freelancing has taught me to be communicative, helpful, and honest. I prioritize understanding your vision to deliver projects on time and budget while fostering lasting professional relationships.',
        },
        {
          title: 'Proven Track Record',
          text: 'I have transformed complex ideas into captivating digital products that drive results. My work has delivered engaging, high-performing solutions for top-tier clients and agencies.',
        },
      ]"
      :alternative-colors="false"
      :gradient-title="true"
      :flipped="false"
      :big-title="false"
      :buttons="[
        {
          type: 'filled',
          link: 'mailto:patryksmakosz1@gmail.com',
          text: 'Let\'s chat 😁',
        },
      ]"
    />

    <!-- <ProjectPathAnimation /> -->
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
