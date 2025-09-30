<template>
  <section key="test-page" class="pt-header" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test</h1>
    <ProjectEnvelope
      :autoPlay="true"
      :useScrollTrigger="false"
      :timeScale="1"
    />
    <CarouselFeaturedCaseStudies
      headline="Featured case studies"
      :alternative-colors="false"
      :gradient-title="true"
      view-all-href="/projects"
      :cases="[
        {
          post_title: 'Life Balance Congress (LBC)',
          post_excerpt:
            'Interactive web experience rich in scroll transitions, SVG animations, and GSAP effects built in Nuxt',
          testimonial_content:
            'Outstanding work on our interactive platform. The scroll animations and user experience exceeded our expectations.',
          testimonial_name: 'Sarah Johnson',
          testimonial_position: 'Creative Director',
          permalink: '/projects/life-balance-congress',
          thumbnail_url: '/assets/case/caseLbc.svg',
        },
        {
          post_title: 'ArtTech Logo Animation',
          post_excerpt:
            'Cyberpunk-inspired SVG logo animation featuring dynamic path motion, glitch distortions, and layered GSAP timelines',
          testimonial_content:
            'The logo animation perfectly captured our brand identity. Professional execution and creative vision.',
          testimonial_name: 'Michael Chen',
          testimonial_position: 'CEO',
          permalink: '/projects/arttech',
          thumbnail_url: '/assets/case/caseArtTech.svg',
        },
        {
          post_title: 'Riverscape',
          post_excerpt:
            'Nuxt 2 website powered by headless WordPress backend with Locomotive Scroll and GSAP animation layer',
          testimonial_content:
            'Seamless integration and beautiful animations. The smooth scrolling experience is exactly what we wanted.',
          testimonial_name: 'Emma Rodriguez',
          testimonial_position: 'Marketing Manager',
          permalink: '/projects/riverscape',
          thumbnail_url: '/assets/case/caseRiverscape.svg',
        },
        {
          post_title: 'Pushups Tracker',
          post_excerpt:
            'Local-first Nuxt 3 application using TypeScript, RxDB, Dexie.js and WebRTC for peer-to-peer sync',
          testimonial_content:
            'Impressive technical implementation. The offline-first approach and real-time sync work flawlessly.',
          testimonial_name: 'David Kim',
          testimonial_position: 'Product Manager',
          permalink: '/projects/pushups-tracker',
          thumbnail_url: '/assets/case/casePushups.svg',
        },
      ]"
      id-attr="featured-cases-1"
    />
  </section>
</template>
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
