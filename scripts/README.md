# Video Conversion Script

Converts all videos in `public/movies/` to web-optimized MP4 format.

## Prerequisites

You need to have **ffmpeg** installed on your system:

### macOS

```bash
# Using Homebrew
brew install ffmpeg

# Or using MacPorts
sudo port install ffmpeg
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg
```

### Windows

Download from: https://ffmpeg.org/download.html

## Usage

```bash
npm run convert-videos
```

## What the Script Does

The conversion process:

1. **Scans** `public/movies/` for video files
2. **Creates** `public/movies/web-optimized/` output directory
3. **Converts** each video to MP4 (H.264) - Widely compatible, good compression

## Conversion Settings

### Video Settings

- **Codec**: H.264 (MP4)
- **Quality**: CRF 23 - Good quality/size balance
- **Resolution**: Max 1920x1080 (maintains aspect ratio)
- **Bitrate**: 2Mbps max
- **Preset**: Medium (good balance of speed/quality)

### Audio Settings

- **Codec**: AAC
- **Bitrate**: 128kbps

### Web Optimization

- **Fast Start**: Enables streaming playback
- **Pixel Format**: yuv420p for maximum compatibility
- **Aspect Ratio**: Preserved during scaling

## Supported Input Formats

- MOV, MP4, AVI, MKV, WMV, FLV, WebM, M4V

## Output Structure

```
public/movies/
├── original-video.mov
└── web-optimized/
    └── original-video.mp4
```

## Using Converted Videos in Your App

### HTML5 Video Element

```html
<video controls>
  <source src="/movies/web-optimized/video.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```

### Nuxt/Vue Component

```vue
<template>
  <video ref="videoRef" controls>
    <source :src="videoSource" type="video/mp4" />
  </video>
</template>

<script setup>
const videoSource =
  "/movies/web-optimized/Screen Recording 2025-07-29 at 23.49.15.mp4";
</script>
```

## Troubleshooting

### "ffmpeg not found"

Install ffmpeg using the instructions above.

### Large file sizes

Adjust the CRF values in the scripts:

- Lower CRF = higher quality, larger files
- Higher CRF = lower quality, smaller files

### Slow conversion

Change the preset from "medium" to "fast" for faster conversion (slightly larger files).
