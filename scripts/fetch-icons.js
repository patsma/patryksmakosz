// Fetch Iconify SVGs and save them as raw .svg assets.
// Usage:
//   npm run fetch:icons

import fs from "node:fs/promises";

const OUT_DIR = "public/assets/icons";

/**
 * Map of Iconify IDs to local component names.
 * Extend or change as needed; make sure to keep in sync with SkillsShowcase.
 */
const ICONS = [
  { name: "logos:nuxt-icon", component: "NuxtIconSVG" },
  { name: "logos:vue", component: "VueIconSVG" },
  { name: "logos:javascript", component: "JavaScriptIconSVG" },
  { name: "simple-icons:greensock", component: "GsapIconSVG" },
  { name: "mdi:svg", component: "SvgIconSVG" },
  { name: "logos:threejs", component: "ThreeIconSVG" },
  { name: "logos:wordpress-icon", component: "WordPressIconSVG" },
  { name: "logos:tailwindcss-icon", component: "TailwindIconSVG" },
  { name: "mdi:cart", component: "EcommerceIconSVG" },
  { name: "mdi:api", component: "ApiIconSVG" },
  { name: "logos:css-3", component: "Css3IconSVG" },
  { name: "mdi:gesture-swipe-vertical", component: "ScrollIconSVG" },
  { name: "simple-icons:webgl", component: "WebglIconSVG" },
  { name: "logos:figma", component: "FigmaIconSVG" },
];

const fetchSvg = async (icon) => {
  const url = `https://api.iconify.design/${icon.name}.svg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${icon.name} -> ${res.status}`);
  return res.text();
};

// Build a clean filename from the Iconify ID: use the part after ':'
const toFileNameFromIconId = (iconName) => {
  const part = iconName.includes(":") ? iconName.split(":")[1] : iconName;
  return part.toLowerCase();
};

const run = async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const icon of ICONS) {
    try {
      const svg = await fetchSvg(icon);
      const fileBase = toFileNameFromIconId(icon.name);
      const file = `${OUT_DIR}/${fileBase}.svg`;
      await fs.writeFile(file, svg, "utf8");
      console.log("Wrote", file);
    } catch (e) {
      console.error("Error on", icon.name, e.message);
    }
  }
};

run();
