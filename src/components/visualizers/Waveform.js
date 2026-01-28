/**
 * Waveform Visualization
 * Draws a horizontal audio wave that responds to the time-domain audio data
 */

export function drawWaveform(ctx, timeDomainData, config) {
  const { centerX, centerY, width, height, color, secondaryColor, size } = config
  
  const sliceWidth = width / timeDomainData.length
  const scaledHeight = height * size
  
  // Create gradient
  const gradient = ctx.createLinearGradient(
    centerX - width / 2, 
    centerY, 
    centerX + width / 2, 
    centerY
  )
  gradient.addColorStop(0, secondaryColor)
  gradient.addColorStop(0.5, color)
  gradient.addColorStop(1, secondaryColor)
  
  ctx.beginPath()
  ctx.strokeStyle = gradient
  ctx.lineWidth = 4 * size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  let x = centerX - width / 2
  
  for (let i = 0; i < timeDomainData.length; i++) {
    // Normalize value from 0-255 to -1 to 1
    const v = (timeDomainData[i] - 128) / 128
    const y = centerY + v * scaledHeight / 2
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    
    x += sliceWidth
  }
  
  ctx.stroke()
  
  // Draw glow effect
  ctx.shadowColor = color
  ctx.shadowBlur = 20 * size
  ctx.stroke()
  ctx.shadowBlur = 0
  
  // Draw mirrored wave (optional aesthetic)
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  x = centerX - width / 2
  
  for (let i = 0; i < timeDomainData.length; i++) {
    const v = (timeDomainData[i] - 128) / 128
    const y = centerY - v * scaledHeight / 2 // Inverted
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    
    x += sliceWidth
  }
  
  ctx.stroke()
  ctx.globalAlpha = 1
}
