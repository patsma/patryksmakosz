// Centralized skills data used by SkillsShowcase and OrbitalCarousel
// Keep descriptions short (<= 8 words) per spec

/**
 * @typedef {Object} Skill
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {string} svg
 * @property {string} description
 * @property {string} highlight
 */

/** @type {Skill[]} */
export const skills = [
  {
    id: "nuxt",
    name: "Nuxt.js",
    icon: "logos:nuxt-icon",
    svg: "/assets/icons/nuxt-icon.svg",
    description: "SSR/SPA apps with routing and content",
    highlight: "Green glow ring with soft pulse",
  },
  {
    id: "vue",
    name: "Vue.js",
    icon: "logos:vue",
    svg: "/assets/icons/vue.svg",
    description: "Reactive UI components and state management",
    highlight: "Reactive pulse dots orbiting icon",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "logos:javascript",
    svg: "/assets/icons/javascript.svg",
    description: "Modern ES6+ patterns for web apps",
    highlight: "Yellow spark particles on hover",
  },
  {
    id: "gsap",
    name: "GSAP Animation",
    icon: "simple-icons:greensock",
    svg: "/assets/icons/greensock.svg",
    description: "Smooth, performant motion and timelines",
    highlight: "Subtle motion blur streak effect",
  },
  {
    id: "svg",
    name: "SVG Animation",
    icon: "mdi:svg",
    svg: "/assets/icons/svg.svg",
    description: "Vector morphs, draws, icon motion",
    highlight: "Line draw highlight around shape",
  },
  {
    id: "three",
    name: "Three.js",
    icon: "logos:threejs",
    svg: "/assets/icons/threejs.svg",
    description: "3D scenes, materials, camera controls",
    highlight: "3D tilt and parallax shadow",
  },
  {
    id: "wordpress",
    name: "WordPress",
    icon: "logos:wordpress-icon",
    svg: "/assets/icons/wordpress-icon.svg",
    description: "Custom themes, plugins, headless builds",
    highlight: "Blueprint grid overlay flicker",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    icon: "logos:tailwindcss-icon",
    svg: "/assets/icons/tailwindcss-icon.svg",
    description: "Utility-first, responsive design systems",
    highlight: "Utility tag badges animate in",
  },
  {
    id: "ecommerce",
    name: "Ecommerce Development",
    icon: "mdi:cart",
    svg: "/assets/icons/cart.svg",
    description: "WooCommerce, headless carts, checkout flows",
    highlight: "Cart bounce and shine sweep",
  },
  {
    id: "ai",
    name: "AI (Promptmaster Certified)",
    icon: "mdi:brain",
    svg: "/assets/icons/brain.svg",
    description: "Automations, AI workflows, prompt systems",
    highlight: "Neural pulse glow and link arcs",
  },
  {
    id: "css3",
    name: "CSS3 (Grid/Flexbox)",
    icon: "logos:css-3",
    svg: "/assets/icons/css-3.svg",
    description: "Robust layouts and responsive alignments",
    highlight: "Grid overlay reveal on hover",
  },
  {
    id: "scroll",
    name: "Scroll Animations",
    icon: "mdi:gesture-swipe-vertical",
    svg: "/assets/icons/gesture-swipe-vertical.svg",
    description: "ScrollTrigger storytelling and parallax",
    highlight: "Vertical progress bar indicator",
  },
  {
    id: "animated-banners",
    name: "Animated Banners",
    icon: "mdi:billboard",
    svg: "/assets/icons/billboard.svg",
    description: "GSAP HTML5 banners, lightweight builds",
    highlight: "Shine sweep and subtle bounce",
  },
  {
    id: "figma",
    name: "Figma to Code",
    icon: "logos:figma",
    svg: "/assets/icons/figma.svg",
    description: "Precise handoff; pixel-perfect components",
    highlight: "Ruler and measure overlay snap",
  },
];

export default skills;
