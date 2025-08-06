#!/usr/bin/env node

/**
 * Banner Video Converter for Web Optimization
 * Converts all videos in public/movies/banners/ subfolders to web-optimized formats
 * Names files based on video dimensions (e.g., banner160x600.mp4)
 * Maintains folder structure for each project
 */

import { execSync } from "child_process";
import { readdirSync, existsSync, mkdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

// Configuration for web-optimized video conversion
const CONFIG = {
  inputDir: "public/movies/banners",
  outputDir: "public/movies/banners-optimized",
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
 * Get video dimensions using ffprobe
 * @param {string} videoPath - Path to the video file
 * @returns {Object} Object with width and height properties
 */
function getVideoDimensions(videoPath) {
  try {
    const command = `ffprobe -v quiet -print_format json -show_streams "${videoPath}"`;
    const result = execSync(command, { encoding: "utf8" });
    const data = JSON.parse(result);

    // Find the video stream
    const videoStream = data.streams.find(
      (stream) => stream.codec_type === "video"
    );

    if (videoStream) {
      return {
        width: parseInt(videoStream.width),
        height: parseInt(videoStream.height),
      };
    }

    throw new Error("No video stream found");
  } catch (error) {
    console.error(`Error getting dimensions for ${videoPath}:`, error.message);
    return { width: 0, height: 0 };
  }
}

/**
 * Get all project folders in the banners directory
 * @returns {string[]} Array of project folder names
 */
function getProjectFolders() {
  try {
    const items = readdirSync(CONFIG.inputDir);
    return items.filter((item) => {
      const itemPath = join(CONFIG.inputDir, item);
      return statSync(itemPath).isDirectory() && !item.startsWith(".");
    });
  } catch (error) {
    console.error("Error reading banners directory:", error.message);
    return [];
  }
}

/**
 * Get all video files from a project folder
 * @param {string} projectFolder - Project folder name
 * @returns {string[]} Array of video file paths
 */
function getVideoFilesFromProject(projectFolder) {
  try {
    const projectPath = join(CONFIG.inputDir, projectFolder);
    const files = readdirSync(projectPath);
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
    console.error(
      `Error reading project directory ${projectFolder}:`,
      error.message
    );
    return [];
  }
}

/**
 * Create output directory for a project if it doesn't exist
 * @param {string} projectFolder - Project folder name
 */
function ensureProjectOutputDir(projectFolder) {
  const outputPath = join(CONFIG.outputDir, projectFolder);
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
    console.log(`Created output directory: ${outputPath}`);
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
  let command = `ffmpeg -i "${inputFile}"`;

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

  command += ` "${outputFile}"`;

  return command;
}

/**
 * Convert a single video file to web-optimized format with dimension-based naming
 * @param {string} projectFolder - Project folder name
 * @param {string} filename - Input filename
 */
function convertBannerVideo(projectFolder, filename) {
  const inputPath = join(CONFIG.inputDir, projectFolder, filename);

  // Get video dimensions
  const dimensions = getVideoDimensions(inputPath);

  if (dimensions.width === 0 || dimensions.height === 0) {
    console.error(`❌ Could not get dimensions for ${filename}, skipping...`);
    return;
  }

  CONFIG.formats.forEach((format) => {
    // Create dimension-based filename
    const outputFilename = `banner${dimensions.width}x${dimensions.height}${format.extension}`;
    const outputPath = join(CONFIG.outputDir, projectFolder, outputFilename);

    const command = buildFfmpegCommand(inputPath, outputPath, format);

    console.log(
      `\n🔄 Converting ${filename} (${dimensions.width}x${
        dimensions.height
      }) to ${format.name.toUpperCase()}...`
    );
    console.log(`Output: ${projectFolder}/${outputFilename}`);

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
 * Process all videos in a project folder
 * @param {string} projectFolder - Project folder name
 */
function processProjectFolder(projectFolder) {
  console.log(`\n📁 Processing project: ${projectFolder}`);

  // Ensure output directory exists for this project
  ensureProjectOutputDir(projectFolder);

  // Get all video files in this project
  const videoFiles = getVideoFilesFromProject(projectFolder);

  if (videoFiles.length === 0) {
    console.log(`  No video files found in ${projectFolder}`);
    return;
  }

  console.log(`  Found ${videoFiles.length} video file(s):`);
  videoFiles.forEach((file) => console.log(`    - ${file}`));

  // Convert each video
  videoFiles.forEach((file, index) => {
    console.log(`\n  📹 Processing ${index + 1}/${videoFiles.length}: ${file}`);
    convertBannerVideo(projectFolder, file);
  });
}

/**
 * Main conversion function
 */
function main() {
  console.log("🎬 Starting banner video conversion for web optimization...\n");

  // Check if ffmpeg and ffprobe are available
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    execSync("ffprobe -version", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ ffmpeg or ffprobe is not installed or not in PATH");
    console.log("Please install ffmpeg: https://ffmpeg.org/download.html");
    process.exit(1);
  }

  // Ensure main output directory exists
  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`Created main output directory: ${CONFIG.outputDir}`);
  }

  // Get all project folders
  const projectFolders = getProjectFolders();

  if (projectFolders.length === 0) {
    console.log("No project folders found in the banners directory.");
    return;
  }

  console.log(`Found ${projectFolders.length} project folder(s):`);
  projectFolders.forEach((folder) => console.log(`  - ${folder}`));

  // Process each project folder
  projectFolders.forEach((folder, index) => {
    console.log(
      `\n🗂️  Processing project ${index + 1}/${projectFolders.length}`
    );
    processProjectFolder(folder);
  });

  console.log("\n🎉 Banner conversion completed!");
  console.log(`Check the output directory: ${CONFIG.outputDir}`);

  // Show summary of what was created
  console.log("\n📊 Summary:");
  projectFolders.forEach((folder) => {
    const outputPath = join(CONFIG.outputDir, folder);
    if (existsSync(outputPath)) {
      try {
        const outputFiles = readdirSync(outputPath);
        console.log(`  ${folder}: ${outputFiles.length} optimized banner(s)`);
        outputFiles.forEach((file) => console.log(`    - ${file}`));
      } catch (error) {
        console.log(`  ${folder}: Error reading output directory`);
      }
    }
  });
}

// Run the script
main();
