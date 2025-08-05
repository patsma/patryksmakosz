#!/usr/bin/env node

/**
 * Batch Video to GIF Converter
 * Converts all videos in web-optimized folder to optimized GIFs
 * Uses ffmpeg with optimal settings for web delivery
 */

import { execSync } from "child_process";
import { readdirSync, existsSync, mkdirSync } from "fs";
import { join, extname, basename } from "path";

// Configuration for GIF conversion
const CONFIG = {
  inputDir: "public/movies/web-optimized",
  outputDir: "public/movies/web-optimized-gifs",
  // GIF optimization settings
  maxWidth: 800, // Max width to keep file size reasonable
  maxHeight: 600, // Max height
  fps: 15, // Frames per second (lower = smaller file)
  colors: 256, // Color palette size (max 256 for GIF)
  quality: "medium", // ffmpeg palette quality: low, medium, high
};

/**
 * Get all video files from input directory
 * @returns {string[]} Array of video file paths
 */
function getVideoFiles() {
  try {
    const files = readdirSync(CONFIG.inputDir);
    const videoExtensions = [
      ".mp4",
      ".mov",
      ".avi",
      ".mkv",
      ".wmv",
      ".flv",
      ".webm",
      ".m4v",
    ];

    return files.filter((file) => {
      const ext = extname(file).toLowerCase();
      return videoExtensions.includes(ext);
    });
  } catch (error) {
    console.error("Error reading input directory:", error.message);
    return [];
  }
}

/**
 * Create output directory if it doesn't exist
 */
function ensureOutputDir() {
  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`Created output directory: ${CONFIG.outputDir}`);
  }
}

/**
 * Build ffmpeg command for video to GIF conversion with palette optimization
 * @param {string} inputFile - Input file path
 * @param {string} outputFile - Output file path
 * @returns {string[]} Array of ffmpeg commands (palette generation + GIF creation)
 */
function buildFfmpegCommands(inputFile, outputFile) {
  const inputPath = join(CONFIG.inputDir, inputFile);
  const outputPath = join(CONFIG.outputDir, outputFile);
  const paletteFile = join(CONFIG.outputDir, "palette.png");

  // First command: Generate optimized color palette
  let paletteCommand = `ffmpeg -i "${inputPath}"`;
  paletteCommand += ` -vf "fps=${CONFIG.fps},scale=${CONFIG.maxWidth}:${CONFIG.maxHeight}:flags=lanczos:force_original_aspect_ratio=decrease,palettegen=max_colors=${CONFIG.colors}:reserve_transparent=0"`;
  paletteCommand += ` -y "${paletteFile}"`;

  // Second command: Create GIF using the generated palette
  let gifCommand = `ffmpeg -i "${inputPath}" -i "${paletteFile}"`;
  gifCommand += ` -lavfi "fps=${CONFIG.fps},scale=${CONFIG.maxWidth}:${CONFIG.maxHeight}:flags=lanczos:force_original_aspect_ratio=decrease [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle"`;
  gifCommand += ` -y "${outputPath}"`;

  return [paletteCommand, gifCommand];
}

/**
 * Convert a single video file to GIF
 * @param {string} filename - Input filename
 */
function convertToGif(filename) {
  const nameWithoutExt = basename(filename, extname(filename));
  const outputFilename = `${nameWithoutExt}.gif`;
  const [paletteCommand, gifCommand] = buildFfmpegCommands(
    filename,
    outputFilename
  );

  console.log(`\n🔄 Converting ${filename} to GIF...`);
  console.log(`Output: ${outputFilename}`);

  try {
    // Step 1: Generate color palette
    console.log("  🎨 Generating optimized color palette...");
    execSync(paletteCommand, { stdio: "pipe" });

    // Step 2: Create GIF with palette
    console.log("  🖼️  Creating optimized GIF...");
    execSync(gifCommand, { stdio: "pipe" });

    console.log(`✅ Successfully converted to GIF`);
  } catch (error) {
    console.error(`❌ Error converting to GIF:`, error.message);
  }
}

/**
 * Get file size in human readable format
 * @param {string} filePath - Path to file
 * @returns {string} Human readable file size
 */
function getFileSize(filePath) {
  try {
    const stats = execSync(`ls -lh "${filePath}"`, { encoding: "utf8" });
    const size = stats.split(/\s+/)[4];
    return size;
  } catch {
    return "unknown";
  }
}

/**
 * Main conversion function
 */
function main() {
  console.log("🎬 Starting batch video to GIF conversion...\n");

  // Check if ffmpeg is available
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ ffmpeg is not installed or not in PATH");
    console.log("Please install ffmpeg: https://ffmpeg.org/download.html");
    process.exit(1);
  }

  // Ensure output directory exists
  ensureOutputDir();

  // Get all video files
  const videoFiles = getVideoFiles();

  if (videoFiles.length === 0) {
    console.log("No video files found in the input directory.");
    console.log(`Checked directory: ${CONFIG.inputDir}`);
    return;
  }

  console.log(`Found ${videoFiles.length} video file(s):`);
  videoFiles.forEach((file) => console.log(`  - ${file}`));
  console.log("");

  console.log(`⚙️  GIF Settings:`);
  console.log(`  - Max size: ${CONFIG.maxWidth}x${CONFIG.maxHeight}px`);
  console.log(`  - Frame rate: ${CONFIG.fps} fps`);
  console.log(`  - Colors: ${CONFIG.colors}`);
  console.log("");

  // Convert each video
  videoFiles.forEach((file, index) => {
    console.log(`\n📹 Processing ${index + 1}/${videoFiles.length}: ${file}`);

    const originalPath = join(CONFIG.inputDir, file);
    const originalSize = getFileSize(originalPath);
    console.log(`  📊 Original size: ${originalSize}`);

    convertToGif(file);

    // Show new file size
    const nameWithoutExt = basename(file, extname(file));
    const gifPath = join(CONFIG.outputDir, `${nameWithoutExt}.gif`);
    if (existsSync(gifPath)) {
      const gifSize = getFileSize(gifPath);
      console.log(`  📊 GIF size: ${gifSize}`);
    }
  });

  // Clean up palette file
  const paletteFile = join(CONFIG.outputDir, "palette.png");
  if (existsSync(paletteFile)) {
    try {
      execSync(`rm "${paletteFile}"`);
    } catch {}
  }

  console.log("\n🎉 Batch GIF conversion completed!");
  console.log(`Check the output directory: ${CONFIG.outputDir}`);
  console.log("\n💡 Tips:");
  console.log("  - GIFs should load faster than videos");
  console.log("  - Update your component to use .gif instead of .mp4");
  console.log(
    "  - You can adjust settings in the script for smaller/larger files"
  );
}

// Run the script
main();
