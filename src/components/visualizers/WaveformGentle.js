/**
 * Gentle Waveform Visualization
 * A smoother, calmer version of the waveform - less aggressive, more relaxing
 */

export function drawWaveformGentle(ctx, timeDomainData, config) {
  const { centerX, centerY, width, height, color, secondaryColor, size } = config
  
  // Full range like original waveform so sensitivity actually moves the chart; keep smooth curves for style
  const scaledHeight = height * size
  const points = []
  
  // Sample fewer points for smoother look
  const sampleRate = 4
  const numPoints = Math.floor(timeDomainData.length / sampleRate)
  
  for (let i = 0; i < numPoints; i++) {
    const dataIndex = i * sampleRate
    const v = (timeDomainData[dataIndex] - 128) / 128
    const x = centerX - width / 2 + (i / numPoints) * width
    const y = centerY + v * scaledHeight / 2
    points.push({ x, y })
  }
  
  // Draw smooth curve through points
  ctx.beginPath()
  
  // Create smooth gradient
  const gradient = ctx.createLinearGradient(
    centerX - width / 2, centerY,
    centerX + width / 2, centerY
  )
  gradient.addColorStop(0, 'transparent')
  gradient.addColorStop(0.2, color + '80')
  gradient.addColorStop(0.5, color)
  gradient.addColorStop(0.8, color + '80')
  gradient.addColorStop(1, 'transparent')
  
  ctx.strokeStyle = gradient
  ctx.lineWidth = 3 * size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // Use bezier curves for smoother lines
  if (points.length > 2) {
    ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
    }
    
    // Last two points
    const last = points.length - 1
    ctx.quadraticCurveTo(
      points[last - 1].x, points[last - 1].y,
      points[last].x, points[last].y
    )
  }
  
  ctx.stroke()
  
  // Subtle glow
  ctx.shadowColor = color
  ctx.shadowBlur = 15 * size
  ctx.stroke()
  ctx.shadowBlur = 0
  
  // Draw soft reflection below
  ctx.globalAlpha = 0.15
  ctx.beginPath()
  
  if (points.length > 2) {
    ctx.moveTo(points[0].x, centerY + (centerY - points[0].y) * 0.3)
    
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = centerY + (centerY - points[i].y) * 0.3
      const ycNext = centerY + (centerY - points[i + 1].y) * 0.3
      ctx.quadraticCurveTo(points[i].x, yc, xc, (yc + ycNext) / 2)
    }
  }
  
  ctx.strokeStyle = secondaryColor
  ctx.stroke()
  ctx.globalAlpha = 1
}

/**
 * Flowing Wave - Very gentle, like water
 */
export function drawFlowingWave(ctx, timeDomainData, config) {
  const { centerX, centerY, width, height, color, secondaryColor, size } = config
  const time = Date.now() / 2000 // Slow time factor
  
  // Calculate average amplitude
  let sum = 0
  for (let i = 0; i < timeDomainData.length; i++) {
    sum += Math.abs(timeDomainData[i] - 128)
  }
  const avgAmplitude = (sum / timeDomainData.length) / 128
  
  // Full range so loud = visible wave; gentle style from slow time + soft gradients
  const baseAmplitude = height * 0.4 * size
  const amplitude = baseAmplitude * (0.15 + avgAmplitude * 0.85)
  
  // Draw multiple flowing waves
  for (let wave = 0; wave < 3; wave++) {
    ctx.beginPath()
    
    const waveOffset = wave * 0.5
    const waveAlpha = 1 - wave * 0.3
    
    const gradient = ctx.createLinearGradient(
      centerX - width / 2, centerY,
      centerX + width / 2, centerY
    )
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(0.3, (wave % 2 === 0 ? color : secondaryColor) + Math.floor(waveAlpha * 180).toString(16).padStart(2, '0'))
    gradient.addColorStop(0.7, (wave % 2 === 0 ? color : secondaryColor) + Math.floor(waveAlpha * 180).toString(16).padStart(2, '0'))
    gradient.addColorStop(1, 'transparent')
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = (3 - wave * 0.5) * size
    
    const startX = centerX - width / 2
    ctx.moveTo(startX, centerY)
    
    for (let x = 0; x <= width; x += 5) {
      const progress = x / width
      const y = centerY + 
        Math.sin(progress * Math.PI * 3 + time + waveOffset) * amplitude * (0.5 + avgAmplitude * 0.5) +
        Math.sin(progress * Math.PI * 5 + time * 1.3 + waveOffset) * amplitude * 0.3
      
      ctx.lineTo(startX + x, y)
    }
    
    ctx.stroke()
  }
}
