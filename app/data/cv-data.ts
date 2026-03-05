// CV Data
// Edit this file to update your CV content

import type { CVData } from '~/types/cv'

export const cvData: CVData = {
  personal: {
    name: 'Patryk Smakosz',
    title: 'Creative Developer | Web Animation Expert | Front-End Developer',
    location: 'Gdansk, Poland',
    email: 'kontakt@tastysites.pl',
    phone: '+48 502 590 747',
    personalSite: 'patryksmakosz.com',
    linkedin: 'linkedin.com/in/patryksmakosz',
  },

  summary: `Creative developer with 10+ years of experience specializing in interactive web experiences, advanced animations, and front-end architecture. Expert in GSAP, Vue/Nuxt ecosystems, and creating performant, visually stunning digital products. Passionate about pushing the boundaries of what's possible on the web while maintaining accessibility and performance standards.`,

  skills: [
    {
      category: 'Specializations',
      skills: ['Web Animation', 'Vector Animation', 'Motion Graphics', 'User Experience', 'Print & Web Design', 'Photo & Video Editing'],
    },
    {
      category: 'Front-End',
      skills: ['Nuxt.js', 'Vue.js', 'Angular', 'TypeScript', 'TailwindCSS', 'SCSS', 'CSS Grid', 'JavaScript ES6+'],
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
      startDate: 'Dec 2018',
      responsibilities: [
        'Creating interactive content for Disney, Mazda, Paco Rabanne, AKA, WePushButtons, and many more',
        'Building Nuxt/Vue/Angular/WordPress services and applications',
        'Evolving presence on UpWork with international clientele',
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
      company: 'Green Rubino',
      role: 'Creative Coder',
      startDate: 'Sept 2017',
      endDate: 'Oct 2018',
      responsibilities: [
        'Developing SVG rich banners for major brands',
        'Researching cutting edge interactive web content',
        'Working with Art Director on interactive content',
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
      institution: 'Labor Office',
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

  projects: [
    {
      name: 'Riverscape',
      description: 'Nuxt 2 + headless WordPress website with Locomotive Scroll, GSAP, and scroll-driven animations for a London-based real estate company.',
      url: 'https://www.riverscape.co.uk/',
    },
    {
      name: 'ArtistX',
      description: 'Custom ACF WordPress website with canvas animations, smooth scrolling, and scroll-driven effects.',
      url: 'https://ax.tastysites.pl/',
    },
    {
      name: 'ArtTech',
      description: 'Cyberpunk-style SVG logo animation with dynamic movement, glitch effects, and GSAP timelines. Built for a cryptocurrency company in Next.js.',
    },
    {
      name: 'Life Balance Congress',
      description: 'Scroll animated Nuxt 3 Landing Page with seamless transitions between sections using various GSAP animation techniques.',
      url: 'https://life-balance-prototype.netlify.app/',
    },
  ],

  githubRepos: [
    {
      name: 'tastysites-2025',
      description: 'Creative developer portfolio built with Nuxt 4, Vue 3, and GSAP premium animations. Features 26+ interactive case studies with smooth scroll, SVG morphing, and responsive design.',
      url: 'https://github.com/patsma/tastysites-2025',
      language: 'Vue',
    },
    {
      name: 'morten-2025',
      description: 'Personal portfolio built with Nuxt 4, featuring GSAP page transitions, ScrollSmoother, theme-aware animations, and WebGL fluid gradients.',
      url: 'https://github.com/patsma/morten-2025',
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
      description: 'Professional website for Molki Design - a creative design company in Gdańsk. Built with Nuxt 3, GSAP premium animations, and Nuxt Studio CMS.',
      url: 'https://github.com/patsma/molki-design',
      language: 'Vue',
    },
    {
      name: 'agatarybka',
      description: 'Modern portfolio website for Agata Rybka showcasing administration, graphics & marketing work. Built with Nuxt 4, GSAP animations, and TailwindCSS.',
      url: 'https://github.com/patsma/agatarybka',
      language: 'Vue',
    },
    {
      name: 'envelope-gsap-2025',
      description: 'Elegant SVG envelope opening animation with GSAP morphing, Vite, and vanilla JavaScript.',
      url: 'https://github.com/patsma/envelope-gsap-2025',
      language: 'JavaScript',
    },
  ],

  interests: [
    'Nature & Hiking',
    'Science Fiction & Fantasy Literature',
    'Drone Photography',
    'GoPro Adventures',
    'Open Source Contribution',
  ],
}
