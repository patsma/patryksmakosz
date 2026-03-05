// CV Data
// Edit this file to update your CV content

import type { CVData } from '~/types/cv'

export const cvData: CVData = {
  personal: {
    name: 'Patryk Smakosz',
    title: 'Frontend / Interactive / Creative Developer - WordPress / Vue / Nuxt - GSAP, SVG & ThreeJS',
    location: 'Gdansk, Poland',
    email: 'me@patryksmakosz.com',
    phone: '+48 502 590 747',
    personalSite: 'patryksmakosz.com',
    linkedin: 'linkedin.com/in/patryksmakosz',
  },

  summary: `Creative developer with 10+ years of experience specializing in interactive web experiences, advanced animations, and front-end architecture. Expert in GSAP, Vue/Nuxt ecosystems, and creating performant, visually stunning digital products. Passionate about pushing the boundaries of what's possible on the web while maintaining accessibility and performance standards.`,

  skills: [
    {
      category: 'Specializations',
      skills: ['Web Animation', 'Vector Animation', 'User Experience'],
    },
    {
      category: 'Front-End',
      skills: ['Nuxt.js', 'Vue.js', 'TypeScript', 'TailwindCSS', 'SCSS', 'CSS Grid', 'JavaScript ES6+'],
    },
    {
      category: 'Animation & Graphics',
      skills: ['GSAP', 'SVG Animation', 'Three.js', 'WebGL', 'Lottie', 'CSS Animations', 'Vite'],
    },
    {
      category: 'CMS & Backend',
      skills: ['WordPress', 'WordPress Bedrock', 'Nuxt Content', 'REST APIs', 'Python/Django', 'PHP'],
    },
  ],

  experience: [
    {
      company: 'TastySites',
      role: 'CEO & Creative Developer',
      startDate: '2012',
      responsibilities: [
        'Founded as a freelance operation in 2012, growing into a full-time creative studio from 2018',
        'Creating interactive content for Disney, Mazda, Paco Rabanne, AKA, WePushButtons, and many more',
        'Building Nuxt/Vue/WordPress services and applications',
        'Architected and developed award-winning websites with advanced GSAP animations',
      ],
    },
    {
      company: 'BÆRNHOLDT',
      role: 'Senior Frontend Developer',
      startDate: 'May 2022',
      endDate: 'July 2023',
      responsibilities: [
        'Nixu & Novo Nordisk: Contributed to projects with innovative solutions, marrying aesthetics with functionality to deliver superior user experience',
        'Strategic Collaboration: Involved in strategy sessions, steering the use of digital tools to enhance business standings',
        'Design & UX: Championed user experience by crafting modern interfaces and incorporating vibrant animations using WordPress Bedrock setup, CSS Grid, Vite, and GSAP',
      ],
    },
    {
      company: 'UpWork Freelancing',
      role: 'Freelance Creative Developer',
      startDate: 'Sept 2017',
      endDate: 'Oct 2018',
      responsibilities: [
        'Worked with Art Directors and creative teams on interactive web content for major brands',
        'Developed SVG-rich animated banners and web experiences',
        'Researched and implemented cutting-edge interactive techniques',
        'Built international client relationships across various industries',
      ],
    },
    {
      company: '314.PL',
      role: 'Front End Developer',
      startDate: 'Feb 2016',
      endDate: 'July 2017',
      responsibilities: [
        'Creating WordPress services, 3D animations, and visual FX',
        'Designing for print, web, and mass events',
        'Building simple applications with Vue',
        'Managed junior developers on projects',
      ],
    },
    {
      company: 'Website Style',
      role: 'Junior Front End Developer',
      startDate: 'Jan 2014',
      endDate: 'Dec 2016',
      responsibilities: [
        'Creating WordPress custom themes',
        'Designing landing pages',
        'Building animated banners',
        'Managed trainee developers on projects',
      ],
    },
  ],

  education: [
    {
      institution: 'SDA Academy',
      degree: 'JavaScript From Scratch + React (325 hours)',
      startDate: '2018',
      endDate: '2018',
      description: 'jQuery & DOM, CSS Preprocessor, Structural Programming in JavaScript',
    },
    {
      institution: 'Full-Stack Dev Bootcamp',
      degree: 'Front End / Back End Developer (250 hours)',
      startDate: '2013',
      endDate: '2013',
      description: 'Python/Django, PHP, HTML/CSS/JS, Algorithms, Databases',
    },
    {
      institution: 'AMW Gdynia',
      degree: 'Computer Science',
      startDate: '2010',
      endDate: '2012',
      description: 'Basic C/C++, Object Programming, Electronics and Electrotechnics',
    },
    {
      institution: 'ZSCHIE Gdynia',
      degree: 'IT Specialist',
      startDate: '2006',
      endDate: '2010',
      description: 'CISCO exercises, LAN networks maintenance, 6 months practice as LAN technician',
    },
  ],

  courses: [
    {
      institution: 'Certificates.dev × NuxtLabs',
      degree: 'Official Nuxt Certification',
      startDate: '2025',
      endDate: 'Present',
      description: 'In progress — Created with Nuxt.com and Sébastien Chopin (Nuxt creator). Validates proficiency in routing, SSR, middleware, state management, and deployment.',
    },
    {
      institution: 'Three.js Journey',
      degree: 'WebGL & 3D Web Development',
      startDate: '2025',
      endDate: 'Present',
      description: 'Up next — Bruno Simon. 55+ hours covering WebGL, 3D geometry, shaders, post-processing, physics, and immersive web experiences.',
    },
    {
      institution: 'Whimsical Animations',
      degree: 'Advanced Web Animations',
      startDate: '2025',
      endDate: 'Present',
      description: 'In progress — Josh Comeau (whimsy.joshwcomeau.com). Spring physics, SVG animations, and crafting delightful, polished motion for the web.',
    },
    {
      institution: 'Mastering Pinia',
      degree: 'Vue State Management',
      startDate: '2023',
      endDate: '2023',
      description: 'Eduardo San Martin Morote (Pinia creator). Advanced state management patterns and architecture for Vue 3 applications.',
    },
    {
      institution: 'Mastering Nuxt 3',
      degree: 'Full-Stack Nuxt 3',
      startDate: '2022',
      endDate: '2022',
      description: 'Michael Thiessen. Production-ready Nuxt 3 development — SSR, server routes, composables, and full-stack patterns.',
    },
    {
      institution: 'Vue Mastery',
      degree: 'Advanced Vue Curriculum',
      startDate: '2020',
      endDate: 'Present',
      description: 'Comprehensive Vue ecosystem: Vue 3, Composition API, TypeScript, Pinia, Nuxt, animations, testing, and more (near-complete catalogue).',
    },
    {
      institution: 'Mastering Nuxt 2',
      degree: 'Nuxt 2 Production Apps',
      startDate: '2020',
      endDate: '2020',
      description: 'Michael Thiessen. 97 video lessons — building scalable production Nuxt 2 applications, patterns, and migration strategies.',
    },
    {
      institution: 'Wes Bos',
      degree: 'JavaScript & CSS Courses',
      startDate: '2017',
      endDate: '2019',
      description: 'JavaScript30, Beginner JavaScript, CSS Grid, What The Flexbox — covering fundamentals through practical application patterns.',
    },
  ],

  projects: [
    {
      name: 'Riverscape',
      description: 'Nuxt 2 + headless WordPress website with Locomotive Scroll, GSAP, and scroll-driven animations for a London-based real estate company.',
      url: '/projects/riverscape',
    },
    {
      name: 'ArtistX',
      description: 'Custom ACF WordPress website with canvas animations, smooth scrolling, and scroll-driven effects.',
      url: '/projects/artistx',
    },
    {
      name: 'ArtTech',
      description: 'Cyberpunk-style SVG logo animation with dynamic movement, glitch effects, and GSAP timelines. Built for a cryptocurrency company in Next.js.',
      url: '/projects/arttech',
    },
    {
      name: 'Life Balance Congress',
      description: 'Scroll animated Nuxt 3 Landing Page with seamless transitions between sections using various GSAP animation techniques.',
      url: '/projects/life-balance-congress',
    },
  ],

  githubRepos: [
    {
      name: 'patryksmakosz',
      description: 'Creative developer portfolio built with Nuxt 4, Vue 3, and GSAP premium animations. Features 26+ interactive case studies.',
      url: 'https://github.com/patsma/patryksmakosz',
      language: 'Vue',
    },
    {
      name: 'pushup-tracker',
      description: 'A local-first peer-to-peer pushup tracking application built with Nuxt 3 and RxDB.',
      url: 'https://github.com/patsma/pushup-tracker',
      language: 'Vue',
    },
    {
      name: 'molki-design',
      description: 'Professional website for Molki Design - a creative design company in Gdańsk. Built with Nuxt 3, GSAP premium animations.',
      url: 'https://github.com/patsma/molki-design',
      language: 'Vue',
    },
    {
      name: 'nuxt-portfolio-gsap',
      description: 'A high-performance portfolio template with GSAP animations, smooth scrolling, and WebGL backgrounds.',
      url: 'https://github.com/patsma/nuxt-portfolio-gsap',
      language: 'Vue',
    },
    {
      name: 'gsap-logo-animation-template',
      description: 'Production-ready GSAP logo animation template with seamless video export using gsap-video-export.',
      url: 'https://github.com/patsma/gsap-logo-animation-template',
      language: 'JavaScript',
    },
    {
      name: 'nuxt4page-transitions',
      description: 'Page transition system for Nuxt 4 with GSAP & SplitText. Manual control via Vue directives with SSR compatibility.',
      url: 'https://github.com/patsma/nuxt4page-transitions',
      language: 'JavaScript',
    },
  ],

  interests: [
    'Nature & Hiking',
    'Bushcraft',
    'Science Fiction, Fantasy & Personal Development',
    'Drone Photography',
    'GoPro Adventures',
    'LAN Party',
  ],
}
