# Podcast Visualizer

A browser-based tool for creating audio-reactive visualizations for your podcast. Works standalone or as an **OBS Browser Source** for live recording.

## Features

- **13 Visualization Styles**
  - **Gentle & Relaxed** (New!)
    - Gentle Wave - Smooth, calming waveform
    - Flowing Wave - Like water, very peaceful
    - Breathe - Soft pulsing circle
    - Orbital - Elegant rotating rings
    - Ripples - Water ripple effect
    - Smooth Bars - Refined bar animation
    - Calm - Subtle minimal pulse
    - Floating Dot - Single elegant dot
    - Line Pulse - Horizontal line pulse
  - **Original (Energetic)**
    - Waveform - Classic horizontal audio wave
    - Frequency Bars - Vertical equalizer bars
    - Circular - Radial with surrounding bars
    - Minimal Pulse - Pulsing rings with particles

- **Preset System**
  - Save your favorite configurations
  - Built-in professional presets
  - Quick-load saved settings

- **Auto-Save Settings**
  - Your settings persist between sessions
  - No need to reconfigure each time

- **Two Audio Modes**
  - **File Mode** - Upload an audio file for post-production
  - **Live Mic Mode** - Real-time visualization from your microphone

- **Full Customization**
  - Background color, image, or transparent (for OBS overlay)
  - Logo with position and size controls
  - Photo/avatar with circular crop option
  - Episode title and subtitle text
  - Color schemes for visualizations

- **OBS Integration**
  - Use as Browser Source in OBS
  - Transparent background for overlays
  - Auto-starts microphone in OBS mode
  - Layer over webcam, screen share, etc.

- **Export Options**
  - Direct video export (WebM format)
  - Fullscreen mode for screen recording

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A modern browser (Chrome, Firefox, Edge)

### Installation

```bash
# Navigate to the project folder
cd "Project Video Podcast Animation"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open in your browser at `http://localhost:5173`

## How to Use

### Standalone Mode (for post-production)
1. **Upload Audio** - Click "Upload Audio File" or drag-and-drop your podcast audio
2. **Customize** - Use the left panel to adjust visualization, colors, logo, etc.
3. **Preview** - Press play to see the visualization react to your audio
4. **Export** - Click "Export Video" to download as WebM

### Live Mic Mode (for preview)
1. Click the **Live Mic** button in the Audio Source section
2. Allow microphone access when prompted
3. Speak to see the visualization react in real-time
4. Use this to preview how your voice will look during recording

## OBS Setup (Recommended for Recording)

This is the best way to use the visualizer if you're already recording with OBS:

### Step 1: Add Browser Source
1. In OBS, click **+** under Sources
2. Select **Browser**
3. Name it "Podcast Visualizer"
4. Set the URL to: `http://localhost:5173?obs=true`
5. Set Width: **1920**, Height: **1080**

### Step 2: Enable Transparent Background
In the visualizer settings (left panel), enable **"Transparent (for OBS overlay)"** under Background. This lets you layer the visualization over your webcam or other sources.

### Step 3: Arrange Your Scene
- Put your webcam source below the visualizer
- The visualization will overlay on top
- Adjust positions in the visualizer settings as needed

### OBS Mode Features
- Automatically starts microphone capture
- No UI controls shown (clean view)
- Transparent background by default
- Reacts to your voice in real-time as you record

## Export Options

### Direct Export (Recommended)
Click the green "Export Video" button. The video will render while playing your audio and download automatically as a WebM file. This file can be uploaded directly to YouTube.

### Screen Recording
For more control or different formats:
1. Click "Fullscreen" to maximize the preview
2. Use OBS, Windows Game Bar, or QuickTime to record
3. Play your audio and let it record

## Browser Support

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14.1+

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Web Audio API
- Canvas API
- MediaRecorder API

## Tips

- For best quality, use high-resolution background images (1920x1080)
- Logo images with transparency (PNG) work best
- The visualization looks best with podcasts that have varied audio levels
- For long podcasts, screen recording may be more reliable than direct export

## Future Enhancements

- Transcription/captions overlay
- Save/load presets
- More visualization styles
- MP4 export (requires backend)
