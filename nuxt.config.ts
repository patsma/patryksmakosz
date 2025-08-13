// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  // Global transitions for pages and layouts
  // Keep it subtle and fast to avoid clashing with GSAP smooth scrolling
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
  },
  components: [
    { path: "~/components", pathPrefix: false },
    { path: "~/components/SVG", pathPrefix: false },
  ],
  // Simple global SCSS entry point (Nuxt standard assets dir)
  css: ["~/assets/scss/main.scss"],

  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "@hypernym/nuxt-gsap",
    "@pinia/nuxt",
  ],

  gsap: {
    composables: true,
    clubPlugins: {
      morphSvg: true,
      drawSvg: true,
      gsDevTools: true,
      // Enable ScrollSmoother club plugin so it's tree-shakeable and available client-side
      scrollSmoother: true,
    },
    extraPlugins: {
      observer: true,
      scrollTrigger: true,
      motionPath: true,
    },
  },
});
