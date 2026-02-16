// CV Data
// Edit this file to update your CV content

import type { CVData } from '~/types/cv'

export const cvData: CVData = {
  personal: {
    name: 'Patryk Smakosz',
    title: 'Creative Developer | Web Animation Expert | Front-End Developer',
    location: 'Gdansk, Poland',
    email: 'patryk@tastysites.pl',
    phone: '+48 730 519 090',
    website: 'tastysites.pl',
    linkedin: 'linkedin.com/in/patryk-smakosz',
  },

  summary: `Creative developer with 10+ years of experience specializing in interactive web experiences, advanced animations, and front-end architecture. Expert in GSAP, Vue/Nuxt ecosystems, and creating performant, visually stunning digital products. Passionate about pushing the boundaries of what's possible on the web while maintaining accessibility and performance standards.`,

  skills: [
    {
      category: 'Front-End',
      skills: ['Nuxt.js', 'Vue.js', 'TypeScript', 'TailwindCSS', 'SCSS', 'HTML5', 'JavaScript ES6+'],
    },
    {
      category: 'Animation & Graphics',
      skills: ['GSAP', 'SVG Animation', 'Three.js', 'WebGL', 'Lottie', 'CSS Animations', 'Motion Design'],
    },
    {
      category: 'CMS & Backend',
      skills: ['WordPress', 'Nuxt Content', 'Headless CMS', 'REST APIs', 'GraphQL'],
    },
    {
      category: 'Tools & Workflow',
      skills: ['Figma', 'Git', 'Docker', 'VS Code', 'Adobe Creative Suite', 'CI/CD'],
    },
  ],

  experience: [
    {
      company: 'TastySites',
      role: 'Founder & Creative Developer',
      startDate: '2018',
      responsibilities: [
        'Founded and lead a creative development studio specializing in interactive web experiences',
        'Architected and developed award-winning websites with advanced GSAP animations',
        'Collaborated with international clients including agencies from Denmark, UK, and USA',
        'Implemented complex SVG morphing, parallax effects, and scroll-driven animations',
        'Built custom Nuxt/Vue applications with focus on performance and accessibility',
      ],
    },
    {
      company: 'BÆRNHOLDT',
      role: 'Senior Front-End Developer',
      startDate: '2022',
      endDate: '2023',
      responsibilities: [
        'Led front-end development for high-profile Danish brand websites',
        'Implemented sophisticated animation systems using GSAP ScrollTrigger',
        'Collaborated with design team to create pixel-perfect, responsive interfaces',
        'Mentored junior developers on Vue.js best practices and animation techniques',
      ],
    },
    {
      company: 'Green Rubino',
      role: 'Front-End Developer',
      startDate: '2017',
      endDate: '2018',
      responsibilities: [
        'Developed responsive WordPress themes with custom functionality',
        'Created interactive UI components and micro-animations',
        'Optimized website performance and Core Web Vitals',
      ],
    },
    {
      company: '314.PL',
      role: 'Web Developer',
      startDate: '2016',
      endDate: '2017',
      responsibilities: [
        'Built and maintained client websites using modern front-end technologies',
        'Implemented SEO best practices and analytics tracking',
        'Collaborated with backend team on API integrations',
      ],
    },
    {
      company: 'Website Style',
      role: 'Junior Developer',
      startDate: '2014',
      endDate: '2016',
      responsibilities: [
        'Developed responsive websites using HTML, CSS, and JavaScript',
        'Assisted senior developers with complex projects',
        'Learned modern development workflows and version control',
      ],
    },
  ],

  education: [
    {
      institution: 'SDA Academy',
      degree: 'Front-End Development Bootcamp',
      startDate: '2019',
      endDate: '2019',
      description: 'Intensive training in modern JavaScript frameworks and best practices',
    },
    {
      institution: 'Labor Office Professional Courses',
      degree: 'Web Development & Design',
      startDate: '2014',
      endDate: '2014',
      description: 'Professional certification in web technologies',
    },
    {
      institution: 'Naval Academy',
      degree: 'Technical Studies',
      startDate: '2010',
      endDate: '2012',
    },
    {
      institution: 'Technical School',
      degree: 'IT Technician',
      startDate: '2006',
      endDate: '2010',
      description: 'Foundation in computer science and programming',
    },
  ],

  projects: [
    {
      name: 'We Push Buttons',
      description: 'Interactive portfolio with advanced GSAP animations and 3D elements',
    },
    {
      name: 'Zaksa Sports',
      description: 'Dynamic sports team website with real-time data integration',
    },
    {
      name: 'Fort Privacy',
      description: 'Corporate website with sophisticated scroll-driven storytelling',
    },
    {
      name: 'Blueberry Studio',
      description: 'Creative agency website featuring SVG morphing and parallax effects',
    },
    {
      name: 'Spectrum Audio',
      description: 'E-commerce platform with immersive product showcases',
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
