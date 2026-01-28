/**
 * Circular Visualization
 * Draws a radial/circular visualizer that pulses with audio
 */

export function drawCircular(ctx, frequencyData, amplitude, config) {
  const { centerX, centerY, color, secondaryColor, size } = config
  
  const baseRadius = 150 * size
  const barCount = 180
  const maxBarHeight = 100 * size
  
  // Draw pulsing center circle
  const pulseRadius = baseRadius * (0.8 + amplitude * 0.4)
  
  // Outer glow
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, pulseRadius * 0.5,
    centerX, centerY, pulseRadius * 1.5
  )
  glowGradient.addColorStop(0, color + '40')
  glowGradient.addColorStop(1, 'transparent')
  
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, pulseRadius * 1.5, 0, Math.PI * 2)
  ctx.fill()
  
  // Inner circle with gradient
  const circleGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, pulseRadius
  )
  circleGradient.addColorStop(0, color + '60')
  circleGradient.addColorStop(0.7, secondaryColor + '40')
  circleGradient.addColorStop(1, color + '80')
  
  ctx.fillStyle = circleGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
  ctx.fill()
  
  // Draw frequency bars around the circle
  const step = Math.floor(frequencyData.length / barCount)
  
  for (let i = 0; i < barCount; i++) {
    const value = frequencyData[Math.floor(i * step)] || 0
    const normalizedValue = value / 255
    
    const barHeight = normalizedValue * maxBarHeight + 5
    const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2
    
    const innerRadius = baseRadius + 20
    const outerRadius = innerRadius + barHeight
    
    const x1 = centerX + Math.cos(angle) * innerRadius
    const y1 = centerY + Math.sin(angle) * innerRadius
    const x2 = centerX + Math.cos(angle) * outerRadius
    const y2 = centerY + Math.sin(angle) * outerRadius
    
    // Create gradient for bar
    const barGradient = ctx.createLinearGradient(x1, y1, x2, y2)
    barGradient.addColorStop(0, color)
    barGradient.addColorStop(1, secondaryColor)
    
    ctx.strokeStyle = barGradient
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  
  // Draw rotating ring
  ctx.strokeStyle = color + '60'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 20])
  ctx.beginPath()
  ctx.arc(centerX, centerY, baseRadius + maxBarHeight + 30, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
}
