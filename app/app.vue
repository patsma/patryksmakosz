<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Display fancy console info about developer and work
if (process.client) {
  console.log(`
   👨‍💻 Developer: Patryk Smakosz
   🌐 Website: https://patryksmakosz.com
   🏢 Brand: tastysites.pl
   📧 Contact: me@patryksmakosz.com

   🚀 Built with:
   • Nuxt 4 (Vue 3) - Modern full-stack framework
   • GSAP - Premium animations & ScrollSmoother
   • TailwindCSS - Utility-first styling
   • Nuxt Content - Type-safe content management
   • Pinia - State management

   ✨ Features:
   • Smooth scrolling with GSAP ScrollSmoother
   • Interactive SVG animations
   • Orbital carousel components
   • Project case studies with video
   • Responsive design & accessibility

   🎯 Specializing in:
   • Creative web development
   • Interactive user experiences
   • Modern JavaScript frameworks
   • Performance optimization
   • Animation & motion design

   💼 Available for freelance projects & collaborations
  `);

  console.log(
    "%c🎨 Welcome to my portfolio!",
    "font-size: 24px; color: #ff6b6b; font-weight: bold;"
  );
  console.log(
    "%cLike what you see? Let's work together!",
    "font-size: 16px; color: #4ecdc4; font-weight: bold;"
  );
  console.log(
    "%c📧 me@patryksmakosz.com",
    "font-size: 14px; color: #45b7d1; text-decoration: underline;"
  );
}

// Intentionally minimal: all app-level structure is handled by layouts and pages
</script>
