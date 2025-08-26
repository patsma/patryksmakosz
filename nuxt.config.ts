// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  // Global transitions for pages and layouts
  // Keep it subtle and fast to avoid clashing with GSAP smooth scrolling
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
    // Global <head> configuration for accessibility & SEO
    // - Provide a default title and template
    // - Set the html[lang] attribute for screen readers
    // - Provide a sensible default meta description
    head: {
      title:
        "Patryk Smakosz – Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
      titleTemplate: "%s · Patryk Smakosz",
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Patryk Smakosz is a versatile Creative Developer and Front-End Developer specializing in web animations, interactive motion design, and immersive user experiences. With over 10 years of experience building Vue.js/Nuxt.js apps, custom WordPress themes, and animated web banners using GreenSock, SVG, and Canvas technologies, Patryk crafts dynamic digital products that engage and inspire worldwide brands and agencies.",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
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
    "@nuxt/content",
    "@maz-ui/nuxt",
  ],

  gsap: {
    composables: true,
    clubPlugins: {
      morphSvg: true,
      drawSvg: true,
      customBounce: true,
      customWiggle: true,
      gsDevTools: true,
      scrollSmoother: true,
    },
    extraPlugins: {
      observer: true,
      scrollTrigger: true,
      motionPath: true,
    },
    extraEases: {
      custom: true,
    },
  },
});
