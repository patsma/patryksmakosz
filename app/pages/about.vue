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
          thumbnail_url: '/Image-component-3.png',
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
          thumbnail_url: '/Image-component-4.png',
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
          thumbnail_url: '/Image-component-3.png',
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
          thumbnail_url: '/Image-component-4.png',
        },
      ]"
      id-attr="featured-cases-1"
    />
    <ImageSteppers
      title="My Approach to Digital Craftsmanship"
      copy="Beyond the standard process, my commitment is to deliver exceptional, animated web experiences built on robust foundations and clear communication."
      image-src="/Image-component-5.png"
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
          text: 'I transform complex ideas into captivating digital products that drive results. My work has delivered engaging, high-performing solutions for top-tier clients including Disney, Mazda, and Novo Nordisk.',
        },
      ]"
      :alternative-colors="false"
      :gradient-title="true"
      :flipped="false"
      :big-title="false"
      :buttons="[{ type: 'filled', link: 'mailto:patryksmakosz1@gmail.com', text: 'Start Your Project' }]"
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
