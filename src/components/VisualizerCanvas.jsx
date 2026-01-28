import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { drawWaveform } from './visualizers/Waveform'
import { drawFrequencyBars } from './visualizers/FrequencyBars'
import { drawCircular } from './visualizers/Circular'
import { drawMinimalPulse } from './visualizers/MinimalPulse'
import { drawWaveformGentle, drawFlowingWave } from './visualizers/WaveformGentle'
import { drawCircularBreathe, drawOrbitalRings, drawSoftRipples } from './visualizers/CircularGentle'
import { drawBarsSmooth } from './visualizers/BarsSmooth'
import { drawMinimalCalm, drawFloatingDot, drawLinePulse } from './visualizers/MinimalCalm'

const VisualizerCanvas = forwardRef(({
  settings,
  analyser,
  getFrequencyData,
  getTimeDomainData,
  getAverageAmplitude,
  isPlaying,
  fullscreen = false
}, ref) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const imagesRef = useRef({
    background: null,
    logo: null,
    photo: null
  })
  
  // Expose canvas ref to parent
  useImperativeHandle(ref, () => canvasRef.current)
  
  // Canvas dimensions (16:9 aspect ratio for YouTube)
  const CANVAS_WIDTH = 1920
  const CANVAS_HEIGHT = 1080
  
  // Load images when settings change
  useEffect(() => {
    if (settings.backgroundImage) {
      const img = new Image()
      img.onload = () => { imagesRef.current.background = img }
      img.src = URL.createObjectURL(settings.backgroundImage)
    } else {
      imagesRef.current.background = null
    }
  }, [settings.backgroundImage])
  
  useEffect(() => {
    if (settings.logo) {
      const img = new Image()
      img.onload = () => { imagesRef.current.logo = img }
      img.src = URL.createObjectURL(settings.logo)
    } else {
      imagesRef.current.logo = null
    }
  }, [settings.logo])
  
  useEffect(() => {
    if (settings.photo) {
      const img = new Image()
      img.onload = () => { imagesRef.current.photo = img }
      img.src = URL.createObjectURL(settings.photo)
    } else {
      imagesRef.current.photo = null
    }
  }, [settings.photo])
  
  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      
      // 1. Draw background
      drawBackground(ctx, settings, imagesRef.current.background)
      
      // 2. Draw photo/avatar
      if (imagesRef.current.photo) {
        drawPhoto(ctx, settings, imagesRef.current.photo)
      }
      
      // 3. Draw visualization
      const frequencyData = getFrequencyData()
      const timeDomainData = getTimeDomainData()
      const amplitude = getAverageAmplitude()
      
      drawVisualization(ctx, settings, frequencyData, timeDomainData, amplitude, isPlaying)
      
      // 4. Draw logo
      if (imagesRef.current.logo) {
        drawLogo(ctx, settings, imagesRef.current.logo)
      }
      
      // 5. Draw text
      drawText(ctx, settings)
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(draw)
    }
    
    draw()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [settings, getFrequencyData, getTimeDomainData, getAverageAmplitude, isPlaying])

  // Fullscreen mode for OBS
  if (fullscreen) {
    return (
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain"
      />
    )
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
        style={{ aspectRatio: '16/9' }}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/30 text-lg">Preview - Play audio to see visualization</span>
        </div>
      )}
    </div>
  )
})

// Draw background (color, image, or transparent)
function drawBackground(ctx, settings, backgroundImage) {
  const { width, height } = ctx.canvas
  
  // If transparent mode, don't draw any background
  if (settings.transparentBackground) {
    return
  }
  
  if (backgroundImage) {
    // Draw image, cover the entire canvas
    const scale = Math.max(width / backgroundImage.width, height / backgroundImage.height)
    const x = (width - backgroundImage.width * scale) / 2
    const y = (height - backgroundImage.height * scale) / 2
    ctx.drawImage(backgroundImage, x, y, backgroundImage.width * scale, backgroundImage.height * scale)
  } else {
    // Fill with solid color
    ctx.fillStyle = settings.backgroundColor
    ctx.fillRect(0, 0, width, height)
  }
}

// Draw visualization based on selected style
function drawVisualization(ctx, settings, frequencyData, timeDomainData, amplitude, isPlaying) {
  const { width, height } = ctx.canvas
  
  // Calculate position
  let centerY
  switch (settings.visualizerPosition) {
    case 'top':
      centerY = height * 0.25
      break
    case 'bottom':
      centerY = height * 0.75
      break
    default: // center
      centerY = height * 0.5
  }
  
  const visualizerConfig = {
    centerX: width / 2,
    centerY,
    width: width * 0.8,
    height: height * 0.3,
    color: settings.visualizerColor,
    secondaryColor: settings.visualizerSecondaryColor,
    size: settings.visualizerSize / 100
  }
  
  // If not playing, show gentle static visualization
  if (!isPlaying) {
    const fakeAmplitude = 0.2
    const fakeFrequency = new Uint8Array(128).map((_, i) => 
      Math.sin(i * 0.1 + Date.now() / 1000) * 30 + 40
    )
    const fakeTimeDomain = new Uint8Array(256).map((_, i) =>
      128 + Math.sin(i * 0.05 + Date.now() / 1000) * 20
    )
    
    renderVisualization(ctx, settings.visualizerStyle, fakeFrequency, fakeTimeDomain, fakeAmplitude, visualizerConfig)
    return
  }
  
  renderVisualization(ctx, settings.visualizerStyle, frequencyData, timeDomainData, amplitude, visualizerConfig)
}

// Render the actual visualization based on style
function renderVisualization(ctx, style, frequencyData, timeDomainData, amplitude, config) {
  switch (style) {
    // Original styles
    case 'waveform':
      drawWaveform(ctx, timeDomainData, config)
      break
    case 'bars':
      drawFrequencyBars(ctx, frequencyData, config)
      break
    case 'circular':
      drawCircular(ctx, frequencyData, amplitude, config)
      break
    case 'minimal':
      drawMinimalPulse(ctx, amplitude, config)
      break
    
    // Gentle waveform styles
    case 'waveform-gentle':
      drawWaveformGentle(ctx, timeDomainData, config)
      break
    case 'waveform-flowing':
      drawFlowingWave(ctx, timeDomainData, config)
      break
    
    // Gentle circular styles
    case 'circular-breathe':
      drawCircularBreathe(ctx, frequencyData, amplitude, config)
      break
    case 'circular-orbital':
      drawOrbitalRings(ctx, frequencyData, amplitude, config)
      break
    case 'circular-ripples':
      drawSoftRipples(ctx, frequencyData, amplitude, config)
      break
    
    // Smooth bars
    case 'bars-smooth':
      drawBarsSmooth(ctx, frequencyData, config)
      break
    
    // Calm minimal styles
    case 'minimal-calm':
      drawMinimalCalm(ctx, amplitude, config)
      break
    case 'minimal-dot':
      drawFloatingDot(ctx, amplitude, config)
      break
    case 'minimal-line':
      drawLinePulse(ctx, amplitude, config)
      break
    
    default:
      drawWaveformGentle(ctx, timeDomainData, config)
  }
}

// Draw logo in specified position
function drawLogo(ctx, settings, logoImage) {
  const { width, height } = ctx.canvas
  const size = settings.logoSize * 2 // Scale for high-res canvas
  const padding = 40
  
  let x, y
  switch (settings.logoPosition) {
    case 'top-right':
      x = width - size - padding
      y = padding
      break
    case 'bottom-left':
      x = padding
      y = height - size - padding
      break
    case 'bottom-right':
      x = width - size - padding
      y = height - size - padding
      break
    case 'center':
      x = (width - size) / 2
      y = (height - size) / 2
      break
    default: // top-left
      x = padding
      y = padding
  }
  
  ctx.drawImage(logoImage, x, y, size, size)
}

// Draw photo/avatar
function drawPhoto(ctx, settings, photoImage) {
  const { width, height } = ctx.canvas
  const size = settings.photoSize * 2 // Scale for high-res canvas
  
  let x, y
  switch (settings.photoPosition) {
    case 'left':
      x = width * 0.2 - size / 2
      y = height / 2 - size / 2
      break
    case 'right':
      x = width * 0.8 - size / 2
      y = height / 2 - size / 2
      break
    default: // center
      x = (width - size) / 2
      y = (height - size) / 2 - 50
  }
  
  if (settings.photoCircular) {
    // Draw circular clipped photo
    ctx.save()
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(photoImage, x, y, size, size)
    ctx.restore()
    
    // Draw border
    ctx.strokeStyle = settings.visualizerColor
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.drawImage(photoImage, x, y, size, size)
  }
}

// Draw text overlays
function drawText(ctx, settings) {
  const { width, height } = ctx.canvas
  
  // Skip if no text
  if (!settings.title && !settings.subtitle) return
  
  let textY
  switch (settings.textPosition) {
    case 'top':
      textY = height * 0.15
      break
    case 'center':
      textY = height * 0.5
      break
    default: // bottom
      textY = height * 0.85
  }
  
  ctx.textAlign = 'center'
  ctx.fillStyle = settings.textColor
  
  // Draw title
  if (settings.title) {
    ctx.font = `600 ${settings.titleSize * 2}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    ctx.fillText(settings.title, width / 2, textY)
  }
  
  // Draw subtitle
  if (settings.subtitle) {
    ctx.font = `400 ${settings.subtitleSize * 2}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    ctx.fillStyle = settings.textColor + 'aa' // Slightly transparent
    ctx.fillText(settings.subtitle, width / 2, textY + settings.titleSize * 2 + 20)
  }
}

VisualizerCanvas.displayName = 'VisualizerCanvas'

export default VisualizerCanvas
