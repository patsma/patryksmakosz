// https://nuxt.com/docs/api/configuration/nuxt-config
const disableSentry = process.env.DISABLE_SENTRY === "1";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://patryksmakosz.com",
    },
  },

  // Global transitions for pages and layouts
  app: {
    pageTransition: { name: "page", mode: "out-in", appear: true },
    layoutTransition: { name: "layout", mode: "out-in", appear: true },

    head: {
      title:
        "Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
      titleTemplate: "%s · Patryk Smakosz",
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Expertise in Interactive Motion Design,immersive user experiences. With over 10 years of experience building Vue.js/Nuxt.js apps, custom WordPress themes, and animated web banners using GreenSock, SVG, and Canvas technologies, Patryk crafts dynamic digital products that engage and inspire worldwide brands and agencies.",
        },
        // Open Graph Basics
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Patryk Smakosz" },
        {
          property: "og:title",
          content:
            "Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
        },
        {
          property: "og:description",
          content:
            "Expertise in Interactive Motion Design,immersive user experiences. With over 10 years of experience building Vue.js/Nuxt.js apps, custom WordPress themes, and animated web banners using GreenSock, SVG, and Canvas technologies, Patryk crafts dynamic digital products that engage and inspire worldwide brands and agencies.",
        },
        // Absolute URLs are required by some scrapers (e.g., Facebook)
        {
          property: "og:url",
          content:
            process.env.NUXT_PUBLIC_SITE_URL ||
            "https://patryksmakosz.com/.local",
        },
        {
          property: "og:image",
          content: `${process.env.NUXT_PUBLIC_SITE_URL || "https://patryksmakosz.com/.local"}/og.jpg`,
        },
        {
          property: "og:image:secure_url",
          content: `${process.env.NUXT_PUBLIC_SITE_URL || "https://patryksmakosz.com/.local"}/og.jpg`,
        },
        {
          property: "og:image:alt",
          content:
            "Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
        },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content:
            "Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
        },
        {
          name: "twitter:description",
          content:
            "Expertise in Interactive Motion Design,immersive user experiences. With over 10 years of experience building Vue.js/Nuxt.js apps, custom WordPress themes, and animated web banners using GreenSock, SVG, and Canvas technologies, Patryk crafts dynamic digital products that engage and inspire worldwide brands and agencies.",
        },
        {
          name: "twitter:image",
          content: `${process.env.NUXT_PUBLIC_SITE_URL || "https://patryksmakosz.com/.local"}/og.jpg`,
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  components: [
    { path: "~/components", pathPrefix: false },
    { path: "~/components/SVG", pathPrefix: false },
  ],

  // Global CSS entry points
  css: ["~/assets/css/tailwind.css", "~/assets/scss/main.scss"],

  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/eslint",
    "@nuxt/ui",
    "@hypernym/nuxt-gsap",
    "@pinia/nuxt",
    "@nuxt/content",
    "@maz-ui/nuxt",
    "@tresjs/nuxt",
    ...(disableSentry ? [] : ["@sentry/nuxt/module"]),
  ],

  // Nuxt UI configuration
  ui: {
    fonts: false, // Already using @nuxt/fonts
  },

  // Prefix all maz-ui composable auto-imports (e.g. useFormField → useMazFormField)
  // to avoid name collision with @nuxt/ui's useFormField.
  // Note: mazUi.composables.useFormField: false doesn't work — it's a bug in the maz-ui
  // Nuxt module (line 226 of module.mjs filters by internal hardcoded map, not user config).
  mazUi: {
    general: {
      autoImportPrefix: 'maz',
    },
  },

  gsap: {
    composables: true,
    clubPlugins: {
      morphSvg: true,
      drawSvg: true,
      customBounce: true,
      customWiggle: true,
      splitText: true,
      gsDevTools: true,
      scrollSmoother: true,
    },
    extraPlugins: {
      observer: true,
      flip: true,
      scrollTrigger: true,
      motionPath: true,
    },
    extraEases: {
      custom: true,
    },
  },

  ...(disableSentry
    ? {}
    : {
        sentry: {
          sourceMapsUploadOptions: {
            org: "tasty-0a",
            project: "javascript-nuxt",
          },
          autoInjectServerSentry: "top-level-import",
        },
      }),

  sourcemap: {
    client: "hidden",
  },
});
