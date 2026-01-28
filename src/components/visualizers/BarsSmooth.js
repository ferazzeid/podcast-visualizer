/**
 * Smooth Bars Visualization
 * Gentler, more elegant bar animations
 */

export function drawBarsSmooth(ctx, frequencyData, config) {
  const { centerX, centerY, width, height, color, secondaryColor, size } = config
  
  // Fewer bars for cleaner look
  const barCount = 32
  const totalWidth = width * 0.7
  const barWidth = (totalWidth / barCount) * 0.6
  const gap = (totalWidth / barCount) * 0.4
  // Full range so sensitivity moves bars; gentle style from rounded bars + easing
  const maxHeight = height * size
  
  // Sample and smooth the frequency data
  const step = Math.floor(frequencyData.length / barCount)
  const smoothedValues = []
  
  for (let i = 0; i < barCount; i++) {
    // Average nearby values for smoother appearance
    let sum = 0
    let count = 0
    for (let j = -2; j <= 2; j++) {
      const idx = (i + j) * step
      if (idx >= 0 && idx < frequencyData.length) {
        sum += frequencyData[idx]
        count++
      }
    }
    smoothedValues.push(count > 0 ? sum / count : 0)
  }
  
  const startX = centerX - totalWidth / 2
  
  for (let i = 0; i < barCount; i++) {
    const value = smoothedValues[i] / 255
    // Light easing for smooth look only; don't compress range
    const easedValue = Math.pow(value, 0.9)
    const barHeight = Math.max(easedValue * maxHeight, 4)
    
    const x = startX + i * (barWidth + gap)
    const y = centerY - barHeight / 2
    
    // Gradient for each bar
    const gradient = ctx.createLinearGradient(x, y + barHeight, x, y)
    
    // Fade edges
    const edgeFade = Math.min(i, barCount - 1 - i) / (barCount / 4)
    const alpha = Math.min(1, edgeFade + 0.3)
    
    gradient.addColorStop(0, secondaryColor + Math.floor(alpha * 100).toString(16).padStart(2, '0'))
    gradient.addColorStop(0.5, color + Math.floor(alpha * 200).toString(16).padStart(2, '0'))
    gradient.addColorStop(1, color + Math.floor(alpha * 150).toString(16).padStart(2, '0'))
    
    ctx.fillStyle = gradient
    
    // Rounded rectangle
    const radius = barWidth / 2
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + barWidth - radius, y)
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
    ctx.lineTo(x + barWidth, y + barHeight - radius)
    ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight)
    ctx.lineTo(x + radius, y + barHeight)
    ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()
  }
  
  // Subtle glow line at center
  const glowGradient = ctx.createLinearGradient(
    startX, centerY,
    startX + totalWidth, centerY
  )
  glowGradient.addColorStop(0, 'transparent')
  glowGradient.addColorStop(0.3, color + '30')
  glowGradient.addColorStop(0.5, color + '50')
  glowGradient.addColorStop(0.7, color + '30')
  glowGradient.addColorStop(1, 'transparent')
  
  ctx.strokeStyle = glowGradient
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(startX, centerY)
  ctx.lineTo(startX + totalWidth, centerY)
  ctx.stroke()
}
