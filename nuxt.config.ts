// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "@hypernym/nuxt-gsap",
    "@pinia/nuxt",
  ],
  
  // Add GSAP CDN scripts (same as working mwg_026 version)
  app: {
    head: {
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
          defer: true
        },
        {
          src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Observer.min.js',
          defer: true
        }
      ]
    }
  },
  
  gsap: {
    composables: true,
    clubPlugins: {
      morphSvg: true,
      drawSvg: true,
      gsDevTools: true,
    },
    extraPlugins: {
      observer: true,
    },
  },
});
