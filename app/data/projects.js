/**
 * Portfolio projects data - centralized and maintainable
 * Each project contains video info and routing data for future navigation
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Unique identifier for routing
 * @property {string} name - Display name for the project
 * @property {string} filename - Video filename
 * @property {string} src - Video source path
 * @property {string} alt - Alt text for accessibility
 * @property {string} category - Project category for filtering
 * @property {string} description - Brief project description
 */

/** @type {Project[]} */
export const projects = [
  // Interface & Web Projects
  {
    id: "wepushbuttons",
    name: "We Push Buttons",
    filename: "wepushbuttons.gif",
    src: "/movies/web-optimized-jpgs/wepushbuttons.jpg",
    alt: "We Push Buttons Portfolio",
    category: "web",
    description: "Interactive web platform showcase",
  },
  {
    id: "page404",
    name: "404 Page Design",
    filename: "page404.gif",
    src: "/movies/web-optimized-jpgs/page404.jpg",
    alt: "404 Page Design",
    category: "web",
    description: "Creative 404 error page design",
  },
  {
    id: "iceberg-webdesign",
    name: "Iceberg Web Design",
    filename: "iceberg-webdesign.gif",
    src: "/movies/web-optimized-jpgs/iceberg-webdesign.jpg",
    alt: "Iceberg Web Design",
    category: "web",
    description: "Modern web design agency showcase",
  },

  // Data Visualization & Analytics
  {
    id: "graph",
    name: "Data Visualization",
    filename: "graph.gif",
    src: "/movies/web-optimized-jpgs/graph.jpg",
    alt: "Graph Animation",
    category: "data",
    description: "Interactive data visualization dashboard",
  },
  {
    id: "graph-slider",
    name: "Graph Slider",
    filename: "graph-slider.gif",
    src: "/movies/web-optimized-jpgs/graph-slider.jpg",
    alt: "Graph Slider Animation",
    category: "data",
    description: "Dynamic graph slider interface",
  },
  {
    id: "spectrometer",
    name: "Spectrometer App",
    filename: "spectrometer.gif",
    src: "/movies/web-optimized-jpgs/spectrometer.jpg",
    alt: "Spectrometer Project",
    category: "data",
    description: "Scientific data analysis tool",
  },
  {
    id: "usa-map",
    name: "USA Map Interactive",
    filename: "usa-map.gif",
    src: "/movies/web-optimized-jpgs/usa-map.jpg",
    alt: "USA Map Animation",
    category: "data",
    description: "Interactive geographical data visualization",
  },

  // Icon Animations
  {
    id: "icon-cloud",
    name: "Cloud Services",
    filename: "icon-cloud.gif",
    src: "/movies/web-optimized-jpgs/icon-cloud.jpg",
    alt: "Cloud Icon Animation",
    category: "icons",
    description: "Cloud computing services animation",
  },
  {
    id: "icon-box",
    name: "Box Solutions",
    filename: "icon-box.gif",
    src: "/movies/web-optimized-jpgs/icon-box.jpg",
    alt: "Box Icon Animation",
    category: "icons",
    description: "Storage and packaging solutions",
  },
  {
    id: "icon-phone",
    name: "Mobile App",
    filename: "icon-phone.gif",
    src: "/movies/web-optimized-jpgs/icon-phone.jpg",
    alt: "Phone Icon Animation",
    category: "icons",
    description: "Mobile application interface",
  },
  {
    id: "icon-monitor",
    name: "Desktop Platform",
    filename: "icon-monitor.gif",
    src: "/movies/web-optimized-jpgs/icon-monitor.jpg",
    alt: "Monitor Icon Animation",
    category: "icons",
    description: "Desktop application platform",
  },
  {
    id: "icon-message",
    name: "Messaging System",
    filename: "icon-message.gif",
    src: "/movies/web-optimized-jpgs/icon-message.jpg",
    alt: "Message Icon Animation",
    category: "icons",
    description: "Communication and messaging platform",
  },
  {
    id: "icon-laptop",
    name: "Laptop Interface",
    filename: "icon-laptop.gif",
    src: "/movies/web-optimized-jpgs/icon-laptop.jpg",
    alt: "Laptop Icon Animation",
    category: "icons",
    description: "Laptop interface design",
  },
  {
    id: "icon-ladder",
    name: "Progress Tracker",
    filename: "icon-ladder.gif",
    src: "/movies/web-optimized-jpgs/icon-ladder.jpg",
    alt: "Ladder Icon Animation",
    category: "icons",
    description: "Progress tracking and advancement",
  },
  {
    id: "icon-bars",
    name: "Analytics Dashboard",
    filename: "icon-bars.gif",
    src: "/movies/web-optimized-jpgs/icon-bars.jpg",
    alt: "Bars Icon Animation",
    category: "icons",
    description: "Analytics and reporting dashboard",
  },

  // Hardware & Technology
  {
    id: "laptop-isometric",
    name: "Laptop Showcase",
    filename: "laptop-isometric.gif",
    src: "/movies/web-optimized-jpgs/laptop-isometric.jpg",
    alt: "Laptop Isometric Design",
    category: "tech",
    description: "3D laptop presentation",
  },
  {
    id: "personal-computer",
    name: "Personal Computer",
    filename: "personal-computer.gif",
    src: "/movies/web-optimized-jpgs/personal-computer.jpg",
    alt: "Personal Computer Animation",
    category: "tech",
    description: "Personal computer showcase",
  },
  {
    id: "stairs",
    name: "Stairs Animation",
    filename: "stairs.gif",
    src: "/movies/web-optimized-jpgs/stairs.jpg",
    alt: "Stairs Animation",
    category: "tech",
    description: "3D stairs modeling and animation",
  },

  // Business & Corporate Projects
  {
    id: "fort-privacy",
    name: "Fort Privacy",
    filename: "fort-privacy.gif",
    src: "/movies/web-optimized-jpgs/fort-privacy.jpg",
    alt: "Fort Privacy Project",
    category: "business",
    description: "Privacy protection platform",
  },
  {
    id: "fidelis-elevate",
    name: "Fidelis Elevate",
    filename: "fidelis-elevate.gif",
    src: "/movies/web-optimized-jpgs/fidelis-elevate.jpg",
    alt: "Fidelis Elevate Project",
    category: "business",
    description: "Business elevation platform",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity Solutions",
    filename: "cybersecurity.gif",
    src: "/movies/web-optimized-jpgs/cybersecurity.jpg",
    alt: "Cybersecurity Project",
    category: "business",
    description: "Comprehensive cybersecurity platform",
  },
  {
    id: "working-solutions",
    name: "Working Solutions",
    filename: "working-solutions.gif",
    src: "/movies/web-optimized-jpgs/working-solutions.jpg",
    alt: "Working Solutions Project",
    category: "business",
    description: "Business workflow solutions",
  },
  {
    id: "working-jobs-vyne",
    name: "Working Jobs Vyne",
    filename: "working-jobs-vyne.gif",
    src: "/movies/web-optimized-jpgs/working-jobs-vyne.jpg",
    alt: "Working Jobs Vyne Project",
    category: "business",
    description: "Job matching platform",
  },
  {
    id: "inforca",
    name: "Inforca",
    filename: "inforca.gif",
    src: "/movies/web-optimized-jpgs/inforca.jpg",
    alt: "Inforca Project",
    category: "business",
    description: "Information management system",
  },
  {
    id: "catalyst",
    name: "Catalyst",
    filename: "catalyst.gif",
    src: "/movies/web-optimized-jpgs/catalyst.jpg",
    alt: "Catalyst Project",
    category: "business",
    description: "Business acceleration platform",
  },

  // Creative & Design Projects
  {
    id: "gradient",
    name: "Gradient Design",
    filename: "gradient.gif",
    src: "/movies/web-optimized-jpgs/gradient.jpg",
    alt: "Gradient Animation",
    category: "creative",
    description: "Dynamic gradient design showcase",
  },
  {
    id: "clouds",
    name: "Cloud Animation",
    filename: "clouds.gif",
    src: "/movies/web-optimized-jpgs/clouds.jpg",
    alt: "Clouds Animation",
    category: "creative",
    description: "Atmospheric cloud animations",
  },
  {
    id: "envelope",
    name: "Envelope Design",
    filename: "envelope.gif",
    src: "/movies/web-optimized-jpgs/envelope.jpg",
    alt: "Envelope Animation",
    category: "creative",
    description: "Mail and communication design",
  },
  {
    id: "brain",
    name: "Brain Visualization",
    filename: "brain.gif",
    src: "/movies/web-optimized-jpgs/brain.jpg",
    alt: "Brain Animation",
    category: "creative",
    description: "Neural network visualization",
  },
  {
    id: "lion",
    name: "Lion Animation",
    filename: "lion.gif",
    src: "/movies/web-optimized-jpgs/lion.jpg",
    alt: "Lion Animation",
    category: "creative",
    description: "Wildlife animation showcase",
  },

  // Specialized Industry Projects
  {
    id: "yamahata",
    name: "Yamahata",
    filename: "yamahata.gif",
    src: "/movies/web-optimized-jpgs/yamahata.jpg",
    alt: "Yamahata Project",
    category: "industry",
    description: "Japanese industry showcase",
  },
  {
    id: "farm-table",
    name: "Farm Table",
    filename: "farm-table.gif",
    src: "/movies/web-optimized-jpgs/farm-table.jpg",
    alt: "Farm Table Project",
    category: "industry",
    description: "Agricultural technology platform",
  },
  {
    id: "booking-engine",
    name: "Booking Engine",
    filename: "booking-engine.gif",
    src: "/movies/web-optimized-jpgs/booking-engine.jpg",
    alt: "Booking Engine Project",
    category: "industry",
    description: "Travel and booking platform",
  },
  {
    id: "bartender",
    name: "Bartender System",
    filename: "bartender.gif",
    src: "/movies/web-optimized-jpgs/bartender.jpg",
    alt: "Bartender Project",
    category: "industry",
    description: "Hospitality management system",
  },
  {
    id: "audiologist",
    name: "Audiologist Platform",
    filename: "audiologist.gif",
    src: "/movies/web-optimized-jpgs/audiologist.jpg",
    alt: "Audiologist Project",
    category: "industry",
    description: "Healthcare audiology platform",
  },
  {
    id: "zaksa",
    name: "Zaksa Sports",
    filename: "zaksa.gif",
    src: "/movies/web-optimized-jpgs/zaksa.jpg",
    alt: "Zaksa Project",
    category: "industry",
    description: "Sports team management platform",
  },
  {
    id: "frontier",
    name: "Frontier",
    filename: "frontier.gif",
    src: "/movies/web-optimized-jpgs/frontier.jpg",
    alt: "Frontier Project",
    category: "industry",
    description: "Frontier technology showcase",
  },
  {
    id: "aeroflux",
    name: "Aeroflux",
    filename: "aeroflux.gif",
    src: "/movies/web-optimized-jpgs/aeroflux.jpg",
    alt: "Aeroflux Project",
    category: "industry",
    description: "Aerospace technology platform",
  },

  // Personal & Individual Projects
  {
    id: "family",
    name: "Family Project",
    filename: "family.gif",
    src: "/movies/web-optimized-jpgs/family.jpg",
    alt: "Family Project",
    category: "personal",
    description: "Family-focused application",
  },
  {
    id: "michael-arthur",
    name: "Michael Arthur",
    filename: "michael-arthur.gif",
    src: "/movies/web-optimized-jpgs/michael-arthur.jpg",
    alt: "Michael Arthur Project",
    category: "personal",
    description: "Personal portfolio showcase",
  },

  // Health & Medical Projects
  {
    id: "blood",
    name: "Blood Analysis",
    filename: "blood.gif",
    src: "/movies/web-optimized-jpgs/blood.jpg",
    alt: "Blood Analysis Project",
    category: "medical",
    description: "Medical blood analysis system",
  },
  {
    id: "milk",
    name: "Milk Quality System",
    filename: "milk.gif",
    src: "/movies/web-optimized-jpgs/milk.jpg",
    alt: "Milk Project",
    category: "medical",
    description: "Food quality analysis platform",
  },

  // Specialized Tools & Apps
  {
    id: "just-in-mind",
    name: "Just In Mind",
    filename: "just-in-mind.gif",
    src: "/movies/web-optimized-jpgs/just-in-mind.jpg",
    alt: "Just In Mind Project",
    category: "tools",
    description: "Mindfulness and productivity app",
  },
  {
    id: "hq-bio",
    name: "HQ Bio",
    filename: "hq-bio.gif",
    src: "/movies/web-optimized-jpgs/hq-bio.jpg",
    alt: "HQ Bio Project",
    category: "tools",
    description: "Biological research platform",
  },
  {
    id: "fresh-sight",
    name: "Fresh Sight",
    filename: "fresh-sight.gif",
    src: "/movies/web-optimized-jpgs/fresh-sight.jpg",
    alt: "Fresh Sight Project",
    category: "tools",
    description: "Vision and perspective tool",
  },
  {
    id: "dobra-hipoteka",
    name: "Dobra Hipoteka",
    filename: "dobra-hipoteka.gif",
    src: "/movies/web-optimized-jpgs/dobra-hipoteka.jpg",
    alt: "Dobra Hipoteka Project",
    category: "tools",
    description: "Mortgage and finance platform",
  },
  {
    id: "blueberry",
    name: "Blueberry",
    filename: "blueberry.gif",
    src: "/movies/web-optimized-jpgs/blueberry.jpg",
    alt: "Blueberry Project",
    category: "tools",
    description: "Creative development tool",
  },
];

/**
 * Get project by ID for routing
 * @param {string} id - Project ID
 * @returns {Project|undefined} - Project data or undefined if not found
 */
export const getProjectById = (id) => {
  return projects.find((project) => project.id === id);
};

/**
 * Get projects by category for filtering
 * @param {string} category - Category name
 * @returns {Project[]} - Array of projects in the category
 */
export const getProjectsByCategory = (category) => {
  return projects.filter((project) => project.category === category);
};

/**
 * Get all unique categories
 * @returns {string[]} - Array of unique category names
 */
export const getCategories = () => {
  return [...new Set(projects.map((project) => project.category))];
};

/**
 * Generate project route path
 * @param {string} id - Project ID
 * @returns {string} - Route path for the project
 */
export const getProjectRoute = (id) => {
  return `/projects/${id}`;
};
