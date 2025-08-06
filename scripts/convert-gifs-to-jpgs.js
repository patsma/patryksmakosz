#!/usr/bin/env node

/**
 * GIF to JPG Middle Frame Extractor
 * Extracts the middle frame from each GIF as an optimized JPG
 * Perfect for mobile performance and fast loading
 */

import { execSync } from "child_process";
import { readdirSync, existsSync, mkdirSync } from "fs";
import { join, extname, basename } from "path";

// Configuration for JPG extraction
const CONFIG = {
  inputDir: "public/movies/web-optimized-gifs",
  outputDir: "public/movies/web-optimized-jpgs",
  // JPG optimization settings
  quality: 85, // JPG quality (1-100, 85 is good balance)
  maxWidth: 800, // Max width to keep file size reasonable
  maxHeight: 600, // Max height
  backgroundColor: "white", // Background color for transparent areas
};

/**
 * Get all GIF files from input directory
 * @returns {string[]} Array of GIF file paths
 */
function getGifFiles() {
  try {
    const files = readdirSync(CONFIG.inputDir);
    return files.filter((file) => {
      const ext = extname(file).toLowerCase();
      return ext === ".gif";
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
 * Get the total number of frames in a GIF
 * @param {string} inputPath - Path to GIF file
 * @returns {number} Number of frames
 */
function getFrameCount(inputPath) {
  try {
    const command = `ffprobe -v quiet -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -csv=p=0 "${inputPath}"`;
    const result = execSync(command, { encoding: "utf8" }).trim();
    return parseInt(result) || 1;
  } catch (error) {
    console.log("  ⚠️  Could not determine frame count, using frame 0");
    return 1;
  }
}

/**
 * Build ffmpeg command for extracting middle frame as JPG
 * @param {string} inputFile - Input GIF file
 * @param {string} outputFile - Output JPG file
 * @returns {string} ffmpeg command
 */
function buildFfmpegCommand(inputFile, outputFile) {
  const inputPath = join(CONFIG.inputDir, inputFile);
  const outputPath = join(CONFIG.outputDir, outputFile);

  // Get frame count to calculate middle frame
  const frameCount = getFrameCount(inputPath);
  const middleFrame = Math.floor(frameCount / 2);

  console.log(
    `  📊 Total frames: ${frameCount}, extracting frame: ${middleFrame}`
  );

  // Build ffmpeg command to extract specific frame
  let command = `ffmpeg -i "${inputPath}"`;
  command += ` -vf "select=eq(n\\,${middleFrame}),scale=${CONFIG.maxWidth}:${CONFIG.maxHeight}:flags=lanczos:force_original_aspect_ratio=decrease"`;
  command += ` -vframes 1`; // Extract only one frame
  command += ` -q:v ${Math.round(((100 - CONFIG.quality) * 31) / 100)}`; // Convert quality to ffmpeg scale
  command += ` -pix_fmt yuvj420p`; // Ensure JPG compatibility
  command += ` -y "${outputPath}"`;

  return command;
}

/**
 * Convert a single GIF to JPG (middle frame)
 * @param {string} filename - Input GIF filename
 */
function convertToJpg(filename) {
  const nameWithoutExt = basename(filename, extname(filename));
  const outputFilename = `${nameWithoutExt}.jpg`;
  const command = buildFfmpegCommand(filename, outputFilename);

  console.log(`\n🔄 Extracting middle frame from ${filename}...`);
  console.log(`Output: ${outputFilename}`);

  try {
    execSync(command, { stdio: "pipe" });
    console.log(`✅ Successfully extracted middle frame as JPG`);
  } catch (error) {
    console.error(`❌ Error extracting frame:`, error.message);
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
  console.log("🖼️  Starting GIF to JPG middle frame extraction...\n");

  // Check if ffmpeg and ffprobe are available
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    execSync("ffprobe -version", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ ffmpeg/ffprobe is not installed or not in PATH");
    console.log("Please install ffmpeg: https://ffmpeg.org/download.html");
    process.exit(1);
  }

  // Ensure output directory exists
  ensureOutputDir();

  // Get all GIF files
  const gifFiles = getGifFiles();

  if (gifFiles.length === 0) {
    console.log("No GIF files found in the input directory.");
    console.log(`Checked directory: ${CONFIG.inputDir}`);
    return;
  }

  console.log(`Found ${gifFiles.length} GIF file(s):`);
  gifFiles.forEach((file) => console.log(`  - ${file}`));
  console.log("");

  console.log(`⚙️  JPG Settings:`);
  console.log(`  - Max size: ${CONFIG.maxWidth}x${CONFIG.maxHeight}px`);
  console.log(`  - Quality: ${CONFIG.quality}%`);
  console.log(`  - Extract: Middle frame of each GIF`);
  console.log("");

  // Convert each GIF
  gifFiles.forEach((file, index) => {
    console.log(`\n📹 Processing ${index + 1}/${gifFiles.length}: ${file}`);

    const originalPath = join(CONFIG.inputDir, file);
    const originalSize = getFileSize(originalPath);
    console.log(`  📊 Original GIF size: ${originalSize}`);

    convertToJpg(file);

    // Show new file size
    const nameWithoutExt = basename(file, extname(file));
    const jpgPath = join(CONFIG.outputDir, `${nameWithoutExt}.jpg`);
    if (existsSync(jpgPath)) {
      const jpgSize = getFileSize(jpgPath);
      console.log(`  📊 JPG size: ${jpgSize}`);
    }
  });

  console.log("\n🎉 GIF to JPG extraction completed!");
  console.log(`Check the output directory: ${CONFIG.outputDir}`);
  console.log("\n💡 Benefits:");
  console.log("  - Much smaller file sizes (JPG vs GIF)");
  console.log("  - Faster loading on mobile devices");
  console.log("  - Better performance for infinite scroll");
  console.log("  - Still shows representative image of each project");
}

// Run the script
main();
