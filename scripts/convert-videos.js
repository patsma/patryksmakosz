#!/usr/bin/env node

/**
 * Batch Video Converter for Web Optimization
 * Converts all videos in public/movies/ to web-optimized formats
 * Uses ffmpeg with optimal settings for web delivery
 */

import { execSync } from "child_process";
import { readdirSync, existsSync, mkdirSync } from "fs";
import { join, extname, basename } from "path";

// Configuration for web-optimized video conversion
const CONFIG = {
  inputDir: "public/movies",
  outputDir: "public/movies/web-optimized",
  formats: [
    {
      name: "mp4",
      extension: ".mp4",
      codec: "libx264",
      preset: "medium",
      crf: 23, // Constant Rate Factor - good quality/size balance
      audioCodec: "aac",
      audioBitrate: "128k",
      videoBitrate: "2M",
      maxWidth: 1920,
      maxHeight: 1080,
    },
  ],
};

/**
 * Get all video files from input directory
 * @returns {string[]} Array of video file paths
 */
function getVideoFiles() {
  try {
    const files = readdirSync(CONFIG.inputDir);
    const videoExtensions = [
      ".mov",
      ".mp4",
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
 * Build ffmpeg command for video conversion
 * @param {string} inputFile - Input file path
 * @param {string} outputFile - Output file path
 * @param {Object} format - Format configuration
 * @returns {string} ffmpeg command
 */
function buildFfmpegCommand(inputFile, outputFile, format) {
  const inputPath = join(CONFIG.inputDir, inputFile);
  const outputPath = join(CONFIG.outputDir, outputFile);

  let command = `ffmpeg -i "${inputPath}"`;

  // Video settings
  command += ` -c:v ${format.codec}`;
  command += ` -preset ${format.preset}`;
  command += ` -crf ${format.crf}`;
  command += ` -maxrate ${format.videoBitrate}`;
  command += ` -bufsize ${format.videoBitrate}`;

  // Scale video if needed (maintain aspect ratio and ensure even dimensions for H.264)
  command += ` -vf "scale=min(${format.maxWidth}\\,iw):min(${format.maxHeight}\\,ih):force_original_aspect_ratio=decrease:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2"`;

  // Audio settings
  command += ` -c:a ${format.audioCodec}`;
  command += ` -b:a ${format.audioBitrate}`;

  // Web optimization settings
  command += ` -movflags +faststart`; // Enable streaming
  command += ` -pix_fmt yuv420p`; // Ensure compatibility
  command += ` -y`; // Overwrite output files

  command += ` "${outputPath}"`;

  return command;
}

/**
 * Convert a single video file to all target formats
 * @param {string} filename - Input filename
 */
function convertVideo(filename) {
  const nameWithoutExt = basename(filename, extname(filename));

  CONFIG.formats.forEach((format) => {
    const outputFilename = `${nameWithoutExt}${format.extension}`;
    const command = buildFfmpegCommand(filename, outputFilename, format);

    console.log(
      `\n🔄 Converting ${filename} to ${format.name.toUpperCase()}...`
    );
    console.log(`Output: ${outputFilename}`);

    try {
      execSync(command, { stdio: "inherit" });
      console.log(`✅ Successfully converted to ${format.name.toUpperCase()}`);
    } catch (error) {
      console.error(
        `❌ Error converting to ${format.name.toUpperCase()}:`,
        error.message
      );
    }
  });
}

/**
 * Main conversion function
 */
function main() {
  console.log("🎬 Starting batch video conversion for web optimization...\n");

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
    return;
  }

  console.log(`Found ${videoFiles.length} video file(s):`);
  videoFiles.forEach((file) => console.log(`  - ${file}`));
  console.log("");

  // Convert each video
  videoFiles.forEach((file, index) => {
    console.log(`\n📹 Processing ${index + 1}/${videoFiles.length}: ${file}`);
    convertVideo(file);
  });

  console.log("\n🎉 Batch conversion completed!");
  console.log(`Check the output directory: ${CONFIG.outputDir}`);
}

// Run the script
main();
