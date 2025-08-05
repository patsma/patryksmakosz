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
    filename: "wepushbuttons.mp4",
    src: "/movies/web-optimized/wepushbuttons.mp4",
    alt: "We Push Buttons Portfolio",
    category: "web",
    description: "Interactive web platform showcase",
  },
  {
    id: "page404",
    name: "404 Page Design",
    filename: "page404.mp4",
    src: "/movies/web-optimized/page404.mp4",
    alt: "404 Page Design",
    category: "web",
    description: "Creative 404 error page design",
  },
  {
    id: "iceberg-webdesign",
    name: "Iceberg Web Design",
    filename: "iceberg-webdesign.mp4",
    src: "/movies/web-optimized/iceberg-webdesign.mp4",
    alt: "Iceberg Web Design",
    category: "web",
    description: "Modern web design agency showcase",
  },

  // Data Visualization & Analytics
  {
    id: "graph",
    name: "Data Visualization",
    filename: "graph.mp4",
    src: "/movies/web-optimized/graph.mp4",
    alt: "Graph Animation",
    category: "data",
    description: "Interactive data visualization dashboard",
  },
  {
    id: "graph-slider",
    name: "Graph Slider",
    filename: "graph-slider.mp4",
    src: "/movies/web-optimized/graph-slider.mp4",
    alt: "Graph Slider Animation",
    category: "data",
    description: "Dynamic graph slider interface",
  },
  {
    id: "spectrometer",
    name: "Spectrometer App",
    filename: "spectrometer.mp4",
    src: "/movies/web-optimized/spectrometer.mp4",
    alt: "Spectrometer Project",
    category: "data",
    description: "Scientific data analysis tool",
  },
  {
    id: "usa-map",
    name: "USA Map Interactive",
    filename: "usa-map.mp4",
    src: "/movies/web-optimized/usa-map.mp4",
    alt: "USA Map Animation",
    category: "data",
    description: "Interactive geographical data visualization",
  },

  // Icon Animations
  {
    id: "icon-cloud",
    name: "Cloud Services",
    filename: "icon-cloud.mp4",
    src: "/movies/web-optimized/icon-cloud.mp4",
    alt: "Cloud Icon Animation",
    category: "icons",
    description: "Cloud computing services animation",
  },
  {
    id: "icon-box",
    name: "Box Solutions",
    filename: "icon-box.mp4",
    src: "/movies/web-optimized/icon-box.mp4",
    alt: "Box Icon Animation",
    category: "icons",
    description: "Storage and packaging solutions",
  },
  {
    id: "icon-phone",
    name: "Mobile App",
    filename: "icon-phone.mp4",
    src: "/movies/web-optimized/icon-phone.mp4",
    alt: "Phone Icon Animation",
    category: "icons",
    description: "Mobile application interface",
  },
  {
    id: "icon-monitor",
    name: "Desktop Platform",
    filename: "icon-monitor.mp4",
    src: "/movies/web-optimized/icon-monitor.mp4",
    alt: "Monitor Icon Animation",
    category: "icons",
    description: "Desktop application platform",
  },
  {
    id: "icon-message",
    name: "Messaging System",
    filename: "icon-message.mp4",
    src: "/movies/web-optimized/icon-message.mp4",
    alt: "Message Icon Animation",
    category: "icons",
    description: "Communication and messaging platform",
  },
  {
    id: "icon-laptop",
    name: "Laptop Interface",
    filename: "icon-laptop.mp4",
    src: "/movies/web-optimized/icon-laptop.mp4",
    alt: "Laptop Icon Animation",
    category: "icons",
    description: "Laptop interface design",
  },
  {
    id: "icon-ladder",
    name: "Progress Tracker",
    filename: "icon-ladder.mp4",
    src: "/movies/web-optimized/icon-ladder.mp4",
    alt: "Ladder Icon Animation",
    category: "icons",
    description: "Progress tracking and advancement",
  },
  {
    id: "icon-bars",
    name: "Analytics Dashboard",
    filename: "icon-bars.mp4",
    src: "/movies/web-optimized/icon-bars.mp4",
    alt: "Bars Icon Animation",
    category: "icons",
    description: "Analytics and reporting dashboard",
  },

  // Hardware & Technology
  {
    id: "laptop-isometric",
    name: "Laptop Showcase",
    filename: "laptop-isometric.mp4",
    src: "/movies/web-optimized/laptop-isometric.mp4",
    alt: "Laptop Isometric Design",
    category: "tech",
    description: "3D laptop presentation",
  },
  {
    id: "personal-computer",
    name: "Personal Computer",
    filename: "personal-computer.mp4",
    src: "/movies/web-optimized/personal-computer.mp4",
    alt: "Personal Computer Animation",
    category: "tech",
    description: "Personal computer showcase",
  },
  {
    id: "stairs",
    name: "Stairs Animation",
    filename: "stairs.mp4",
    src: "/movies/web-optimized/stairs.mp4",
    alt: "Stairs Animation",
    category: "tech",
    description: "3D stairs modeling and animation",
  },

  // Business & Corporate Projects
  {
    id: "fort-privacy",
    name: "Fort Privacy",
    filename: "fort-privacy.mp4",
    src: "/movies/web-optimized/fort-privacy.mp4",
    alt: "Fort Privacy Project",
    category: "business",
    description: "Privacy protection platform",
  },
  {
    id: "fidelis-elevate",
    name: "Fidelis Elevate",
    filename: "fidelis-elevate.mp4",
    src: "/movies/web-optimized/fidelis-elevate.mp4",
    alt: "Fidelis Elevate Project",
    category: "business",
    description: "Business elevation platform",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity Solutions",
    filename: "cybersecurity.mp4",
    src: "/movies/web-optimized/cybersecurity.mp4",
    alt: "Cybersecurity Project",
    category: "business",
    description: "Comprehensive cybersecurity platform",
  },
  {
    id: "working-solutions",
    name: "Working Solutions",
    filename: "working-solutions.mp4",
    src: "/movies/web-optimized/working-solutions.mp4",
    alt: "Working Solutions Project",
    category: "business",
    description: "Business workflow solutions",
  },
  {
    id: "working-jobs-vyne",
    name: "Working Jobs Vyne",
    filename: "working-jobs-vyne.mp4",
    src: "/movies/web-optimized/working-jobs-vyne.mp4",
    alt: "Working Jobs Vyne Project",
    category: "business",
    description: "Job matching platform",
  },
  {
    id: "inforca",
    name: "Inforca",
    filename: "inforca.mp4",
    src: "/movies/web-optimized/inforca.mp4",
    alt: "Inforca Project",
    category: "business",
    description: "Information management system",
  },
  {
    id: "catalyst",
    name: "Catalyst",
    filename: "catalyst.mp4",
    src: "/movies/web-optimized/catalyst.mp4",
    alt: "Catalyst Project",
    category: "business",
    description: "Business acceleration platform",
  },

  // Creative & Design Projects
  {
    id: "gradient",
    name: "Gradient Design",
    filename: "gradient.mp4",
    src: "/movies/web-optimized/gradient.mp4",
    alt: "Gradient Animation",
    category: "creative",
    description: "Dynamic gradient design showcase",
  },
  {
    id: "clouds",
    name: "Cloud Animation",
    filename: "clouds.mp4",
    src: "/movies/web-optimized/clouds.mp4",
    alt: "Clouds Animation",
    category: "creative",
    description: "Atmospheric cloud animations",
  },
  {
    id: "envelope",
    name: "Envelope Design",
    filename: "envelope.mp4",
    src: "/movies/web-optimized/envelope.mp4",
    alt: "Envelope Animation",
    category: "creative",
    description: "Mail and communication design",
  },
  {
    id: "brain",
    name: "Brain Visualization",
    filename: "brain.mp4",
    src: "/movies/web-optimized/brain.mp4",
    alt: "Brain Animation",
    category: "creative",
    description: "Neural network visualization",
  },
  {
    id: "lion",
    name: "Lion Animation",
    filename: "lion.mp4",
    src: "/movies/web-optimized/lion.mp4",
    alt: "Lion Animation",
    category: "creative",
    description: "Wildlife animation showcase",
  },

  // Specialized Industry Projects
  {
    id: "yamahata",
    name: "Yamahata",
    filename: "yamahata.mp4",
    src: "/movies/web-optimized/yamahata.mp4",
    alt: "Yamahata Project",
    category: "industry",
    description: "Japanese industry showcase",
  },
  {
    id: "farm-table",
    name: "Farm Table",
    filename: "farm-table.mp4",
    src: "/movies/web-optimized/farm-table.mp4",
    alt: "Farm Table Project",
    category: "industry",
    description: "Agricultural technology platform",
  },
  {
    id: "booking-engine",
    name: "Booking Engine",
    filename: "booking-engine.mp4",
    src: "/movies/web-optimized/booking-engine.mp4",
    alt: "Booking Engine Project",
    category: "industry",
    description: "Travel and booking platform",
  },
  {
    id: "bartender",
    name: "Bartender System",
    filename: "bartender.mp4",
    src: "/movies/web-optimized/bartender.mp4",
    alt: "Bartender Project",
    category: "industry",
    description: "Hospitality management system",
  },
  {
    id: "audiologist",
    name: "Audiologist Platform",
    filename: "audiologist.mp4",
    src: "/movies/web-optimized/audiologist.mp4",
    alt: "Audiologist Project",
    category: "industry",
    description: "Healthcare audiology platform",
  },
  {
    id: "zaksa",
    name: "Zaksa Sports",
    filename: "zaksa.mp4",
    src: "/movies/web-optimized/zaksa.mp4",
    alt: "Zaksa Project",
    category: "industry",
    description: "Sports team management platform",
  },
  {
    id: "frontier",
    name: "Frontier",
    filename: "frontier.mp4",
    src: "/movies/web-optimized/frontier.mp4",
    alt: "Frontier Project",
    category: "industry",
    description: "Frontier technology showcase",
  },
  {
    id: "aeroflux",
    name: "Aeroflux",
    filename: "aeroflux.mp4",
    src: "/movies/web-optimized/aeroflux.mp4",
    alt: "Aeroflux Project",
    category: "industry",
    description: "Aerospace technology platform",
  },

  // Personal & Individual Projects
  {
    id: "family",
    name: "Family Project",
    filename: "family.mp4",
    src: "/movies/web-optimized/family.mp4",
    alt: "Family Project",
    category: "personal",
    description: "Family-focused application",
  },
  {
    id: "michael-arthur",
    name: "Michael Arthur",
    filename: "michael-arthur.mp4",
    src: "/movies/web-optimized/michael-arthur.mp4",
    alt: "Michael Arthur Project",
    category: "personal",
    description: "Personal portfolio showcase",
  },

  // Health & Medical Projects
  {
    id: "blood",
    name: "Blood Analysis",
    filename: "blood.mp4",
    src: "/movies/web-optimized/blood.mp4",
    alt: "Blood Analysis Project",
    category: "medical",
    description: "Medical blood analysis system",
  },
  {
    id: "milk",
    name: "Milk Quality System",
    filename: "milk.mp4",
    src: "/movies/web-optimized/milk.mp4",
    alt: "Milk Project",
    category: "medical",
    description: "Food quality analysis platform",
  },

  // Specialized Tools & Apps
  {
    id: "just-in-mind",
    name: "Just In Mind",
    filename: "just-in-mind.mp4",
    src: "/movies/web-optimized/just-in-mind.mp4",
    alt: "Just In Mind Project",
    category: "tools",
    description: "Mindfulness and productivity app",
  },
  {
    id: "hq-bio",
    name: "HQ Bio",
    filename: "hq-bio.mp4",
    src: "/movies/web-optimized/hq-bio.mp4",
    alt: "HQ Bio Project",
    category: "tools",
    description: "Biological research platform",
  },
  {
    id: "fresh-sight",
    name: "Fresh Sight",
    filename: "fresh-sight.mp4",
    src: "/movies/web-optimized/fresh-sight.mp4",
    alt: "Fresh Sight Project",
    category: "tools",
    description: "Vision and perspective tool",
  },
  {
    id: "dobra-hipoteka",
    name: "Dobra Hipoteka",
    filename: "dobra-hipoteka.mp4",
    src: "/movies/web-optimized/dobra-hipoteka.mp4",
    alt: "Dobra Hipoteka Project",
    category: "tools",
    description: "Mortgage and finance platform",
  },
  {
    id: "blueberry",
    name: "Blueberry",
    filename: "blueberry.mp4",
    src: "/movies/web-optimized/blueberry.mp4",
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
